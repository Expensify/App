#!/usr/bin/env ruby
require 'json'

def extract_json_objects(text)
  objects = []
  buf = ''
  depth = 0

  text.each_char do |ch|
    if ch == '{'
      depth += 1
      buf << ch
    elsif ch == '}'
      depth -= 1
      buf << ch
      if depth == 0
        begin
          obj = JSON.parse(buf)
          objects << obj
        rescue JSON::ParserError
        end
        buf = ''
      end
    else
      buf << ch if depth > 0
    end
  end

  objects
end

if __FILE__ == $0
  if ARGV.length != 1
    exit 1
  end

  input = ARGV[0]
  result = extract_json_objects(input)
  puts JSON.dump(result)
end
