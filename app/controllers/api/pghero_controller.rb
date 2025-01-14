# frozen_string_literal: true

module Api
  class PgheroController < BaseApiController
    skip_forgery_protection only: [:explain_analyze_query]

    before_action :build_database_connection

    def index
      unused_indexes = @pghero_db.unused_indexes(max_scans: 0)
      unused_index_names = Set.new(unused_indexes.map { |r| r[:index] })

      @summary_data = {
        numConnections: @pghero_db.connection_states.values.sum,
        maxConnections: @pghero_db.settings[:max_connections].to_i,
        dbSize: @pghero_db.raw_database_size,
        relationSummaries: @pghero_db.relation_sizes.map do |rs|
          {
            name: rs[:relation],
            size: rs[:size_bytes],
            type: rs[:type],
            used: !unused_index_names.include?(rs[:relation])
          }
        end
      }
      respond_to do |format|
        format.json do
          render json: @summary_data
        end
        format.html {}
      end
    end

    def queries
      respond_to do |format|
        format.json do
          data = {
            liveQueries: params[:live] ? live_queries : nil,
            historicalQueries: params[:historical] ? historical_queries : nil
          }
          render json: data.reject { |_k, v| v.nil? }
        end
        format.html do
          @live_queries = live_queries
          @historical_queries = historical_queries
        end
      end
    end

    def explain; end

    def explain_analyze_query
      prefix = params[:analyze] ? 'ANALYZE ' : ''
      explanation = @pghero_db.explain("#{prefix}#{params[:query]}")
      render json: { explanation: }
    rescue StandardError => e
      render json: {
        explanation: "Error: #{e.message}"
      }
    end

    protected

    def live_queries
      @pghero_db.running_queries(all: true)
    end

    def historical_queries
      sort = case params[:sort]
             when 'average_time' then 'average_time'
             when 'calls' then 'calls'
             end

      @pghero_db.query_stats(
        historical: true,
        start_at: 1.day.ago,
        end_at: nil,
        sort:,
        min_average_time: 0.1,
        min_calls: nil
      ).reject do |q|
        q[:query].ends_with?('/*pghero*/')
      end
    end

    def build_database_connection
      return @pghero_db if defined?(@pghero_db)

      @project = Project.find_by!(slug: params[:project_id])
      @pghero_db = PgHero::Database.new('primary', { url: @project.database_url })
      @pghero_db.establish_connection(@project.database_url) # need this as well since PgHero::Database wasn't connecting automatically as expected
    end
  end
end
