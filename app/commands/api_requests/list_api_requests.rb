# frozen_string_literal: true

module ApiRequests
  class ListApiRequests < BaseCommand
    STATUS_MAP = {
      '1xx' => (100..199),
      '2xx' => (200..299),
      '3xx' => (300..399),
      '4xx' => (400..499),
      '5xx' => (500..599)
    }.freeze

    protected

    def _execute
      # path: string;
      # min_duration_ms: number;
      # max_duration_ms: number | null;
      # verbs: string[];
      # statuses: string[];
      # span_type: string;
      # start_date: number | null;
      # end_date: number | null;
      # sort: string;
      api_requests = params[:project].api_requests.page(page).per(per_page)
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      api_requests = api_requests.for_timespan(start_time, end_time)

      min_duration_ms = ParamHelpers.convert_to_numeric(params[:min_duration_ms])
      max_duration_ms = ParamHelpers.convert_to_numeric(params[:max_duration_ms])

      api_requests = api_requests.where(error_class: params[:error_class]) if params[:error_class].present?
      api_requests = api_requests.where.not(trace: nil) if params[:with_trace].present?
      api_requests = api_requests.where.not(error_class: nil) if params[:with_error].present?
      api_requests = api_requests.where(path: params[:path]) if params[:path].present?
      api_requests = api_requests.where('dt >= ?', min_duration_ms / 1000) if min_duration_ms
      api_requests = api_requests.where('dt <= ?', max_duration_ms / 1000) if max_duration_ms
      api_requests = api_requests.where(verb: params[:verbs]) if params[:verbs].present?
      api_requests = api_requests.where(response_status: statuses_to_range(params[:statuses])) if params[:statuses].present?

      # ["time", "duration", "query_count"]
      api_requests = case params[:sort]
                      when 'duration'
                        api_requests.order(dt: :desc)
                      when 'query_count'
                        api_requests.order(query_count: :desc)
                      else
                        api_requests.order(time: :desc)
                      end

      { api_requests:, start_time:, end_time: }
    end

    def statuses_to_range(statuses)
      statuses.map do |status|
        STATUS_MAP[status]
      end.compact
    end
  end
end
