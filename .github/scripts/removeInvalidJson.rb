#!/usr/bin/env ruby
require 'json'

# List of JSON strings
json_strings = ARGV 

# Parse each JSON string and remove any that couldn't be parsed
valid_jsons = json_strings.select do |json_string|
  begin
    JSON.parse(json_string)
    true
  rescue JSON::ParserError
    false
  end
end
