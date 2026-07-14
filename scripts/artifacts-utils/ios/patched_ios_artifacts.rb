# Consumer for Expensify's patched React Native iOS prebuilt artifacts.
# Reopens ReactNativeCoreUtils (rncore.rb) to point RNCore resolution and
# download at our private GitHub Packages Maven repo (matched by patches hash).
# Must be required after react_native_pods.rb, which defines ReactNativeCoreUtils.

require 'json'

module PatchedIOSArtifacts
    # scripts/artifacts-utils/ios/ -> repo root is three levels up.
    NEW_DOT_ROOT = File.expand_path('../../..', __dir__)
    GITHUB_PACKAGES_BASE = 'https://maven.pkg.github.com/Expensify/App'

    def self.setup
        is_hybrid = ENV['IS_HYBRID_APP'] == 'true'
        package_name = is_hybrid ? 'react-hybrid' : 'react-standalone'

        forced_source = ENV['RCT_USE_PREBUILT_RNCORE'] == '0'
        resolution = forced_source ? {'buildFromSource' => true, 'version' => nil} : resolve(package_name, is_hybrid)

        ReactNativeCoreUtils.class_variable_set(:@@patched_version, resolution['version'])
        ReactNativeCoreUtils.class_variable_set(:@@patched_package_name, package_name)
        ReactNativeCoreUtils.class_variable_set(:@@patched_github_token, resolution['githubToken'])
        ReactNativeCoreUtils.class_variable_set(:@@patched_build_from_source, resolution['buildFromSource'])

        ENV['RCT_USE_PREBUILT_RNCORE'] = resolution['buildFromSource'] ? '0' : '1'
    end

    def self.resolve(package_name, is_hybrid)
        cmd = [
            'bun', File.join(NEW_DOT_ROOT, 'scripts/artifacts-utils/resolve-artifacts.ts'),
            '--platform=ios', "--package=#{package_name}", "--hybrid=#{is_hybrid}", "--new-dot-root=#{NEW_DOT_ROOT}"
        ]
        # stdout is pure JSON; the resolver logs to stderr.
        output = IO.popen(cmd, chdir: NEW_DOT_ROOT, &:read)
        raise "resolver exited #{$?.exitstatus}" unless $?.success?
        JSON.parse(output)
    rescue => e
        Pod::UI.warn("[PatchedIOSArtifacts] Resolver failed (#{e.message}); building from source.") if defined?(Pod::UI)
        {'buildFromSource' => true, 'version' => nil}
    end
end

class ReactNativeCoreUtils
    def self.setup_rncore(react_native_path, _react_native_version)
        @@react_native_path = react_native_path
        @@build_from_source = @@patched_build_from_source
        @@download_dsyms = ENV['RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS'] == '1'
    end

    def self.stable_tarball_url(_version, build_type, dsyms = false)
        classifier = "reactnative-core-#{dsyms ? 'dSYM-' : ''}#{build_type}"
        "#{PatchedIOSArtifacts::GITHUB_PACKAGES_BASE}/com/expensify/#{@@patched_package_name}/react-native-artifacts/#{@@patched_version}/react-native-artifacts-#{@@patched_version}-#{classifier}.tar.gz"
    end

    def self.download_rncore_tarball(_react_native_path, tarball_url, version, configuration, dsyms = false)
        dir = artifacts_dir
        destination = configuration.nil? ?
            "#{dir}/reactnative-core-#{version}#{dsyms ? '-dSYM' : ''}.tar.gz" :
            "#{dir}/reactnative-core-#{version}#{dsyms ? '-dSYM' : ''}-#{configuration}.tar.gz"

        unless File.exist?(destination)
            tmp = "#{dir}/reactnative-core.download"
            # curl drops the Authorization header on the cross-host redirect to the object store.
            header = @@patched_github_token ? %(-H "Authorization: Bearer #{@@patched_github_token}") : ''
            ok = system(%(mkdir -p "#{dir}" && curl --fail --location --proto '=https' #{header} "#{tarball_url}" -o "#{tmp}" && mv "#{tmp}" "#{destination}"))
            raise "[PatchedIOSArtifacts] Failed to download #{tarball_url}" unless ok
        end
        destination
    end
end
