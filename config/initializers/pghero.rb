# frozen_string_literal: true

module PgHero
  module Methods
    module Space
      def raw_database_size
        select_one('SELECT pg_database_size(current_database())')
      end
    end
  end

  class << self
    def_delegators :primary_database, :raw_database_size
  end

  class Database
    def establish_connection(url)
      connection_model.establish_connection(url)
    end
  end
end
