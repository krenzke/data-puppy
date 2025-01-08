class PagesController < ApplicationController
  layout 'no_project', only: :no_project

  def index
    @project = Project.find_by(slug: params[:project_id])
    redirect_to root_path unless @project.present?
  end

  def no_project
    @projects = Project.order(name: :asc)
  end
end