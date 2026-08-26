# Drives RNMode against a stub of the react-native pieces it hooks, so the behaviour can be asserted
# without running a real pod install. Prints one line per case: "<name> <PASS|FAIL>".

module Pod
    module UI
        def self.puts(_message); end
        def self.warn(_message); end
    end
end

class ReactNativeDependenciesUtils
    @@build_from_source = true
    def self.build_react_native_deps_from_source; @@build_from_source; end
    def self.artifact_exists(_url); false; end
    def self.setup_react_native_dependencies(_path, _version)
        @@build_from_source = !(ENV['RCT_USE_RN_DEP'] == '1' && artifact_exists('https://example.invalid/x.tar.gz'))
    end
end

module HermesEngineSourceType
    DOWNLOAD_PREBUILD_RELEASE_TARBALL = :download_prebuild_release_tarball
    BUILD_FROM_GITHUB_MAIN = :build_from_github_main
    def self.isPrebuilt(type); type == DOWNLOAD_PREBUILD_RELEASE_TARBALL; end
end

def hermes_artifact_exists(_url); false; end

def hermes_source_type(_version, _react_native_path)
    hermes_artifact_exists('https://example.invalid/hermes.tar.gz') ?
        HermesEngineSourceType::DOWNLOAD_PREBUILD_RELEASE_TARBALL :
        HermesEngineSourceType::BUILD_FROM_GITHUB_MAIN
end

require_relative '../../../../scripts/artifacts-utils/ios/rn_mode'

def report(name, passed)
    puts "#{name} #{passed ? 'PASS' : 'FAIL'}"
end

def raises?
    yield
    false
rescue StandardError
    true
end

# A source-mode install pins the flags and never reaches the network.
ENV['RCT_USE_LOCAL_RN_DEP'] = '/tmp/stale.xcframework'
ENV['HERMES_ENGINE_TARBALL_PATH'] = '/tmp/stale.tar.gz'
ENV['RCT_USE_RN_DEP'] = '1'
RNMode.declare!(:source)
report('scrubs_overrides', ENV['RCT_USE_LOCAL_RN_DEP'].nil? && ENV['HERMES_ENGINE_TARBALL_PATH'].nil?)
report('pins_mode_flags', ENV['RCT_USE_RN_DEP'] == '0' && ENV['RCT_USE_PREBUILT_RNCORE'] == '0')
report('pins_shared_vars', ENV['USE_FRAMEWORKS'] == 'static' && ENV['RCT_HERMES_V1_ENABLED'] == '1')

# A degraded prebuilt install warns but does not stop: the product requirement.
RNMode.declare!(:prebuilt)
ENV['RCT_USE_RN_DEP'] = '1'
report('degraded_install_continues', !raises? { ReactNativeDependenciesUtils.setup_react_native_dependencies('.', '0.0.1') })

# A prebuilt resolution under a :source declaration is a broken configuration, so it does stop.
ENV['BUILD_RN_FROM_SOURCE'] = '1'
RNMode.declare!(:source)
report('prebuilt_in_source_mode_raises', raises? { RNMode.check_deps!(false) })
ENV.delete('BUILD_RN_FROM_SOURCE')

# hermes resolves through its own probe, and a fallback there must not stop the install either.
[:prebuilt, :source].each do |mode|
    RNMode.declare!(mode)
    report("hermes_fallback_continues_#{mode}", !raises? { hermes_source_type('1.0', '.') })
end

# A 404 is a durable answer about the artifact; anything else is about the network.
RNMode.declare!(:prebuilt)
absent = RNMode.send(:probe, 'https://repo1.maven.org/maven2/com/facebook/react/definitely-not-here.tar.gz')
unreachable = RNMode.send(:probe, 'https://no-such-host.invalid/x.tar.gz')
report('classifies_404_vs_unreachable', absent.first == :absent && unreachable.first == :unreachable)
report('empty_url_short_circuits', RNMode.send(:probe, '').first == :unreachable)
