# frozen_string_literal: true

class Project < ApplicationRecord
  has_many :api_requests, primary_key: :request_id, dependent: :destroy
  has_many :background_jobs, through: :api_requests
  has_many :background_job_errors, through: :api_requests
  has_many :deployments, dependent: :destroy
  has_many :host_metrics, dependent: :destroy

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true, format: { with: /\A[a-zA-Z\-]+\z/ }
end
