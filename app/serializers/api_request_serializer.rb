# frozen_string_literal: true

class ApiRequestSerializer
  include JsonApi::Serializer

  type :api_requests

  attributes :path, :verb, :query, :response_status, :request_id,
              :ip, :dt, :query_count, :total_query_duration, :meta,
              :error_class, :error_message, :backtrace, :trace

  attribute :time do |record|
    record.time.to_f
  end

  attribute :dt do |record|
    record.dt.to_f
  end

  attribute :total_query_duration do |record|
    record.total_query_duration.to_f
  end
end
