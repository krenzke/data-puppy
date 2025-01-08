Rails.application.routes.draw do
  scope ":project_id" do
    namespace :api do
      resources :api_requests, only: [:index, :show] do
        get :history, on: :collection
        get :latency_history, on: :collection
      end

      resources :deployments, only: [:index]
      resources :host_metrics, only: [:index]
    end

    match '*path', to: 'pages#index', via: %i[get head]
    root to: 'pages#index', as: :project_root
  end

  root to: 'pages#no_project'
end
