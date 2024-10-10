require 'nokogiri'
require 'cgi'  # Use CGI for URL encoding

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
      h1_id = ""
      h2_id = ""
      h3_id = ""

      # Process all <h2>, <h3>, and <h4> elements
      (2..4).each do |level|
        doc.css("h#{level}").each do |header|
          header_text = header.text.strip.downcase
          header_id = CGI.escape(header_text.gsub(/\s+/, '-').gsub(/[^\w\-]/, ''))

          puts "    Found h#{level}: '#{header_text}' -> ID: '#{header_id}'"

          # Create hierarchical IDs by appending to the parent header IDs
          if level == 2
            h2_id = header_id
            header['id'] = h2_id
          elsif level == 3
            h3_id = "#{h2_id}:#{header_id}"
            header['id'] = h3_id
          elsif level == 4
            h4_id = "#{h3_id}:#{header_id}"
            header['id'] = h4_id
          end

          puts "    Assigned ID: #{header['id']}"
        end
      end

      # Log the final output being written
      puts "  Writing updated HTML for page: #{page.path}"

      # Write the updated HTML back to the page
      page.output = doc.to_html
    end
  end
end

