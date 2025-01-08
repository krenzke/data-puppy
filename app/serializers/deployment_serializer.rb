# frozen_string_literal: true

class DeploymentSerializer
  include JsonApi::Serializer

  type :deployments

  attributes :branch, :sha, :release, :deployer

  attribute :time do |record|
    record.time.to_f
  end
end
