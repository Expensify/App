# Consumer for Expensify's patched React Native iOS prebuilt artifacts.
#
# React Native already ships a full mechanism for consuming prebuilt RNCore
# artifacts (`ReactNativeCoreUtils` in
# node_modules/react-native/scripts/cocoapods/rncore.rb): version resolution ->
# podspec source -> download -> VFS overlay / xcconfig / dSYM wiring.
#
# We don't reimplement any of that. Ruby classes are open, so this file reopens
# `ReactNativeCoreUtils` and rewrites only the few seams that decide *which*
# artifact to fetch and *how* to authenticate — pointing them at OUR private
# GitHub Packages Maven repo (matched by patches hash). Everything else (VFS
# overlay, xcconfig, pod dependency, dSYM handling) is reused unchanged.
#
# IMPORTANT: this file MUST be required AFTER `react_native_pods.rb` (which
# defines ReactNativeCoreUtils), so our method definitions override the
# originals. The Podfile requires them in that order.

require 'json'

module PatchedIOSArtifacts
    # scripts/artifacts-utils/ios/ -> repo root is three levels up.
    NEW_DOT_ROOT = File.expand_path('../../..', __dir__)
    GITHUB_PACKAGES_BASE = 'https://maven.pkg.github.com/Expensify/App'

    def self.setup
        is_hybrid = ENV['IS_HYBRID_APP'] == 'true'
        package_name = is_hybrid ? 'react-hybrid' : 'react-standalone'

        # Custom RN core prebuilt is ON by default. Honor an explicit opt-out
        # (RCT_USE_PREBUILT_RNCORE=0 -> build from source, skip resolution).
        # Otherwise resolve a version matching the local patches; no match -> source.
        forced_source = ENV['RCT_USE_PREBUILT_RNCORE'] == '0'
        resolution = forced_source ? {'buildFromSource' => true, 'version' => nil} : resolve(package_name, is_hybrid)

        # Always stash our state as class variables — the reopened
        # ReactNativeCoreUtils methods below read them, including on the source path.
        ReactNativeCoreUtils.class_variable_set(:@@patched_version, resolution['version'])
        ReactNativeCoreUtils.class_variable_set(:@@patched_package_name, package_name)
        ReactNativeCoreUtils.class_variable_set(:@@patched_github_token, github_token)
        ReactNativeCoreUtils.class_variable_set(:@@patched_build_from_source, resolution['buildFromSource'])

        # Keep RN's podspec gate consistent with our decision (replaces the old
        # hardcoded `ENV['RCT_USE_PREBUILT_RNCORE'] = '1'`).
        ENV['RCT_USE_PREBUILT_RNCORE'] = resolution['buildFromSource'] ? '0' : '1'
    end

    def self.resolve(package_name, is_hybrid)
        cmd = [
            'npx', 'tsx', File.join(NEW_DOT_ROOT, 'scripts/artifacts-utils/resolve-artifacts.ts'),
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

    def self.github_token
        token = ENV['GITHUB_TOKEN']
        return token if token && !token.empty?
        `gh auth token`.strip
    rescue
        nil
    end
end

# --- Rewrite the ReactNativeCoreUtils seams to consume OUR artifacts. ---
class ReactNativeCoreUtils
    # Force our resolved decision; skip Meta's Maven-Central existence probe.
    def self.setup_rncore(react_native_path, _react_native_version)
        @@react_native_path = react_native_path
        @@build_from_source = @@patched_build_from_source
        @@download_dsyms = ENV['RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS'] == '1'
    end

    # Point the tarball URL at our private GitHub Packages Maven. The file-name
    # layout matches Meta's, so only base URL / group / version change.
    def self.stable_tarball_url(_version, build_type, dsyms = false)
        classifier = "reactnative-core-#{dsyms ? 'dSYM-' : ''}#{build_type}"
        "#{PatchedIOSArtifacts::GITHUB_PACKAGES_BASE}/com/expensify/#{@@patched_package_name}/react-native-artifacts/#{@@patched_version}/react-native-artifacts-#{@@patched_version}-#{classifier}.tar.gz"
    end

    # Authenticated, redirect-safe download: curl (>=7.58) drops the custom
    # Authorization header on the cross-host 302 to the object store, so the token
    # never leaks. Never pass --location-trusted.
    def self.download_rncore_tarball(_react_native_path, tarball_url, version, configuration, dsyms = false)
        dir = artifacts_dir
        destination = configuration.nil? ?
            "#{dir}/reactnative-core-#{version}#{dsyms ? '-dSYM' : ''}.tar.gz" :
            "#{dir}/reactnative-core-#{version}#{dsyms ? '-dSYM' : ''}-#{configuration}.tar.gz"

        unless File.exist?(destination)
            tmp = "#{dir}/reactnative-core.download"
            header = @@patched_github_token ? %(-H "Authorization: Bearer #{@@patched_github_token}") : ''
            ok = system(%(mkdir -p "#{dir}" && curl --fail --location --proto '=https' #{header} "#{tarball_url}" -o "#{tmp}" && mv "#{tmp}" "#{destination}"))
            raise "[PatchedIOSArtifacts] Failed to download #{tarball_url}" unless ok
        end
        destination
    end
end
