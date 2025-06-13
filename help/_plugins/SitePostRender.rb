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

      components = analyze_used_components(help_content_string)
      
      # Generate the import block
      import_block = generate_imports(components)

      ts_output = generate_ts_output(import_block, help_content_string)
            
      File.write(output_file, ts_output)

      puts "✅ Successfully generated helpContent.tsx"
    end

    def self.analyze_used_components(content)  
      components = {  
        'View' => content.include?('<View'),  
        'Text' => content.include?('<Text'),  
        'TextLink' => content.include?('<TextLink'),  
        'BulletList' => content.include?('<BulletList')  
      }  
      components.select { |_, used| used }.keys  
    end

    def self.generate_imports(components)  
      base_imports = [  
        "import type {ReactNode} from 'react';",  
        "import React from 'react';",  
      ]  
      
      # Always include React Native  
      base_imports << "import {#{(['View'] & components).join(', ')}} from 'react-native';"  
      
      # Add component-specific imports  
      component_imports = []  
      component_imports << "import BulletList from '@components/SidePanel/HelpComponents/HelpBulletList';" if components.include?('BulletList')  
      component_imports << "import Text from '@components/Text';" if components.include?('Text')  
      component_imports << "import TextLink from '@components/TextLink';" if components.include?('TextLink')  
      
      # Add style imports  
      base_imports << "import type {ThemeStyles} from '@styles/index';"  
      
      (base_imports + component_imports).join("\n")  
    end

    def self.generate_ts_output(import_block, help_content_string)
      <<~TS
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
      node_processors = {
        'div' => method(:process_div),
        'p' => method(:process_paragraph),
        'ul' => method(:process_unordered_list),
        'li' => method(:process_list_item),
        'h1' => method(:process_heading),
        'h2' => method(:process_heading),
        'h3' => method(:process_heading),
        'h4' => method(:process_heading),
        'h5' => method(:process_heading),
        'h6' => method(:process_heading),
        'strong' => method(:process_bold),
        'b' => method(:process_bold),
        'em' => method(:process_italic),
        'i' => method(:process_italic),
        'a' => method(:process_link),
        'text' => method(:process_text),
      }

      # Use the processor if available, otherwise use default processing
      processor = node_processors[node.name]
      if processor
        processor.call(node, indent_level)
      else
        process_default(node, indent_level)
      end
    end

    def self.process_div(node, indent_level)
      children = node.children.map do |child|
        next if child.text? && child.text.strip.empty?
        html_node_to_RN(child, indent_level + 1)
      end.compact.join("\n")
  
      "#{'  ' * indent_level}<View>\n#{children}\n#{'  ' * indent_level}</View>"
    end

    def self.process_heading(node, indent_level)
      return "#{'  ' * indent_level}<Text style={[styles.textHeadline#{node.name.upcase}, styles.mv4]}>#{node.text.strip}</Text>"
    end

    def self.process_unordered_list(node, indent_level)
      items = node.xpath('./li').map do |li|
        contains_ul = li.xpath('.//ul').any?

        li_parts = li.children.map { |child| html_node_to_RN(child, 0) }
      
        if contains_ul

          indented_li_parts = li_parts.map do |part|
            part.lines.map { |line| "#{'  ' * (indent_level + 3)}#{line.rstrip}" }.join("\n")
          end.join("\n")
          
          "#{'  ' * (indent_level + 2)}<>\n#{indented_li_parts}\n#{'  ' * (indent_level + 2)}</>"
        else
          "#{'  ' * (indent_level + 2)}<Text style={styles.textNormal}>#{li_parts.join}</Text>"
        end
      end

      <<~TS.chomp
        #{'  ' * indent_level}<BulletList
        #{'  ' * indent_level}  styles={styles}
        #{'  ' * indent_level}  items={[
        #{items.join(",\n")}
        #{'  ' * indent_level}  ]}
        #{'  ' * indent_level}/>
      TS
    end

    def self.process_list_item(node, indent_level)
      '' # handled in <ul>
    end

    def self.process_paragraph(node, indent_level)
      inner = node.children.map { |c| html_node_to_RN(c, indent_level + 1) }.join
      
      style_classes = ['styles.textNormal']
      style_classes << 'styles.mt4' if node.previous_element&.name == 'ul'
      style_classes << 'styles.mb4' if node.next_element&.name == 'p'
      
      "#{'  ' * indent_level}<Text style={[#{style_classes.join(', ')}]}>#{inner.strip}</Text>"
    end

    def self.process_bold(node, indent_level)
      "<Text style={styles.textBold}>#{node.text}</Text>"
    end

    def self.process_italic(node, indent_level)
      "<Text style={styles.textItalic}>#{node.text}</Text>"
    end

    def self.process_link(node, indent_level)
      href = node['href']
      link_text = node.children.map { |child| html_node_to_RN(child, 0) }.join
      "<TextLink href=\"#{href}\" style={styles.link}>#{link_text.strip}</TextLink>"
    end

    def self.process_text(node, indent_level)
      node.text
    end

    def self.process_default(node, indent_level)
      node.children.map { |child| html_node_to_RN(child, indent_level) }.join
    end

    def self.to_ts_object(obj, indent = 0)
      spacing = '  ' * indent
      lines = ["{"]

      return "null" if obj.nil?
      return obj.to_s if obj.is_a?(Numeric)
      return obj.to_s if obj.is_a?(TrueClass) || obj.is_a?(FalseClass)
      return obj.inspect if obj.is_a?(String)

      if obj.is_a?(Array)
        items = obj.map { |item| to_ts_object(item, indent + 1) }
        return "[]" if items.empty?
        
        return "[\n" + 
               items.map { |item| "#{spacing}  #{item}" }.join(",\n") + 
               "\n#{spacing}]"
      end
    
      obj.each do |key, value|
        key_str = key.is_a?(Symbol) ? key.to_s : key.inspect
        key_line_prefix = '  ' * (indent + 1) + "#{key_str}: "
    
        if value.is_a?(Hash) || value.is_a?(Array)
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

