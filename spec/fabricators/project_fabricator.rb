# frozen_string_literal: true

Fabricator(:project) do
  name { FFaker::Game.title }
  slug { |attrs| attrs[:name].parameterize }
end
