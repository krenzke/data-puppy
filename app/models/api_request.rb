# frozen_string_literal: true

class ApiRequest < ApplicationRecord
  include TimespanRecord

  has_many :background_jobs, foreign_key: :request_id, primary_key: :request_id, dependent: :destroy
  has_many :background_job_errors, foreign_key: :request_id, primary_key: :request_id, dependent: :destroy
  belongs_to :project
end
