# frozen_string_literal: true

Fabricator(:api_request) do
  transient :with_error
  transient :with_trace

  project
  time { rand(100).seconds.ago }
  path { ['/api/recipes', '/api/ingredients', '/api/categories', '/api/recipes/meatloaf'].sample }
  verb { %w[GET POST PUT DELETE].sample }
  response_status { [200, 400, 500].sample }
  request_id { SecureRandom.uuid }
  dt { rand }
  query_count { rand(20) }
  total_query_duration { rand * 100 }

  after_create do |api_request, transients|
    if transients[:with_error]
      ApiRequest
        .where(request_id: api_request.request_id)
        .update_all({
                      error_class: %w[StandardError ArgumentError].sample,
                      error_message: FFaker::Lorem.sentence,
                      backtrace: 4.times.map { FFaker::Lorem.sentence }
                    })
    end

    if transients[:with_trace]
      ApiRequest
        .where(request_id: api_request.request_id)
        .update_all({
                      trace: [{ id: 123, name: 'span1', time: 123, duration: 123 }]
                    })
    end
  end
end
