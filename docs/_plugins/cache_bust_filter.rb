# Note: Github doesn't allow plugins to execute (safemode). These filters won't work on github pages.
module Jekyll
  module CacheBustFilters
    # A simple class to handle md5 hexdigesting
    # Initalizing params:
    # * file_name - String - required - this is both filename to which the md5 
    #   hash will be appended to, and will be read for hexdigest in the absense
    #   of a passed in directory.
    # * directory - String - optional - path of directory files that will be
    #   recursively read and passed into hexdigest
    class CacheDigester
      require 'digest/md5'

      attr_accessor :file_name, :directory

      def initialize(file_name:, directory: nil)
        self.file_name = file_name
        self.directory = directory
        puts "Initialized CacheDigester with file_name: #{file_name}, directory: #{directory}"
      end

      def digest!
        puts "Generating digest for file: #{file_name}"
        digest = [file_name, '?v=', Digest::MD5.hexdigest(file_contents)].join
        digest
      end

      private

      def directory_files_content
        target_path = File.join(directory, '**', '*')
        puts "Reading files from directory: #{target_path}"
        content = Dir[target_path].map { |f| File.read(f) unless File.directory?(f) }.join
        content
      end

      def file_content
        puts "Reading content from file: #{file_name}"
        content = File.read(file_name)
        content
      end

      def file_contents
        if is_directory?
          puts "Reading content from file (not a directory)"
          file_content
        else
          puts "Reading content from directory"
          directory_files_content
        end
      end

      def is_directory?
        directory.nil?
      end
    end

    # Gets Md5 contents of target file (assumed to be using the full path)
    # and appends a hash end of to asset file reference. Ensures deployed
    # asset files are "cachebust-ed" every time the file changes
    def md5_cache_bust(file_name)
      puts "md5_cache_bust called with file_name: #{file_name}"
      CacheDigester.new(file_name: file_name).digest!
    end

    # Gets Md5 contents of all sass assets (assumed to be in /_sass/ )
    # and appends a hash end of the target asset file. Ensures deployed
    # sass bassed CSS files are "cachebust-ed" every time the files change
    def sass_cache_bust(file_name)
      puts "sass_cache_bust called with file_name: #{file_name}"
      CacheDigester.new(file_name: file_name, directory: '_sass').digest!
    end

    # Gets Md5 contents of all js assets in _assets/javascripts/
    # and appends a hash end of the target asset file. Ensures deployed
    # files are "cachebust-ed" every time the files change. Using
    # jekyll-assests requires first capturing the asset_path string, and
    # passing the path to this filter in a subsequent liquid call
    def js_cache_bust(file_name)
      puts "js_cache_bust called with file_name: #{file_name}"
      file_name.gsub!('.js', '.min.js') if ENV['JEKYLL_ENV'] == 'production'
      CacheDigester.new(file_name: file_name, directory: '_assets/javascripts').digest!
    end
  end
end

Liquid::Template.register_filter(Jekyll::CacheBustFilters)