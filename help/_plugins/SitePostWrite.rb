require 'open3'

module Jekyll
  class SitePostWrite
    # Hook into Jekyll's post_write stage, which runs after all files have been written
    Jekyll::Hooks.register :site, :post_write do |site|
      process_site(site)
    end

    def self.process_site(site)
      # Define the path to your Node.js script
      script_path = File.join(site.source, '_scripts', 'generateSearchIndex.js')

      # Run the Node.js script using Open3.popen3 to stream stdout and stderr
      puts "Running Node.js script to generate search index: #{script_path}"

      Open3.popen3("node", script_path) do |stdin, stdout, stderr, wait_thr|
        # Stream stdout and stderr to the calling process
        stdout_thread = Thread.new do
          stdout.each { |line| puts line }
        end

        stderr_thread = Thread.new do
          stderr.each { |line| warn line }
        end

        # Wait for both stdout and stderr threads to finish
        stdout_thread.join
        stderr_thread.join

        # Check if the process was successful
        exit_status = wait_thr.value
        unless exit_status.success?
          raise "Search index generation failed with exit code #{exit_status.exitstatus}"
        end
      end
      puts "Search index generated successfully"
    end
  end
end

