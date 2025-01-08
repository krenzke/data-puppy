# frozen_string_literal: true

module JsonApi
  class Link
    attr_accessor :name

    def initialize(name, blk)
      @name = name
      @blk = blk
    end

    def value_for(record)
      @blk.call(record)
    end
  end
end
