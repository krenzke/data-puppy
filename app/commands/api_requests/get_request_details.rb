# frozen_string_literal: true

module ApiRequests
  class GetRequestDetails < BaseCommand
    protected

    def _execute
      request_id = params[:id] || params[:request_id]
      project = params[:project]
      api_request = project.api_requests.where(request_id:).first
      background_jobs = project.background_jobs.where(request_id:)
      background_job_errors = project.background_job_errors.where(request_id:)

      {
        api_request:,
        background_jobs:,
        background_job_errors:
      }
    end
  end
end
