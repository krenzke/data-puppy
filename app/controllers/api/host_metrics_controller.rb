# frozen_string_literal: true

module Api
  class HostMetricsController < BaseApiController
    def index
      result = HostMetrics::ListHostMetrics.new(params:).execute
      meta = extract_pagination_meta(result[:metrics])
             .merge(start_time: result[:start_time].to_f, end_time: result[:end_time].to_f)
      render json: HostMetricSerializer.new(result[:metrics],
                                                     relationships_to_include: include_param,
                                                     fields: fields_param, is_collection: true, meta:).serialize
    end
  end
end
