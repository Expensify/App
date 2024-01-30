require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name            = "rtn-wallet"
  s.version         = package["version"]
  s.summary         = package["description"]
  s.description     = package["description"]
  s.homepage        = package["homepage"]
  s.license         = package["license"]
  s.platforms       = { :ios => "11.0" }
  s.author          = package["author"]
  s.source          = { :git => package["repository"], :tag => "#{s.version}" }

  s.source_files    = "ios/**/*.{h,m,mm,swift}"

  install_modules_dependencies(s)
end