Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

namespace :api do
    namespace :v1 do
      # Rotte per l'Autenticazione
      post "/login", to: "authentication#login"
      post "/refresh", to: "authentication#refresh"
      
      # Recupero password
      post "/password_reset", to: "password_resets#create"
      patch "/password_reset", to: "password_resets#update"

      # Dashboard e Utenti
      get "/dashboard", to: "dashboard#index"
      resources :users, only: [ :index, :create, :update, :destroy ]
      resources :products, only: [:index, :show, :create, :update, :destroy]
      resources :product_types, only: [:index]
    end
  end
end

