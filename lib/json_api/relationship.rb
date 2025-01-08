# frozen_string_literal: true

module JsonApi
  class Relationship
    VALID_TYPES = %i[has_one has_many belongs_to].freeze
    attr_accessor :name, :type, :options, :serializer_class

    def initialize(name, type, options)
      raise ArgumentError, 'Invalid type' unless VALID_TYPES.include?(type)
      raise ArgumentError, 'Must specify serializer' unless options[:serializer]

      @name = name
      @type = type
      @options = options
      @serializer_class = options[:serializer]
    end

    def value_for(record, context: {}, fields: {}, relationships_to_include: {}, included_records: nil)
      related = fetch_related(record)

      if included_records
        enumerable_related = is_one? ? [related] : related
        enumerable_related.each do |obj|
          id, type = record_identifier(obj).values_at(:id, :type)
          key = "#{type}-#{id}"
          next if included_records[key]

          included_records[key] = serializer_class.new(obj,
                                                       context:,
                                                       fields:,
                                                       relationships_to_include:,
                                                       included_records:).serialize_data_object
        end
      end

      {
        links: serialize_links(record, related),
        meta: serialize_meta(record, related),
        data: serialize_data(record, related)
      }.reject { |_k, v| v.nil? }
    end

    protected

    def serialize_links(record, related_records)
      return nil unless options[:links]

      options[:links].transform_values do |val|
        if val.respond_to?(:call)
          val.call(record, related_records)
        elsif val.is_a?(Symbol)
          record.send(val)
        else
          val
        end
      end
    end

    def serialize_meta(record, related_records)
      return nil unless options[:meta]

      return options[:meta].call(record, related_records) if options[:meta].respond_to?(:call)

      options[:meta]
    end

    def serialize_data(_record, related_records)
      return nil unless related_records

      if is_one?
        record_identifier(related_records)
      else
        related_records.map do |item|
          record_identifier(item)
        end
      end
    end

    def fetch_related(record)
      if options[:data] == false
        nil
      elsif options[:data].respond_to?(:call)
        options[:data].call(record)
      else
        record.send(name)
      end
    end

    def record_identifier(record)
      {
        id: record.id,
        type: serializer_class._type
      }
    end

    def is_one?
      type == :belongs_to || type == :has_one
    end

    def is_many?
      type == :has_many
    end
  end
end
