# frozen_string_literal: true

module JsonApi
  class Attribute
    attr_accessor :name, :options, :value_blk

    def initialize(name, options, blk)
      @name = name
      @options = options
      @value_blk = blk
    end

    def value_for(record, context)
      if value_blk
        value_blk.call(record, context)
      else
        record.send(name)
      end
    end

    def should_include?(record, context)
      return true if options[:if].blank?

      case options[:if]
      when Proc
        options[:if].call(record, context)
      when :symbol
        record.send(options[:if])
      else
        raise ArgumentError, "Unknown :if option type on attribute #{name}"
      end
    end
  end
end
