# frozen_string_literal: true

Fabricator(:background_job) do
  project
  time { rand(100).seconds.ago }
  dt { rand }
  jid { SecureRandom.hex(12) }
  job_args { %w[foo bar] }
  job_class { %w[SlowJob FastJob].sample }
  request_id { SecureRandom.uuid }
end
