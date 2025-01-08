source "https://rubygems.org"

gem "rails", "~> 7.2.2", ">= 7.2.2.1"
gem "sprockets-rails"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"
gem "importmap-rails"
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "bootsnap", require: false
gem 'kaminari'
gem 'pghero'
gem 'sidekiq'
gem 'tailwindcss-rails'
gem 'vite_rails'

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem 'fabrication'
  gem 'ffaker'
  gem 'rspec-rails', '~> 7.0.0 '
end

group :development do
  gem "web-console"
  gem "error_highlight", ">= 0.4.0", platforms: [ :ruby ]
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end
