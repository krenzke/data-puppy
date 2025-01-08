# frozen_string_literal: true

class Deployment < ApplicationRecord
  include TimespanRecord

  belongs_to :project
end
