#!/usr/bin/env ruby
require 'json'

# Extracts valid JSON objects from text, ignoring any characters between them.
def extract_json_objects(text)
  objects = []
  buf = ''
  depth = 0

  text.each_char do |ch|
    buf << ch if depth > 0 || ch == '{' || ch == '}'

    case ch
    when '{'
      depth += 1
    when '}'
      depth -= 1
      if depth == 0
        begin
          objects << JSON.parse(buf)
        rescue JSON::ParserError
        end
        buf = ''
      end
    end
  end

  objects
end

if __FILE__ == $0
  input = ARGV.fetch(0) { exit 1 }
  puts JSON.dump(extract_json_objects(input))
end
