# frozen_string_literal: true

module ApiRequests
  class GetRequestDetails < BaseCommand
    protected

    def _execute
      request_id = params[:request_id]
      api_request = ApiRequest.where(request_id:).first
      background_jobs = BackgroundJob.where(request_id:)
      background_job_errors = BackgroundJobError.where(request_id:)

      {
        api_request:,
        background_jobs:,
        background_job_errors:
      }
    end
  end
end
