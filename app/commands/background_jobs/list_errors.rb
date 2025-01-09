# frozen_string_literal: true

module BackgroundJobs
  class ListErrors < BaseCommand
    protected

    def _execute
      background_job_errors = BackgroundJobError.page(page).per(per_page)
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      background_job_errors = background_job_errors.for_timespan(start_time, end_time)
      background_job_errors = background_job_errors.where(job_class: params[:job_class]) if params[:job_class].present?
      background_job_errors = background_job_errors.order(time: :desc)

      { background_job_errors:, start_time:, end_time: }
    end
  end
end
