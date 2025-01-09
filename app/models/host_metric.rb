# frozen_string_literal: true

class HostMetric < ApplicationRecord
  include TimespanRecord

  belongs_to :project
end
