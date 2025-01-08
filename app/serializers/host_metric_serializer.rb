# frozen_string_literal: true

class HostMetricSerializer
  include JsonApi::Serializer

  type :host_metrics

  %i[
    time
    pct_free_system_mem
    system_pct_cpu
    postgres_pct_cpu
    postgres_pct_mem
    ruby_pct_cpu
    ruby_pct_mem
    nginx_pct_cpu
    nginx_pct_mem
    elasticsearch_pct_cpu
    elasticsearch_pct_mem
    redis_pct_cpu
    redis_pct_mem
  ].each do |attr|
    attribute attr do |record|
      record.send(attr).to_f
    end
  end

  # hdd is given in 1k blocks by `df`
  %i[
    total_hdd
    free_hdd
  ].each do |attr|
    attribute attr do |record|
      record.send(attr).to_f * 1024
    end
  end

  # system memory is given in mebibytes due to `-m` option
  %i[
    total_system_mem
    free_system_mem
  ].each do |attr|
    attribute attr do |record|
      record.send(attr).to_f * 1_048_576
    end
  end
end
