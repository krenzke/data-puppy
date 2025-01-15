Rails.application.routes.draw do
  scope ":project_id" do
    namespace :api, defaults: {format: :json} do
      resources :api_requests, only: [:index, :show] do
        get :history, on: :collection
        get :latency_history, on: :collection
      end

      resources :deployments, only: [:index]
      resources :host_metrics, only: [:index]

      scope :pghero do
        get :explain, to: 'pghero#explain'
        post :explain, to: 'pghero#explain_analyze_query'
        get :queries, to: 'pghero#queries'
        root to: 'pghero#index', as: :pghero_root
      end

      scope :sidekiq do
        # json only
        get 'jobs/:job_type/:key', to: 'sidekiq#show', key: /[A-z.\-0-9]+/
        get 'jobs/:job_type', to: 'sidekiq#index_by_type'
        put 'jobs/:job_type/:key', to: 'sidekiq#update', key: /[A-z.\-0-9]+/
        put 'jobs/:job_type', to: 'sidekiq#update_all'
        delete 'queues/:id', to: 'sidekiq#clear_queue'
        post 'queues/:id/remove_job', to: 'sidekiq#remove_job_from_queue'
        get 'stats', to: 'sidekiq#stats'
        get 'history', to: 'sidekiq#history'
        get 'processes', to: 'sidekiq#processes'
        get 'errors', to: 'sidekiq#index_errors'
  
        # json and html
        get 'queues', to: 'sidekiq#index_queues'
        get 'queues/:id', to: 'sidekiq#show_queue'
        get 'retries/:key', to: 'sidekiq#show_job', key: /[A-z.\-0-9]+/
        get 'scheduled/:key', to: 'sidekiq#show_job', key: /[A-z.\-0-9]+/
        get 'dead/:key', to: 'sidekiq#show_job', key: /[A-z.\-0-9]+/
  
        # html only (basically empty actions)
        %i[retries scheduled busy dead].each do |action|
          get action, to: "sidekiq##{action}"
        end
  
        root to: 'sidekiq#index', as: :sidekiq_root
      end
    end

    match '*path', to: 'pages#index', via: %i[get head]
    root to: 'pages#index', as: :project_root
  end

  root to: 'pages#no_project'
end
