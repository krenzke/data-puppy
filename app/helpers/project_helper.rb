module ProjectHelper
  def serialize_project(project)
    data = project.attributes.slice(*%w[id slug name])
    data[:has_pghero] = project.database_url.present?
    data[:has_sidekiq] = project.redis_url.present?

    data.as_json
  end

  def project_selector(projects, selected)
    tag.select(class: 'px-2 py-1 bg-white border cursor-pointer border-slate-200', id: 'project-selector') do
      projects.map do |project|
        # tag.option(project.name, {value: project.id, selected: project == selected, data: {url: project_root_path(project)}})
        concat tag.option(project.name, value: project.id, selected: project == selected, data: {url: project_root_path(project_id: project.slug)})
      end
    end
  end
end