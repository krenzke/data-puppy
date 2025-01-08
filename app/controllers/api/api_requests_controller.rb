# frozen_string_literal: true

module Api
  class ApiRequestsController < BaseApiController
    def index
      result = ApiRequests::ListApiRequests.new(params:).execute
      meta = extract_pagination_meta(result[:api_requests])
             .merge(start_time: result[:start_time].to_f, end_time: result[:end_time].to_f)
      render json: ::ApiRequestSerializer.new(result[:api_requests],
                                                     relationships_to_include: include_param,
                                                     fields: fields_param, is_collection: true, meta:).serialize
    end

    def history
      result = ApiRequests::ListHistory.new(params:).execute
      meta = { start_time: result[:start_time].to_f, end_time: result[:end_time].to_f }
      render json: { data: result[:data], meta: }
    end

    def latency_history
      result = ApiRequests::ListLatencyHistory.new(params:).execute
      meta = { start_time: result[:start_time].to_f, end_time: result[:end_time].to_f }
      render json: { data: result[:data], meta: }
    end

    def show
      respond_to do |format|
        format.html {}
        format.json do
          result = ApiRequests::GetRequestDetails.new(params:).execute
          render json: {
            api_request: ApiRequestSerializer.new(result[:api_request]).serialize[:data],
            background_jobs: BackgroundJobSerializer.new(result[:background_jobs], is_collection: true).serialize[:data],
            background_job_errors: BackgroundJobErrorSerializer.new(result[:background_job_errors], is_collection: true).serialize[:data]
          }
        end
      end
    end
  end
end
