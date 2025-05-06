require 'nokogiri'
require 'cgi'

module Jekyll
  class SitePostRender
    # Hook into Jekyll's post_render stage to ensure we work with the final HTML
    Jekyll::Hooks.register :pages, :post_render do |page|
      process_page(page)
    end

    Jekyll::Hooks.register :documents, :post_render do |post|
      process_page(post)
    end

    def self.process_page(page)
      return unless page.output_ext == ".html"  # Only apply to HTML pages
      return if page.output.nil?  # Skip if no output has been generated

      puts "  Processing page: #{page.path}"

      # Parse the page's content for header elements
      doc = Nokogiri::HTML(page.output)

      # Check if the page is a reference page
      if page.path.start_with?("ref/")
        @help_mapping ||= {}
        @help_mapping[page.path.chomp('index.md')] = doc.at('.product-content')
      else
        # Create an array to store the prefix for each level of header (h2, h3, h4, etc.)
        prefix = {}

        # Process all <h2>, <h3>, and <h4> elements in order
        doc.css('h2, h3, h4, h5').each do |header|
          # Check if the header starts with a short title in square brackets
          header_text = header.text.strip
          if header_text.match(/^\[(.*?)\]/)
            # Extract the short title from the square brackets
            short_title = header_text.match(/^\[(.*?)\]/)[1]

            # Set the `data-toc-title` attribute on the header
            header['data-toc-title'] = short_title

            # Remove the short title from the visible header text
            header_text = header_text.sub(/^\[.*?\]\s*/, '')
            header.content = header_text
          end

          # Determine the level of the header (h2, h3, h4, or h5)
          level = header.name[1].to_i  # 'h2' -> 2, 'h3' -> 3, etc.

          # Generate the ID for the current header based on its (cleaned) text
          clean_text = header_text.downcase.strip
          header_id = CGI.escape(clean_text.gsub(/\s+/, '-').gsub(/[^\w\-]/, ''))

          # Store the current header's ID in the prefix array
          prefix[level] = header_id

          # Construct the full hierarchical ID by concatenating IDs for all levels up to the current level
          full_id = (2..level).map { |l| prefix[l] }.join('--')

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


    # Generate helpContent.tsx once all pages have been processed
    Jekyll::Hooks.register :site, :post_render do |site|
      generate_help_content(site)
    end

    def self.generate_help_content(site)
      puts "  Generating helpContent.tsx from rendered HTML pages..."

      output_dir = File.join(site.source, "_src")
      FileUtils.mkdir_p(output_dir) unless Dir.exist?(output_dir)
      
      output_file = File.join(output_dir, "helpContentMap.tsx")

      help_content_tree = generate_help_content_tree()

      help_content_string = to_ts_object(help_content_tree)

      imports = [
        "import type {ReactNode} from 'react';",
        "import React from 'react';",
        "import {View} from 'react-native';",
      ]

      # Add conditional imports based on component usage
      imports << "import BulletList from '@components/SidePanel/HelpComponents/HelpBulletList';" if help_content_string.include?("<BulletList")
      imports << "import Text from '@components/Text';" if help_content_string.include?("<Text")
      imports << "import TextLink from '@components/TextLink';" if help_content_string.include?("<TextLink")
      imports << "import type {ThemeStyles} from '@styles/index';"

      # Join the imports
      import_block = imports.join("\n")

      ts_output = <<~TS
        /* eslint-disable react/no-unescaped-entities */
        /* eslint-disable @typescript-eslint/naming-convention */
        #{import_block}

        type ContentComponent = (props: {styles: ThemeStyles}) => ReactNode;

        type HelpContent = {
            /** The content to display for this route */
            content: ContentComponent;

            /** Any children routes that this route has */
            children?: Record<string, HelpContent>;

            /** Whether this route is an exact match or displays parent content */
            isExact?: boolean;
        };

        const helpContentMap: HelpContent = #{help_content_string}

        export default helpContentMap;
        export type {ContentComponent};
      TS
            
      File.write(output_file, ts_output)

      puts "✅ Successfully generated helpContent.tsx"
    end

    def self.generate_help_content_tree()
      tree = {}
    
      @help_mapping.each do |route, node|
        parts = route.sub(/^ref\//, '').sub(/\.md$/, '').split('/')
        current = tree
    
        parts.each_with_index do |part, i|
          is_dynamic = part.start_with?(':') || part.match?(/^\[.*\]$/)
          part_key = is_dynamic ? part : part.to_sym
    
          current[:children] ||= {}
          current[:children][part_key] ||= {}
    
          if i == parts.length - 1
            jsx_content = html_node_to_RN(node, 1).rstrip
    
            current[:children][part_key][:content] = <<~TS.chomp
              ({styles}: {styles: ThemeStyles}) => (
              #{jsx_content}
              )
            TS
          end
    
          current = current[:children][part_key]
        end
      end
    
      tree[:content] = <<~JSX
        () => null
      JSX
      tree
    end
    
    def self.html_node_to_RN(node, indent_level = 0)
      indent = '  ' * indent_level
    
      case node.name
      when 'div'
        children = node.children.map do |child|
          next if child.text? && child.text.strip.empty?
          html_node_to_RN(child, indent_level + 1)
        end.compact.join("\n")
    
        "#{indent}<View>\n#{children}\n#{indent}</View>"
    
      when 'h1' then "#{indent}<Text style={[styles.textHeadlineH1, styles.mv4]}>#{node.text.strip}</Text>"
      when 'h2' then "#{indent}<Text style={[styles.textHeadlineH2, styles.mv4]}>#{node.text.strip}</Text>"
      when 'h3' then "#{indent}<Text style={[styles.textHeadlineH3, styles.mv4]}>#{node.text.strip}</Text>"
      when 'h4' then "#{indent}<Text style={[styles.textHeadlineH4, styles.mv4]}>#{node.text.strip}</Text>"
      when 'h5' then "#{indent}<Text style={[styles.textHeadlineH5, styles.mv4]}>#{node.text.strip}</Text>"
      when 'h6' then "#{indent}<Text style={[styles.textHeadlineH6, styles.mv4]}>#{node.text.strip}</Text>"
    
      when 'p'
        inner = node.children.map { |c| html_node_to_RN(c, indent_level + 1) }.join
        prev = node.previous_element
        next_el = node.next_element
      
        style_classes = ['styles.textNormal']
        style_classes << 'styles.mt4' if prev&.name == 'ul'
        style_classes << 'styles.mb4' if next_el&.name == 'p'
        
        "#{indent}<Text style={[#{style_classes.join(', ')}]}>#{inner.strip}</Text>"
    
      when 'ul'
        items = node.xpath('./li').map do |li|
          contains_ul = li.xpath('.//ul').any?

          li_parts = li.children.map { |child| html_node_to_RN(child, indent_level + 3) }.join
        
          if contains_ul
            "#{'  ' * (indent_level + 2)}<>\n#{li_parts}\n#{'  ' * (indent_level + 1)}</>"
          else
            "#{'  ' * (indent_level + 2)}<Text style={styles.textNormal}>#{li_parts}</Text>"
          end
        end

        <<~TS.chomp
          #{indent}<BulletList
          #{indent}  styles={styles}
          #{indent}  items={[
          #{items.join(",\n")}
          #{indent}  ]}
          #{indent}/>
        TS
    
      when 'li'
        '' # handled in <ul>
    
      when 'strong', 'b'
        "<Text style={styles.textBold}>#{node.text}</Text>"
      when 'em', 'i'
        "<Text style={styles.textItalic}>#{node.text}</Text>"
      when 'a'
        href = node['href']
        link_text = node.children.map { |child| html_node_to_RN(child, 0) }.join
        "<TextLink href=\"#{href}\" style={styles.link}>#{link_text.strip}</TextLink>"
        
      when 'text'
        node.text
    
      else
        node.children.map { |child| html_node_to_RN(child, indent_level) }.join
      end
    end

    def self.to_ts_object(obj, indent = 0)
      spacing = '  ' * indent
      lines = ["{"]
    
      obj.each do |key, value|
        key_str = key.is_a?(Symbol) ? key.to_s : key.inspect
        key_line_prefix = '  ' * (indent + 1) + "#{key_str}: "
    
        if value.is_a?(Hash)
          nested = to_ts_object(value, indent + 1)
          lines << key_line_prefix + nested + ","
        elsif value.is_a?(String) && value.include?("\n")
          value_lines = value.split("\n")
          first_line = value_lines.shift
          rest_lines = value_lines.map { |l| '  ' * (indent + 1) + l }
          lines << ([key_line_prefix + first_line] + rest_lines).join("\n") + ","
        else
          lines << key_line_prefix + value.inspect + ","
        end
      end
    
      lines << '  ' * indent + "}"
      lines.join("\n")
    end
    
  end
end

