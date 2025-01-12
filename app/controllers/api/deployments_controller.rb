# frozen_string_literal: true

module Api
  class DeploymentsController < BaseApiController
    def index
      result = Deployments::ListDeployments.new(params: params_with_project).execute
      meta = extract_pagination_meta(result[:deployments])
              .merge(start_time: result[:start_time].to_f, end_time: result[:end_time].to_f)
      render json: DeploymentSerializer.new(result[:deployments],
                                                      relationships_to_include: include_param,
                                                      fields: fields_param, is_collection: true, meta:).serialize
    end
  end
end