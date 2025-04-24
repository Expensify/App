#!/usr/bin/env ruby

# This file is a lightweight port of the `pod ipc spec` command.
# It was built from scratch to imports some 3rd party functions before reading podspecs

require 'cocoapods'
require 'json'

# Require 3rd party functions needed to parse podspecs. This code is copied from ios/Podfile
def node_require(script)
  # Resolve script with node to allow for hoisting
  require Pod::Executable.execute_command('node', ['-p',
    "require.resolve(
      '#{script}',
      {paths: [process.argv[1]]},
    )", __dir__]).strip
end
node_require('react-native/scripts/react_native_pods.rb')
node_require('react-native-permissions/scripts/setup.rb')

# Configure pod in silent mode
Pod::Config.instance.silent = true

# Process command-line arguments
podspec_files = ARGV

# Validate each podspec file
podspec_files.each do |podspec_file|
  begin
    spec = Pod::Specification.from_file(podspec_file)
    puts(spec.to_pretty_json)
  rescue => e
    STDERR.puts "Failed to validate #{podspec_file}: #{e.message}"
  end
end
