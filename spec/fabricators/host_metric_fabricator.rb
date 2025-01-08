# frozen_string_literal: true

Fabricator(:host_metric) do
  project
  time { rand(100).seconds.ago }
  total_system_mem { rand(10_000..19_999) }
  free_system_mem { rand(10_000..19_999) }
  pct_free_system_mem { rand(0..100) }
  system_pct_cpu { rand(0..100) }
  total_hdd { rand(10_000..19_999) }
  free_hdd { rand(10_000..19_999) }
  postgres_pct_cpu { rand(0..100) }
  postgres_pct_mem { rand(0..100) }
  ruby_pct_cpu { rand(0..100) }
  ruby_pct_mem { rand(0..100) }
  nginx_pct_cpu { rand(0..100) }
  nginx_pct_mem { rand(0..100) }
  elasticsearch_pct_cpu { rand(0..100) }
  elasticsearch_pct_mem { rand(0..100) }
  redis_pct_cpu { rand(0..100) }
  redis_pct_mem { rand(0..100) }
end
