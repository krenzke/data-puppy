# frozen_string_literal: true

class CreateTables < ActiveRecord::Migration[7.2]
  def up
    enable_extension 'timescaledb'

    create_table :projects do |t|
      t.string :name, null: false
      t.string :slug, null: false, index: { unique: true }
      t.string :database_url
      t.string :redis_url

      t.timestamps
    end

    create_table :api_requests, id: false do |t|
      t.references :project, foreign_key: true
      t.column :time, :timestamptz, null: false
      t.text :path
      t.text :verb
      t.jsonb :query
      t.integer :response_status
      t.uuid :request_id
      t.inet :ip
      t.decimal :dt
      t.integer :query_count
      t.decimal :total_query_duration
      t.jsonb :meta
      t.text :error_class
      t.text :error_message
      t.text :backtrace, array: true
      t.jsonb :trace
    end

    create_table :background_jobs, id: false do |t|
      t.references :project, foreign_key: true
      t.column :time, :timestamptz, null: false
      t.decimal :dt
      t.text :job_class
      t.text :job_args, array: true
      t.text :jid
      t.uuid :request_id
      t.jsonb :meta
    end

    create_table :background_job_errors, id: false do |t|
      t.references :project, foreign_key: true
      t.column :time, :timestamptz, null: false
      t.text :job_class
      t.text :error_class
      t.text :error_message
      t.text :jid
      t.text :backtrace, array: true
      t.text :request_id
    end

    create_table :deployments, id: false do |t|
      t.references :project, foreign_key: true
      t.column :time, :timestamptz, null: false
      t.text :branch
      t.text :sha
      t.text :release
      t.text :deployer
    end

    create_table :host_metrics, id: false do |t|
      t.references :project, foreign_key: true
      t.column :time, :timestamptz, null: false
      t.integer :total_system_mem
      t.integer :free_system_mem
      t.decimal :pct_free_system_mem
      t.decimal :system_pct_cpu
      t.integer :total_hdd
      t.integer :free_hdd
      t.decimal :postgres_pct_cpu
      t.decimal :postgres_pct_mem
      t.decimal :ruby_pct_cpu
      t.decimal :ruby_pct_mem
      t.decimal :nginx_pct_cpu
      t.decimal :nginx_pct_mem
      t.decimal :elasticsearch_pct_cpu
      t.decimal :elasticsearch_pct_mem
      t.decimal :redis_pct_cpu
      t.decimal :redis_pct_mem
    end

    execute "SELECT create_hypertable('api_requests', 'time')"
    execute "SELECT create_hypertable('background_jobs', 'time')"
    execute "SELECT create_hypertable('background_job_errors', 'time')"
    execute "SELECT create_hypertable('deployments', 'time')"
    execute "SELECT create_hypertable('host_metrics', 'time')"

    add_index :api_requests, :request_id
    add_index :api_requests, %i[path time]
    add_index :api_requests, %i[response_status time]
    add_index :api_requests, %i[error_class time]
    add_index :background_jobs, :request_id
    add_index :background_jobs, %i[job_class time]
    add_index :background_job_errors, :request_id
    add_index :background_job_errors, %i[job_class time]
  end

  def down
    drop_table :api_requests
    drop_table :background_jobs
    drop_table :background_job_errors
    drop_table :deployments
    drop_table :host_metrics
    drop_table :projects
  end
end
