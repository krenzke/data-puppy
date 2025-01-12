# frozen_string_literal: true

module Deployments
  class ListDeployments < BaseCommand
    protected

    def _execute
      deployments = params[:project].deployments.page(page).per(per_page)
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])
      deployments = deployments.for_timespan(start_time, end_time)

      { deployments:, start_time:, end_time: }
    end
  end
end
