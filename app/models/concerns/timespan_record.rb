# frozen_string_literal: true

module TimespanRecord
  extend ActiveSupport::Concern

  module ClassMethods
    def for_timespan(t_start, t_end)
      time_col = arel_table[:time]
      q = self
      q = q.where(time_col.gteq(t_start)) if t_start
      q = q.where(time_col.lteq(t_end)) if t_end
      q
    end
  end
end
