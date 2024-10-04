require 'nokogiri'
require 'cgi'

module Jekyll
  class HeaderIDPostRender
    # Hook into Jekyll's post_render stage to ensure we work with the final HTML
    Jekyll::Hooks.register :pages, :post_render, priority: 51 do |page|
      process_page(page)
    end

    Jekyll::Hooks.register :documents, :post_render, priority: 51 do |post|
      process_page(post)
    end

    def self.process_page(page)
      return unless page.output_ext == ".html"  # Only apply to HTML pages
      return if page.output.nil?  # Skip if no output has been generated

      puts "  Processing page: #{page.path}"

      # Parse the page's content for header elements
      doc = Nokogiri::HTML(page.output)

      # Create an array to store the prefix for each level of header (h2, h3, h4, etc.)
      prefix = {}

      # Process all <h2>, <h3>, and <h4> elements in order
      doc.css('h2, h3, h4').each do |header|
        # Determine the level of the header (h2, h3, or h4)
        level = header.name[1].to_i  # 'h2' -> 2, 'h3' -> 3, etc.

        # Generate the ID for the current header based on its text
        header_text = header.text.strip.downcase
        header_id = CGI.escape(header_text.gsub(/\s+/, '-').gsub(/[^\w\-]/, ''))

        # Store the current header's ID in the prefix array
        prefix[level] = header_id

        # Construct the full hierarchical ID by concatenating IDs for all levels up to the current level
        full_id = (2..level).map { |l| prefix[l] }.join(':')

        # Assign the generated ID to the header element
        header['id'] = full_id

        puts "    Found h#{level}: '#{header_text}' -> ID: '#{full_id}'"
      end

      # Log the final output being written
      puts "  Writing updated HTML for page: #{page.path}"

      # Write the updated HTML back to the page
      page.output = doc.to_html
    end
  end
end

