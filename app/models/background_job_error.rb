# frozen_string_literal: true

class BackgroundJobError < ApplicationRecord
  include TimespanRecord

  belongs_to :api_request, foreign_key: :request_id, optional: true
  belongs_to :project
end