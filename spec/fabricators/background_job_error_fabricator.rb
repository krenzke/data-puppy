# frozen_string_literal: true

Fabricator(:background_job_error) do
  project
  time { rand(100).seconds.ago }
  job_class { %w[SlowJob FastJob].sample }
  jid { SecureRandom.hex(12) }
  error_class { %w[StandardError ArgumentError].sample }
  error_message { FFaker::Lorem.sentence }
  request_id { SecureRandom.uuid }
  backtrace { 4.times.map { FFaker::Lorem.sentence } }
end
