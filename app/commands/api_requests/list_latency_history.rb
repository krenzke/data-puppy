# frozen_string_literal: true

module ApiRequests
  class ListLatencyHistory < BaseCommand
    protected

    def _execute
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      @bucket = TimespanHelper::TimeBucket.from_param_string(params[:bucket_size])

      # round to nearest second, we don't want fractional seconds to deal with
      start_time = start_time.round
      end_time = end_time.round

      request_table = ApiRequest.arel_table

      select_str = "time_bucket_gapfill('#{@bucket}', api_requests.time) AS bucket,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY dt) AS p50,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY dt) AS p95,
      percentile_cont(0.99) WITHIN GROUP (ORDER BY dt) AS p99"

      q = request_table.project(select_str)
                        .where(request_table[:time].gteq(start_time))
                        .where(request_table[:time].lteq(end_time))
                        .where(request_table[:project_id].eq(params[:project].id))
                        .group(:bucket)
      raw_data = ActiveRecord::Base.connection.execute(q.to_sql)

      # time_bucket_gapfill doesn't return anything if there are no
      # data points in the entire range. so we need to construct
      # the timestamps manually in this case
      timestamps = if raw_data.count.zero?
                      TimespanHelper.timestamps_for_dates(start_time:, end_time:, bucket: @bucket)
                    else
                      raw_data.map { |e| e['bucket'] }.uniq.sort
                    end
      raw_data = raw_data.index_by { |e| e['bucket'] }
      data = timestamps.map do |t|
        {
          time: t.to_i,
          'p50' => (raw_data[t].try(:[], 'p50') || 0) * 1000, # convert sec to ms
          'p95' => (raw_data[t].try(:[], 'p95') || 0) * 1000,
          'p99' => (raw_data[t].try(:[], 'p99') || 0) * 1000
        }
      end

      { data:, start_time:, end_time: }
    end
  end
end
