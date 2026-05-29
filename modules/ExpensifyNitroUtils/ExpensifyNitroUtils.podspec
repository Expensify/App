require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ExpensifyNitroUtils"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/mrousavy/nitro.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => [
      "${PODS_ROOT}/RCT-Folly",
      "$(PODS_TARGET_SRCROOT)/cpp/third_party/glaze/include",
    ],
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++23",
  }

  load 'nitrogen/generated/ios/ExpensifyNitroUtils+autolinking.rb'
  add_nitrogen_files(s)

  # Glaze (cpp/third_party/glaze) requires C++23 — override nitrogen's c++20 default.
  s.pod_target_xcconfig = (s.attributes_hash['pod_target_xcconfig'] || {}).merge({
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++23",
  })

  install_modules_dependencies(s)
end
