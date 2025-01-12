# frozen_string_literal: true

class Project < ApplicationRecord
  has_many :api_requests
  has_many :background_jobs
  has_many :background_job_errors
  has_many :deployments
  has_many :host_metrics

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true, format: { with: /\A[a-zA-Z\-]+\z/ }

  before_destroy :destroy_dependents

  protected

  def destroy_dependents
    ApiRequest.where(project_id: id).delete_all
    BackgroundJob.where(project_id: id).delete_all
    BackgroundJobError.where(project_id: id).delete_all
    Deployment.where(project_id: id).delete_all
    HostMetric.where(project_id: id).delete_all
  end
end
