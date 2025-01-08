# frozen_string_literal: true

module JsonApi
  module Serializer
    extend ActiveSupport::Concern

    included do
      # TODO: make this optional?
      class << self
        include Rails.application.routes.url_helpers
      end
    end

    class_methods do
      attr_accessor :_meta, :_type, :_attributes_map, :_links_map, :_relationships_map

      def attribute(attr_name, options = {}, &blk)
        self._attributes_map ||= {}
        self._attributes_map[attr_name] = Attribute.new(attr_name, options, blk)
      end

      def attributes(*attr_names)
        attr_names.each { |n| attribute(n) }
      end

      def link(name, &blk)
        self._links_map ||= {}
        self._links_map[name] = Link.new(name, blk)
      end

      def meta(&blk)
        self._meta = blk
      end

      def type(t)
        self._type = t
      end

      def belongs_to(name, options = {})
        self._relationships_map ||= {}
        self._relationships_map[name] = Relationship.new(name, :belongs_to, options)
      end

      def has_one(name, options = {})
        self._relationships_map ||= {}
        self._relationships_map[name] = Relationship.new(name, :has_one, options)
      end

      def has_many(name, options = {})
        self._relationships_map ||= {}
        self._relationships_map[name] = Relationship.new(name, :has_many, options)
      end

      def serializable_attributes
        self._attributes_map
      end
    end

    # should be fed params from controller (e.g. params[:include])
    # {rel1.rel2,rel3,rel4.rel5} should convert to
    # { rel1 => { rel2 => {} }, rel3 => {}, rel4 => {rel5 => {}}}
    def self.convert_included_params(included_params)
      result = {}
      paths = included_params.split(',')
      paths.each do |path|
        temp_obj = result

        path.split('.').each do |relationship_name|
          temp_obj[relationship_name] ||= {}
          temp_obj = temp_obj[relationship_name]
        end
      end

      result
    end

    # should be fed params from controller (e.g. params[:fields])
    # { type1 => 'field1,field2', type2 => 'field3,field4'} should convert to
    # { type1 => ['field1','field2'], type2 => ['field3','field4']}
    def self.convert_fields_params(fields_params)
      fields_params.transform_values { |v| v.split(',').uniq.reject(&:blank?) }
    end

    attr_accessor :object, :context, :is_collection, :fields, :relationships_to_include, :included_records, :links, :meta

    # fields: { type_name1: ['attr1','attr2'], ... }
    # included: { relationship_name1: { relationship_name2: {}} }
    def initialize(object, context: {}, is_collection: false, fields: {}, relationships_to_include: {}, links: nil, meta: nil, included_records: nil)
      raise ArgumentError, "#{self.class} does not have a type specified" unless type

      @object = object
      @context = context
      @is_collection = is_collection
      @fields = fields.is_a?(ActionController::Parameters) ? fields.to_unsafe_h : fields
      @fields = @fields.with_indifferent_access
      @relationships_to_include = relationships_to_include.is_a?(ActionController::Parameters) ? relationships_to_include.to_unsafe_h : relationships_to_include
      @relationships_to_include = @relationships_to_include.with_indifferent_access
      @included_records = included_records || {}
      @links = links
      @meta = meta
    end

    def serialize
      result = {
        data: is_collection ? [] : nil
      }

      return result unless object

      result[:data] = is_collection ? object.map { |record| serialize_data_object(record) } : serialize_data_object

      if included_records.size.positive?
        result[:included] = included_records.values
      elsif relationships_to_include.size.positive?
        result[:included] = []
      end

      result[:meta] = meta if meta
      result[:links] = links if links

      result
    end

    # Just the data for a single object
    # This is public for when we want to just get the data for a
    # single object without all the extra structure (e.g. when
    # serializing a record to put in the `included` array)
    def serialize_data_object(record = nil)
      record ||= object
      data = {
        type:,
        id: record.id.to_s,
        attributes: serialize_attributes(record)
      }

      data[:relationships] = serialize_relationships_object(record) if self.class._relationships_map.present?
      data[:meta] = serialize_meta_object(record) if self.class._meta.present?
      data[:links] = serialize_links_object(record) if self.class._links_map.present?

      data
    end

    protected

    def serialize_attributes(record)
      attributes_to_serialize = filter_allowable_fields(record, self.class.serializable_attributes)

      attributes_to_serialize.each_with_object({}) do |(attr_name, attribute), o|
        o[attr_name] = attribute.value_for(record, context) if attribute.should_include?(record, context)
      end
    end

    def serialize_relationships_object(record)
      relationships_to_serialize = filter_allowable_fields(record, self.class._relationships_map)

      relationships_to_serialize.each_with_object({}) do |(relationship_name, relationship), o|
        imap = relationships_to_include[relationship_name] ? included_records : nil
        o[relationship_name] = relationship.value_for(record,
                                                      context:,
                                                      fields:,
                                                      relationships_to_include: relationships_to_include[relationship_name],
                                                      included_records: imap)
      end
    end

    def serialize_meta_object(record)
      self.class._meta.call(record, context)
    end

    def serialize_links_object(record)
      self.class._links_map.transform_values do |link|
        link.value_for(record)
      end
    end

    def type
      self.class._type
    end

    def filter_allowable_fields(record, field_map)
      allowed_fields = field_map
      allowed_fields = allowed_fields.select { |attr_name, _attribute| fields[type].include?(attr_name.to_s) } if fields[type].present?

      if respond_to?(:allowed_fields)
        allowed = allowed_fields(record, context)
        allowed_fields = allowed_fields.select { |attr_name, _attribute| allowed.include?(attr_name) }
      end

      allowed_fields
    end
  end
end
