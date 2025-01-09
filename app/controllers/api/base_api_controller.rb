# frozen_string_literal: true

module Api
  class BaseApiController < ActionController::API
    include ApiHelpers
  end
end
