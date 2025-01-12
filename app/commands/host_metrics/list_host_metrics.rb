# frozen_string_literal: true

module HostMetrics
  class ListHostMetrics < BaseCommand
    DEFAULT_MIN_SPACING = 30 # seconds

    protected

    def _execute
      # params[:min_sample_spacing] (in seconds)
      min_spacing = params[:min_sample_spacing].present? && params[:min_sample_spacing].to_i >= DEFAULT_MIN_SPACING ? params[:min_sample_spacing].to_i : DEFAULT_MIN_SPACING
      start_time, end_time = TimespanHelper.convert_timespan_to_times(params[:span_type], params[:start_date], params[:end_date])

      metrics = if min_spacing != DEFAULT_MIN_SPACING
                  # downsample accordingly
                  downsampled_query(start_time:, end_time:, min_spacing:)
                else
                  params[:project].host_metrics.page(page)
                                        .per(per_page).order(time: :asc)
                                        .for_timespan(start_time, end_time)
                end

      { metrics:, start_time:, end_time: }
    end

    def downsampled_query(start_time:, end_time:, min_spacing:)
      # Build CTE
      # SELECT *, row_number() OVER (ORDER BY "host_metrics"."time") AS row_number
      # FROM "host_metrics"
      # WHERE "host_metrics"."time" >= '?'
      #   AND "host_metrics"."time" <= '?'
      t = HostMetric.arel_table
      cte = t.project(Arel.star, Arel::Nodes::NamedFunction.new('row_number', [])
                      .over(Arel::Nodes::Window.new.order(t[:time]))
                      .as('row_number')).where(t[:time]
              .gteq(start_time))
              .where(t[:time]
              .lteq(end_time))
              .where(t[:project_id].eq(params[:project].id))
      with_clause = Arel::Nodes::As.new(t, cte)

      # Build downsampling condition (pluck every n-th row)
      # WHERE ("host_metrics"."row_number" - 1) % n = 0
      n = (min_spacing / DEFAULT_MIN_SPACING).ceil
      row_number_condition = Arel::Nodes::InfixOperation.new(
        '%', Arel::Nodes::Grouping.new(
                Arel::Nodes::Subtraction.new(t[:row_number], 1)
              ), n
      ).eq(0)

      # get total count first
      q_count = HostMetric
                .select(Arel.star.count).arel
                .with(with_clause)
                .where(row_number_condition)
      total_count = ActiveRecord::Base.connection.execute(q_count.to_sql).first['count']

      # get array of records and 'paginate' them
      q_records = HostMetric
                  .select(Arel.star, 'row_number').arel
                  .with(with_clause)
                  .where(row_number_condition)
                  .take(per_page)
                  .skip(per_page * (page - 1))

      records = HostMetric.find_by_sql(q_records)
      Kaminari.paginate_array(records, total_count:).page(page).per(per_page)
    end
  end
end
