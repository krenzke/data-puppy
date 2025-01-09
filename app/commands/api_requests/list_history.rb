# frozen_string_literal: true

module ApiRequests
  class ListHistory < BaseCommand
    STATUS_CASE_CLAUSE = <<~SQL1
      case
          when response_status >= 100 and response_status <= 199 then '1xx'
          when response_status >= 200 and response_status <= 299 then '2xx'
          when response_status >= 300 and response_status <= 399 then '3xx'
          when response_status >= 400 and response_status <= 499 then '4xx'
          when response_status >= 500 and response_status <= 599 then '5xx'
          else 'unknown'
      end
    SQL1

    protected

    def _execute
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      @bucket = TimespanHelper::TimeBucket.from_param_string(params[:bucket_size])

      # round to nearest second, we don't want fractional seconds to deal with
      start_time = start_time.round
      end_time = end_time.round

      data = if sanitized_group_by == 'response_status'
                compute_response_status_group_data(start_time, end_time)
              else
                compute_error_group_data(start_time, end_time)
              end

      { data:, start_time:, end_time: }
    end

    def compute_response_status_group_data(start_time, end_time)
      request_table = ApiRequest.arel_table

      select_str = "time_bucket_gapfill('#{@bucket}', api_requests.time) AS bucket, #{STATUS_CASE_CLAUSE} AS status, COUNT(*) AS cnt"

      q = request_table.project(select_str)
      q = q.where(request_table[:time].gteq(start_time))
            .where(request_table[:time].lteq(end_time))
            .group(:bucket, :status)
      data = ActiveRecord::Base.connection.execute(q.to_sql)

      # time_bucket_gapfill doesn't return anything if there are no
      # data points in the entire range. so we need to construct
      # the timestamps manually in this case
      timestamps = if data.count.zero?
                      TimespanHelper.timestamps_for_dates(start_time:, end_time:, bucket: @bucket)
                    else
                      data.map { |e| e['bucket'] }.uniq.sort
                    end
      data = data.index_by { |e| [e['bucket'], e['status']] }
      timestamps.map do |t|
        {
          time: t.to_i,
          '1xx' => data[[t, '1xx']].try(:[], 'cnt') || 0,
          '2xx' => data[[t, '2xx']].try(:[], 'cnt') || 0,
          '3xx' => data[[t, '3xx']].try(:[], 'cnt') || 0,
          '4xx' => data[[t, '4xx']].try(:[], 'cnt') || 0,
          '5xx' => data[[t, '5xx']].try(:[], 'cnt') || 0
        }
      end
    end

    def compute_error_group_data(start_time, end_time)
      request_table = ApiRequest.arel_table

      select_str = "time_bucket_gapfill('#{@bucket}', api_requests.time) as bucket, COUNT(DISTINCT api_requests.*) AS cnt"

      q = request_table.project(select_str)
      q = q.where(request_table[:time].gteq(start_time))
            .where(request_table[:time].lteq(end_time))
            .group(:bucket)

      q_success = q.clone.where(request_table[:error_class].eq(nil))
      q_fail = q.clone.where(request_table[:error_class].not_eq(nil))

      success_counts = ActiveRecord::Base.connection.execute(q_success.to_sql)
      error_counts = ActiveRecord::Base.connection.execute(q_fail.to_sql)

      # time_bucket_gapfill doesn't return anything if there are no
      # data points in the entire range. so we need to construct
      # the timestamps manually in this case
      timestamps = if success_counts.count.zero?
                      TimespanHelper.timestamps_for_dates(start_time:, end_time:, bucket: @bucket)
                    else
                      success_counts.map { |e| e['bucket'] }.uniq.sort
                    end

      success_counts = success_counts.index_by { |e| e['bucket'] }
      error_counts = error_counts.index_by { |e| e['bucket'] }
      timestamps.map do |t|
        {
          time: t.to_i,
          success: success_counts[t].try(:[], 'cnt') || 0,
          error: error_counts[t].try(:[], 'cnt') || 0
        }
      end
    end

    def sanitized_group_by
      {
        'response_status' => 'response_status',
        'error' => 'error'
      }[params[:group_by]] || 'response_status'
    end
  end
end
