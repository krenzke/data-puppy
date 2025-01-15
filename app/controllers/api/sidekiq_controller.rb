# frozen_string_literal: true

require 'sidekiq/api'
require 'sidekiq/paginator'

module Api
  class SidekiqController < BaseApiController
    PER_PAGE = 20
    include Sidekiq::Paginator
    skip_forgery_protection only: %i[update update_all clear_queue remove_job_from_queue]

    around_action :with_redis_connection

    UPDATE_MAP = {
      scheduled: %w[delete add_to_queue],
      retry: %w[delete retry kill],
      dead: %w[delete retry]
    }.freeze

    UPDATE_ALL_MAP = {
      retry: %w[clear retry_all kill_all],
      dead: %w[clear retry_all]
    }.freeze

    # basic routes that just do nothing
    %i[retries scheduled busy dead show_job].each do |n|
      define_method(n) {}
    end

    def index
      respond_to do |format|
        format.html {}
        format.json do
          result = BackgroundJobs::ListJobs.new(params: params_with_project).execute
          meta = extract_pagination_meta(result[:background_jobs])
                 .merge(start_time: result[:start_time].to_f, end_time: result[:end_time].to_f)
          render json: BackgroundJobSerializer.new(result[:background_jobs],
                                                            relationships_to_include: include_param,
                                                            fields: fields_param, is_collection: true, meta:).serialize
        end
      end
    end

    def index_errors
      respond_to do |format|
        format.html {}
        format.json do
          result = BackgroundJobs::ListErrors.new(params: params_with_project).execute
          meta = extract_pagination_meta(result[:background_job_errors])
                 .merge(start_time: result[:start_time].to_f, end_time: result[:end_time].to_f)
          render json: BackgroundJobErrorSerializer.new(result[:background_job_errors],
                                                                 relationships_to_include: include_param,
                                                                 fields: fields_param, is_collection: true, meta:).serialize
        end
      end
    end

    def history
      result = BackgroundJobs::ListHistory.new(params: params_with_project).execute
      meta = { start_time: result[:start_time].to_f, end_time: result[:end_time].to_f }
      render json: { data: result[:data], meta: }
    end

    def index_by_type
      case params[:job_type]
      when 'scheduled', 'schedule'
        fetch_and_render_sorted_jobs('schedule', params[:page])
      when 'retries', 'retry'
        fetch_and_render_sorted_jobs('retry', params[:page])
      when 'dead', 'morgue'
        fetch_and_render_sorted_jobs('dead', params[:page])
      when 'queued', 'queue'
        fetch_and_render_job_records_from_queue(params[:queue_name], params[:page])
      else
        render json: {}, status: :not_found
      end
    end

    def show
      job_set, _job_type = job_set_from_params
      render(json: {}, status: :not_found) and return unless job_set

      at, jid = params[:key].split('-', 2)
      job = job_set.new.fetch(at, jid).first
      render(json: {}, status: :not_found) and return unless job

      render json: { job: serialize_job(job) }
    end

    def update
      job_set, job_type = job_set_from_params
      render(json: {}, status: :not_found) and return unless job_set

      at, jid = params[:key].split('-', 2)
      job = job_set.new.fetch(at, jid).first
      render(json: {}, status: :not_found) and return unless job

      action = UPDATE_MAP[job_type].include?(params[:job_action]) && params[:job_action]
      render(json: {}, status: :not_found) and return unless action

      job.send(action)
      render json: {}, status: :ok
    end

    def update_all
      job_set, job_type = job_set_from_params
      render(json: {}, status: :not_found) and return unless job_set

      action = UPDATE_ALL_MAP[job_type].include?(params[:job_action]) && params[:job_action]
      render(json: {}, status: :not_found) and return unless action

      job_set.new.send(action)

      render json: {}, status: :ok
    end

    def index_queues
      respond_to do |format|
        format.html {}
        format.json do
          queues = Sidekiq::Queue.all
          render json: {
            queues: queues.map { |q| serialize_queue(q) }
          }
        end
      end
    end

    def show_queue
      respond_to do |format|
        format.html {}
        format.json do
          queue_name = params[:id]
          render json: {}, status: :not_found if !queue_name || queue_name !~ /\A[a-z_:.\-0-9]+\z/i

          queue = Sidekiq::Queue.new(queue_name)
          render json: { queue: serialize_queue(queue) }
        end
      end
    end

    def clear_queue
      queue_name = params[:id]
      render json: {}, status: :not_found if !queue_name || queue_name !~ /\A[a-z_:.\-0-9]+\z/i

      queue = Sidekiq::Queue.new(queue_name)
      queue.clear
      render json: {}
    end

    def remove_job_from_queue
      queue_name = params[:id]
      Sidekiq::JobRecord.new(params[:job_item], queue_name).delete
      render json: {}
    end

    def processes
      process_set = Sidekiq::ProcessSet.new
      work_set = Sidekiq::WorkSet.new

      leader = process_set.leader
      render json: {
        stats: {
          processes: process_set.size,
          threads: process_set.total_concurrency,
          busy: work_set.size,
          rss: process_set.total_rss
        },
        processes: process_set.map { |ps| serialize_process(ps, ps == leader) },
        jobs: work_set.map do |process, thread, msg|
          job = Sidekiq::JobRecord.new(msg['payload'])
          serialize_job(job).merge({
                                     process:,
                                     thread:,
                                     runAt: msg['run_at']
                                   })
        end
      }
    end

    def stats
      sidekiq_stats = Sidekiq::Stats.new
      render json:
        {
          time: Time.now.to_f,
          processed: sidekiq_stats.processed,
          failed: sidekiq_stats.failed,
          busy: sidekiq_stats.workers_size,
          processes: sidekiq_stats.processes_size,
          enqueued: sidekiq_stats.enqueued,
          scheduled: sidekiq_stats.scheduled_size,
          retries: sidekiq_stats.retry_size,
          dead: sidekiq_stats.dead_size,
          default_latency: sidekiq_stats.default_queue_latency
        }
    end

    protected

    def fetch_and_render_sorted_jobs(name, page)
      current_page, total_size, jobs = page(name, page, PER_PAGE)
      jobs = jobs.map { |msg, score| Sidekiq::SortedEntry.new(nil, score, msg) }
      render json: {
        jobs: jobs.map { |job| serialize_job(job) },
        pagination: pagination(current_page, total_size)
      }
    end

    def fetch_and_render_job_records_from_queue(queue_name, page)
      current_page, total_size, jobs = page("queue:#{queue_name}", page, PER_PAGE)
      jobs = jobs.map { |msg, _score| Sidekiq::JobRecord.new(msg, queue_name) }
      render json: {
        jobs: jobs.map { |job| serialize_job(job) },
        pagination: pagination(current_page, total_size)
      }
    end

    def pagination(current_page, total_size)
      {
        currPage: current_page,
        recordCount: total_size,
        perPage: PER_PAGE
      }
    end

    def serialize_job(job)
      {
        item: job.item,
        score: job.try(:score),
        at: job.try(:at)&.to_f,
        queue: job.queue,
        displayClass: job.display_class,
        displayArgs: job.display_args,
        createdAt: job.created_at&.to_f,
        enqueuedAt: job.enqueued_at&.to_f
      }
    end

    def serialize_queue(queue)
      {
        name: queue.name,
        size: queue.size,
        paused: queue.paused?,
        latency: queue.latency
      }
    end

    def serialize_process(process, is_lead)
      {
        hostname: process['hostname'],
        pid: process['pid'],
        tag: process.tag,
        labels: process.labels,
        stopping: process.stopping?,
        isLead: is_lead,
        queues: process.queues,
        startedAt: process['started_at'],
        rss: process['rss'],
        concurrency: process['concurrency'],
        busy: process['busy']
      }
    end

    def job_set_from_params
      case params[:job_type]
      when 'scheduled', 'schedule'
        [Sidekiq::ScheduledSet, :scheduled]
      when 'retries', 'retry'
        [Sidekiq::RetrySet, :retry]
      when 'dead', 'morgue'
        [Sidekiq::DeadSet, :dead]
      end
    end

    def with_redis_connection
      @project = Project.find_by!(slug: params[:project_id])

      redis_config = Sidekiq::RedisClientAdapter.new(url: @project.redis_url)
      @pool = ConnectionPool.new(timeout: 5, size: 5, name: 'temp') do
        redis_config.new_client
      end

      Sidekiq::Client.via(@pool) do
        yield
      end
    end
  end
end
