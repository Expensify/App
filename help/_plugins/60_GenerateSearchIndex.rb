require 'nokogiri'
require 'open3'

module Jekyll
  class GenerateSearchIndex < Generator
    priority 60
    def generate(site)
      # Define the path to your Node.js script
      script_path = File.join(site.source, '_scripts', 'generateSearchIndex.js')
      
      # Execute the Node.js script using Open3.capture3 to capture output and errors
      puts "Running Node.js script to generate search index: #{script_path}"
      stdout, stderr, status = Open3.capture3("node", script_path)
      
      if status.success?
        puts "Search index generated successfully"
      else
        puts "Error generating search index:\n#{stderr}"
        raise "Search index generation failed"
      end
    end
  end
end
