# frozen_string_literal: true

Fabricator(:deployment) do
  project
  time { rand(100).seconds.ago }
  branch { 'main' }
  sha { Digest::SHA1.hexdigest(SecureRandom.hex) }
  release { rand(1_000).seconds.ago.strftime('%Y%m%d%H%M%S') }
  deployer { 'krenzke' }
end
