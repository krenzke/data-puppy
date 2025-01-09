# frozen_string_literal: true

module BackgroundJobs
  class ListJobs < BaseCommand
    protected

    def _execute
      background_jobs = BackgroundJob.page(page).per(per_page)
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      background_jobs = background_jobs.for_timespan(start_time, end_time)

      background_jobs = background_jobs.where(job_class: params[:job_class]) if params[:job_class].present?
      background_jobs = background_jobs.where('dt >= ?', params[:min_duration]) if params[:min_duration].present?
      background_jobs = background_jobs.where('dt <= ?', params[:max_duration]) if params[:max_duration].present?

      # ["time", "duration", "query_count"]
      background_jobs = case params[:sort]
                        when 'duration'
                          background_jobs.order(dt: :desc)
                        else
                          background_jobs.order(time: :desc)
                        end

      { background_jobs:, start_time:, end_time: }
    end
  end
end
