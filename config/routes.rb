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
    end

    match '*path', to: 'pages#index', via: %i[get head]
    root to: 'pages#index', as: :project_root
  end

  root to: 'pages#no_project'
end
