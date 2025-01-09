# frozen_string_literal: true

module BackgroundJobs
  class ListHistory < BaseCommand
    protected

    def _execute
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      @bucket = TimespanHelper::TimeBucket.from_param_string(params[:bucket_size])

      # round to nearest second, we don't want fractional seconds to deal with
      start_time = start_time.round
      end_time = end_time.round

      success_counts = compute_counts(BackgroundJob.arel_table, start_time, end_time)
      error_counts = compute_counts(BackgroundJobError.arel_table, start_time, end_time)

      keys = success_counts.keys | error_counts.keys
      data = keys.map do |key|
        {
          time: key.to_i,
          success: success_counts[key].try(:[], 'cnt') || 0,
          error: error_counts[key].try(:[], 'cnt') || 0
        }
      end

      { data:, start_time:, end_time: }
    end

    def compute_counts(table, start_time, end_time)
      select_str = "time_bucket_gapfill('#{@bucket}', #{table.name}.time) AS bucket, COUNT(*) AS cnt"

      q = table.project(select_str)
      q = q.where(table[:time].gteq(start_time))
            .where(table[:time].lteq(end_time))
            .group(:bucket)
      data = ActiveRecord::Base.connection.execute(q.to_sql)
      data.index_by { |e| e['bucket'] }
    end
  end
end
