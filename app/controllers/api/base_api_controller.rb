# frozen_string_literal: true

module Api
  class BaseApiController < ApplicationController
    include ApiHelpers

    before_action :load_project

    protected

    def load_project
      @project ||= Project.find_by!(slug: params[:project_id])
    end

    def params_with_project
      params.merge(project: @project)
    end
  end
end
