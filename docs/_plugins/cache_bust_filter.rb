require 'digest'

module Jekyll
  module CacheBustFilter
    def cache_bust(input)
      puts "Processing asset: #{input}"

      # Get the file extension
      ext = File.extname(input)
      puts "File extension: #{ext}"

      # Define a list of supported asset types
      supported_assets = %w[.css .js .png .jpg .jpeg .gif .svg .woff .woff2 .ttf .eot]

      # Check if the asset type is supported
      if supported_assets.include?(ext)
        puts "Asset type supported: #{ext}"

        # Compute the file hash
        site_source = @context.registers[:site].source
        puts "Site destination directory: #{site_source}"

        file_path = File.join(site_source, input)
        puts "Constructed file path: #{file_path}"

        if File.exist?(file_path)
          puts "File exists: #{file_path}"

          file_content = File.read(file_path)
          file_hash = Digest::MD5.hexdigest(file_content)
          puts "File hash: #{file_hash}"
          "#{input}?v=#{file_hash}"
        else
			if input == @context.registers[:site].config['main_style']
              puts "Digesting contents of _sass folder"
              sass_folder_path = File.join(site_source, '_sass')
              directory_hash = digest_directory_contents(sass_folder_path)
              puts "Directory hash: #{directory_hash}"
              "#{input}?v=#{directory_hash}"
            else
              puts "File does not exist: #{file_path}"
              # Return the input unchanged if the file does not exist
              input
            end
        end
      else
        puts "Asset type not supported: #{ext}"
        # Return the input unchanged if the asset type is not supported
        input
      end
    end

    private

    def digest_directory_contents(directory)
      target_path = File.join(directory, '**', '*')
      content = Dir[target_path].map { |f| File.read(f) unless File.directory?(f) }.join
      Digest::MD5.hexdigest(content)
    end
 
  end
end

Liquid::Template.register_filter(Jekyll::CacheBustFilter)