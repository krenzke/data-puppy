# frozen_string_literal: true

class BackgroundJobSerializer
  include JsonApi::Serializer

  type :background_jobs

  attributes :job_class, :request_id, :jid, :job_args

  attribute :time do |record|
    record.time.to_f
  end

  attribute :dt do |record|
    record.dt.to_f
  end
end
