module ProjectHelper
  def serialize_project(project)
    data = project.attributes.slice(*%w[id slug name])
    data[:has_pghero] = project.database_url.present?
    data[:has_sidekiq] = project.redis_url.present?

    data.as_json
  end
end