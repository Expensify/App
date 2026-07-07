require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "group-ib-fp"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://group-ib.com.git", :tag => "#{s.version}" }

  s.source_files = "ios/*.{h,m,mm,swift}"

  s.vendored_frameworks = ['iOS/Frameworks/GIBMobileSdk.xcframework', 'iOS/Frameworks/FPAppsCapability.xcframework', 'iOS/Frameworks/FPCallCapability.xcframework']

  install_modules_dependencies(s)
end
