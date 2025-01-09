# frozen_string_literal: true

module TimespanHelper
  class TimeBucket
    INTERVAL_REGEX = /^(\d+)([smhd])$/
    INTERVAL_MAP = {
      's' => :second,
      'm' => :minute,
      'h' => :hour,
      'd' => :day
    }.freeze

    attr_reader :size, :unit

    def self.from_param_string(s)
      m = INTERVAL_REGEX.match(s)
      new(m[1].to_i, INTERVAL_MAP[m[2]])
    end

    def initialize(size, unit)
      raise ArgumentError, 'Invalid bucket unit' unless %i[second minute hour day].include?(unit)

      @size = size
      @unit = unit
    end

    def to_s
      "#{size} #{unit}"
    end

    def interval
      size.send(unit)
    end

    def start_of_interval_method_name
      {
        second: :itself,
        minute: :beginning_of_minute,
        hour: :beginning_of_hour,
        day: :beginning_of_day
      }[unit]
    end
  end

  class << self
    def convert_timespan_to_times(span_type = 'prev_day', start_date = nil, end_date = nil)
      now = Time.now.utc
      t_start, t_end = case span_type
                       when 'prev_hour' then [1.hour.ago, now]
                       when 'prev_8_hours' then [8.hours.ago, now]
                       when 'prev_day' then [1.day.ago, now]
                       when 'prev_2_days' then [2.days.ago, now]
                       when 'prev_week' then [1.week.ago, now]
                       when 'prev_month' then [1.month.ago, now]
                       when 'custom'
                         [
                           param_to_date(start_date) || 1.hour.ago,
                           param_to_date(end_date) || now
                         ]
                       else
                         [1.day.ago, now]
                       end
      [t_start, t_end]
    end

    def timestamps_for_dates(start_time:, end_time:, bucket:)
      start_time = start_time.send(bucket.start_of_interval_method_name)
      interval = bucket.interval

      ((end_time - start_time) / interval + 1).floor.times.map do |i|
        start_time + i * interval
      end
    end

    private

    def param_to_date(s)
      return Time.zone.at(s) if s.is_a?(Numeric)
      return s if s.respond_to?(:strftime) # already a date-like thing

      unix_timestamp = begin
        Float(s)
      rescue StandardError
        nil
      end
      return Time.zone.at(unix_timestamp) if unix_timestamp

      Time.zone.parse(s)
    end
  end
end
