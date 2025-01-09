# frozen_string_literal: true

class BaseCommand
  attr_accessor :params, :context

  def initialize(params: {}, context: {})
    @params = params
    @context = context
    @errors = []
    @result = nil
  end

  def execute
    raise AlreadyExecuted if @has_executed

    result = _execute
    @has_executed = true

    result
  end

  def result
    raise CommandErrors::NotExecuted unless @has_executed

    @result
  end

  def errors
    raise CommandErrors::AlreadyExecuted unless @has_executed

    @errors
  end

  protected

  def page
    page = params[:page].to_i
    page.positive? ? page : 1
  end

  def per_page
    per = params[:per_page].to_i
    per.positive? ? per : 20
  end

  def _execute
    raise StandardError, 'Must define in child class'
  end
end
