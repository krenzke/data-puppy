# frozen_string_literal: true

module ParamHelpers
  def self.convert_to_numeric(param_value)
    return param_value if param_value.is_a?(Numeric)
    return nil if param_value.blank?

    val = param_value.to_f
    val.positive? ? val : nil
  rescue StandardError
    nil
  end
end
