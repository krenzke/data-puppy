# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_01_08_011452) do
  create_schema "_timescaledb_cache"
  create_schema "_timescaledb_catalog"
  create_schema "_timescaledb_config"
  create_schema "_timescaledb_debug"
  create_schema "_timescaledb_functions"
  create_schema "_timescaledb_internal"
  create_schema "timescaledb_experimental"
  create_schema "timescaledb_information"

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "timescaledb"

  create_table "api_requests", id: false, force: :cascade do |t|
    t.bigint "project_id"
    t.timestamptz "time", null: false
    t.text "path"
    t.text "verb"
    t.jsonb "query"
    t.integer "response_status"
    t.uuid "request_id"
    t.inet "ip"
    t.decimal "dt"
    t.integer "query_count"
    t.decimal "total_query_duration"
    t.jsonb "meta"
    t.text "error_class"
    t.text "error_message"
    t.text "backtrace", array: true
    t.jsonb "trace"
    t.index ["error_class", "time"], name: "index_api_requests_on_error_class_and_time"
    t.index ["path", "time"], name: "index_api_requests_on_path_and_time"
    t.index ["project_id"], name: "index_api_requests_on_project_id"
    t.index ["request_id"], name: "index_api_requests_on_request_id"
    t.index ["response_status", "time"], name: "index_api_requests_on_response_status_and_time"
    t.index ["time"], name: "api_requests_time_idx", order: :desc
  end

  create_table "background_job_errors", id: false, force: :cascade do |t|
    t.bigint "project_id"
    t.timestamptz "time", null: false
    t.text "job_class"
    t.text "error_class"
    t.text "error_message"
    t.text "jid"
    t.text "backtrace", array: true
    t.text "request_id"
    t.index ["job_class", "time"], name: "index_background_job_errors_on_job_class_and_time"
    t.index ["project_id"], name: "index_background_job_errors_on_project_id"
    t.index ["request_id"], name: "index_background_job_errors_on_request_id"
    t.index ["time"], name: "background_job_errors_time_idx", order: :desc
  end

  create_table "background_jobs", id: false, force: :cascade do |t|
    t.bigint "project_id"
    t.timestamptz "time", null: false
    t.decimal "dt"
    t.text "job_class"
    t.text "job_args", array: true
    t.text "jid"
    t.uuid "request_id"
    t.jsonb "meta"
    t.index ["job_class", "time"], name: "index_background_jobs_on_job_class_and_time"
    t.index ["project_id"], name: "index_background_jobs_on_project_id"
    t.index ["request_id"], name: "index_background_jobs_on_request_id"
    t.index ["time"], name: "background_jobs_time_idx", order: :desc
  end

  create_table "deployments", id: false, force: :cascade do |t|
    t.bigint "project_id"
    t.timestamptz "time", null: false
    t.text "branch"
    t.text "sha"
    t.text "release"
    t.text "deployer"
    t.index ["project_id"], name: "index_deployments_on_project_id"
    t.index ["time"], name: "deployments_time_idx", order: :desc
  end

  create_table "host_metrics", id: false, force: :cascade do |t|
    t.bigint "project_id"
    t.timestamptz "time", null: false
    t.integer "total_system_mem"
    t.integer "free_system_mem"
    t.decimal "pct_free_system_mem"
    t.decimal "system_pct_cpu"
    t.integer "total_hdd"
    t.integer "free_hdd"
    t.decimal "postgres_pct_cpu"
    t.decimal "postgres_pct_mem"
    t.decimal "ruby_pct_cpu"
    t.decimal "ruby_pct_mem"
    t.decimal "nginx_pct_cpu"
    t.decimal "nginx_pct_mem"
    t.decimal "elasticsearch_pct_cpu"
    t.decimal "elasticsearch_pct_mem"
    t.decimal "redis_pct_cpu"
    t.decimal "redis_pct_mem"
    t.index ["project_id"], name: "index_host_metrics_on_project_id"
    t.index ["time"], name: "host_metrics_time_idx", order: :desc
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.string "database_url"
    t.string "redis_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end

  add_foreign_key "api_requests", "projects"
  add_foreign_key "background_job_errors", "projects"
  add_foreign_key "background_jobs", "projects"
  add_foreign_key "deployments", "projects"
  add_foreign_key "host_metrics", "projects"
end
