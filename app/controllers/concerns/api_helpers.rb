# frozen_string_literal: true

module ApiHelpers
  extend ActiveSupport::Concern

  protected

  def fields_param
    JsonApi::Serializer.convert_fields_params(params[:fields] || {})
  end

  def include_param
    JsonApi::Serializer.convert_included_params(params[:include] || '')
  end

  # def render_error(exception)
  #   if exception.is_a?(ActiveRecord::RecordNotFound)
  #     # TODO: don't special case this? some how either wrap it in a
  #     # CommandError, or have separate error serializers for it?
  #     render json: { code: 'not_found' }, status: :not_found
  #   else
  #     serializer = ErrorSerializer.new(exception)
  #     render json: serializer.serialize, status: serializer.http_status
  #   end
  # end

  def extract_pagination_meta(collection)
    {
      curr_page: collection.current_page,
      max_page: collection.total_pages,
      next_page: collection.next_page,
      prev_page: collection.prev_page,
      per_page: collection.limit_value,
      record_count: collection.total_count
    }
  end

  # def set_request_attribute
  #   Current.request_id = request.uuid
  #   Current.user_agent = request.user_agent
  #   Current.ip_address = request.ip
  # end
end
