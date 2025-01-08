# frozen_string_literal: true

class BackgroundJobErrorSerializer
  include JsonApi::Serializer

  type :background_job_errors

  attributes :job_class, :request_id, :jid, :error_class, :error_message, :backtrace

  attribute :time do |record|
    record.time.to_f
  end
end
