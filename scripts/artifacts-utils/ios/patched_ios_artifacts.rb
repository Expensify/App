# Consumer for Expensify's patched React Native iOS prebuilt artifacts.
# Reopens ReactNativeCoreUtils (rncore.rb) to point RNCore resolution and
# download at our private GitHub Packages Maven repo (matched by patches hash).
# Must be required after react_native_pods.rb, which defines ReactNativeCoreUtils.

require 'digest'
require 'fileutils'
require 'json'
require 'uri'

module PatchedIOSArtifacts
    # scripts/artifacts-utils/ios/ -> repo root is three levels up.
    NEW_DOT_ROOT = File.expand_path('../../..', __dir__)

    # Whether this install consumes a prebuilt RNCore. Defaults to false so that if
    # setup never ran, prebuilt-only pod tweaks are a no-op rather than misapplied.
    @using_prebuilt = false

    # Tarballs fetched during setup, keyed by remote URL, so nothing downloads mid-install.
    @prefetched = {}

    # Matches the resolver and Gradle, so one tag covers artifact logging on both platforms.
    LOG_PREFIX = '[PatchedArtifacts]'

    def self.log(message, level = :info)
        return unless defined?(Pod::UI)
        level == :error ? Pod::UI.warn("#{LOG_PREFIX} #{message}") : Pod::UI.puts("#{LOG_PREFIX} #{message}")
    end

    def self.setup
        is_hybrid = ENV['IS_HYBRID_APP'] == 'true'

        # Manual escape hatch: force a full from-source build (e.g. to unblock a prebuild issue).
        build_from_source = ENV['BUILD_RN_FROM_SOURCE'] == '1'
        # The escape hatch short-circuits before anything touches the network: no resolver, no prefetch.
        resolution = build_from_source ? {'buildFromSource' => true, 'version' => nil} : prefetch(resolve(is_hybrid))

        # A single decision drives both prebuilt flags, so we never land in a mixed
        # prebuilt-deps / source-core state (which desyncs the CocoaPods sandbox).
        @using_prebuilt = !resolution['buildFromSource']
        flag = @using_prebuilt ? '1' : '0'
        ENV['RCT_USE_RN_DEP'] = flag
        ENV['RCT_USE_PREBUILT_RNCORE'] = flag

        ReactNativeCoreUtils.class_variable_set(:@@patched_version, resolution['version'])
        # The resolver hands us the artifact URL prefix, so Maven coordinates live only in the resolver.
        ReactNativeCoreUtils.class_variable_set(:@@patched_artifact_url_prefix, resolution['artifactUrlPrefix'])
        ReactNativeCoreUtils.class_variable_set(:@@patched_github_token, resolution['githubToken'])
        ReactNativeCoreUtils.class_variable_set(:@@patched_build_from_source, resolution['buildFromSource'])

        # Content identity of this install's artifacts; '+dsym' so flipping the flag counts as a change.
        @artifacts_stamp = @using_prebuilt ?
            "#{resolution['version']}#{ENV['RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS'] == '1' ? '+dsym' : ''}" : nil

        force_rncore_podspec_reevaluation if @using_prebuilt
    end

    def self.artifacts_stamp_path
        File.join(Pod::Config.instance.project_pods_root, 'ReactNativeCore-artifacts', '.artifacts-version')
    end

    # CocoaPods memoizes external :podspec sources and may skip re-reading ours, whose source is
    # resolved dynamically. When the tarballs in Pods don't match this install's resolution, drop
    # the memoized copy so CocoaPods re-evaluates the podspec, re-running our download (and dSYM
    # merge). The re-read podspec is byte-identical, so Podfile.lock stays put.
    def self.force_rncore_podspec_reevaluation
        return if File.exist?(artifacts_stamp_path) && File.read(artifacts_stamp_path) == @artifacts_stamp

        Pod::Config.instance.sandbox.remove_local_podspec('React-Core-prebuilt')
        log("Artifacts changed to #{@artifacts_stamp}; the React-Core-prebuilt podspec will be re-evaluated.")
    end

    # Prepends sync-prebuilt-rncore.sh to react-native's '[RNCore] Replace ...' build phase, so a
    # build re-extracts the prebuilt React Core when the artifact version changed — CocoaPods won't,
    # as its caches key on our never-changing source URL. Prepended into that phase (not added as
    # its own) because CocoaPods sorts phases by name on save, which would push ours after [RNCore].
    def self.add_sync_prebuilt_script_phase(installer)
        return unless @using_prebuilt

        target = installer.pods_project.targets.find { |t| t.name == 'React-Core-prebuilt' }
        phase = target&.shell_script_build_phases&.find { |p| p.name.to_s.include?('[RNCore] Replace') }
        raise "#{LOG_PREFIX} The [RNCore] Replace build phase was not found on the React-Core-prebuilt target, " \
              'so the extracted prebuilt React Core would keep following a stale artifact version.' unless phase

        prelude = %(bash "#{File.join(NEW_DOT_ROOT, 'scripts/artifacts-utils/ios/sync-prebuilt-rncore.sh')}" || exit 1\n)
        phase.shell_script = prelude + phase.shell_script unless phase.shell_script.start_with?(prelude)
    end

    # True only when a matching prebuilt artifact resolved and prebuilds are enabled.
    def self.using_prebuilt_rncore?
        @using_prebuilt
    end

    # Applies pod tweaks that are only correct when consuming a prebuilt RNCore.
    # No-op on a source build (manual override or patch-hash miss), so a fallback
    # never inherits prebuilt-only configuration.
    def self.configure_prebuilt_pods(installer)
        return unless @using_prebuilt

        assert_local_rncore_source(installer)

        installer.pod_targets.each do |pod|
            # RNFB and RNSentry #import non-modular <React/...> headers, which under
            # use_frameworks! with a prebuilt React Core trips Clang's modular-import
            # rules. As static libraries they have no module map, so those rules no
            # longer apply.
            next unless pod.name.start_with?('RNFB', 'RNSentry')
            def pod.build_type
                Pod::BuildType.static_library
            end
        end
    end

    # CocoaPods downloads podspec sources itself, without our token, so a remote URL here always 401s.
    # Runs before pods download, to name the cause instead of leaving a bare curl failure.
    def self.assert_local_rncore_source(installer)
        source = installer.pod_targets.find { |pod| pod.name == 'React-Core-prebuilt' }&.root_spec&.source
        url = source.is_a?(Hash) ? source[:http].to_s : ''
        return unless url.start_with?('http://', 'https://')
        raise "#{LOG_PREFIX} React-Core-prebuilt resolved to the remote URL #{url}, which CocoaPods " \
              'cannot authenticate against. Its source must be the tarball we download ourselves — check whether ' \
              'react-native changed how it resolves the prebuilt RNCore podspec source.'
    end

    # Shared with stable_tarball_url, so the prefetch cannot miss a classifier the install asks for.
    def self.classifier(build_type, dsyms)
        "reactnative-core-#{dsyms ? 'dSYM-' : ''}#{build_type}"
    end

    def self.required_classifiers
        build_types = [:debug, :release]
        # dSYMs only when asked for, matching ReactNativeCoreUtils' @@download_dsyms.
        dsym_types = ENV['RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS'] == '1' ? build_types : []
        build_types.map { |type| classifier(type, false) } + dsym_types.map { |type| classifier(type, true) }
    end

    def self.prefetched_path(tarball_url)
        @prefetched[tarball_url]
    end

    # Mirrors react-native's own artifact cache, keyed by package and artifact version: our filenames are
    # indistinguishable from vanilla ones, and the hybrid and standalone packages number their versions
    # independently, so a version alone does not identify an artifact. Each package keeps a single
    # version, so the cache cannot grow over time and one package never evicts the other.
    CACHE_ROOT = File.join(Dir.home, 'Library', 'Caches', 'Expensify', 'react-native-artifacts')

    def self.prune_cache(package, version)
        Dir.glob(File.join(CACHE_ROOT, package, '*')).each do |entry|
            next if File.basename(entry) == version
            FileUtils.rm_rf(entry)
            log("Removed stale cached artifacts for #{package}:#{File.basename(entry)}")
        end
    end

    # Fetches everything the install needs while the prebuilt/source decision is still reversible, so
    # any failure downgrades to a source build. After pod resolution, switching would leave a mixed sandbox.
    def self.prefetch(resolution)
        return resolution if resolution['buildFromSource']

        package = resolution['packageName'].to_s
        version = resolution['version'].to_s
        prefetched = {}
        required_classifiers.each do |name|
            url = "#{resolution['artifactUrlPrefix']}-#{name}.tar.gz"
            destination = File.join(CACHE_ROOT, package, version, "#{name}.tar.gz")
            prefetched[url] = download_and_verify(url, destination, resolution['githubToken'])
        end
        prune_cache(package, version)
        @prefetched = prefetched
        resolution
    rescue => e
        log("#{e.message} Building react-native from source.", :error)
        @prefetched = {}
        {'buildFromSource' => true, 'version' => nil}
    end

    # curl drops the Authorization header on the cross-host redirect to the object store.
    def self.auth_header(github_token)
        github_token ? %(-H "Authorization: Bearer #{github_token}") : ''
    end

    # react-native's validate_tarball, plus the token its own curl cannot carry. As upstream does, a
    # checksum Maven does not serve skips validation rather than failing the fetch.
    def self.checksum_valid?(path, name, url, github_token)
        expected = `curl -sL #{auth_header(github_token)} "#{url}.sha1"`.strip.downcase
        unless $?.success? && expected.match?(/\A[a-f0-9]{40}\z/)
            log("SHA1 not available from Maven for #{name}. Skipping validation.")
            return true
        end
        actual = Digest::SHA1.file(path).hexdigest
        if actual == expected
            log("SHA1 verified for #{name}")
            return true
        end
        log("SHA1 mismatch for #{name}: expected #{expected}, got #{actual}", :error)
        false
    end

    # Verified here because a corrupt archive would otherwise only surface at extraction, too late to fall back.
    def self.download_and_verify(url, destination, github_token)
        name = File.basename(destination)
        if File.exist?(destination)
            log("Cache hit: #{name} already in #{File.dirname(destination)}. Skipping download.")
            return destination
        end

        log("Cache miss: downloading #{name} from #{url}")
        tmp = "#{destination}.download"
        FileUtils.mkdir_p(File.dirname(destination))
        downloaded = system(%(curl --fail --location --proto '=https' #{auth_header(github_token)} "#{url}" -o "#{tmp}"))
        log("Verifying checksum for #{name}...") if downloaded
        unless downloaded && checksum_valid?(tmp, name, url, github_token)
            FileUtils.rm_f(tmp)
            raise "Could not fetch a usable #{name} from #{url}."
        end
        FileUtils.mv(tmp, destination)
        destination
    end

    def self.resolve(is_hybrid)
        cmd = [
            'bun', File.join(NEW_DOT_ROOT, 'scripts/artifacts-utils/resolve-artifacts.ts'),
            '--platform=ios', "--hybrid=#{is_hybrid}", "--new-dot-root=#{NEW_DOT_ROOT}"
        ]
        # stdout is pure JSON; the resolver logs to stderr.
        output = IO.popen(cmd, chdir: NEW_DOT_ROOT, &:read)
        raise "resolver exited #{$?.exitstatus}" unless $?.success?
        JSON.parse(output)
    rescue => e
        log("Resolver failed (#{e.message}); building from source.", :error)
        {'buildFromSource' => true, 'version' => nil}
    end
end

class ReactNativeCoreUtils
    def self.setup_rncore(react_native_path, react_native_version)
        @@react_native_path = react_native_path
        # Base RN version (e.g. 0.85.3) — used by RN's install flow as a non-empty guard. The actual
        # download URL uses @@patched_version via our stable_tarball_url override, so this stays the plain version.
        @@react_native_version = react_native_version
        @@build_from_source = @@patched_build_from_source
        @@download_dsyms = ENV['RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS'] == '1'
    end

    def self.stable_tarball_url(_version, build_type, dsyms = false)
        "#{@@patched_artifact_url_prefix}-#{PatchedIOSArtifacts.classifier(build_type, dsyms)}.tar.gz"
    end

    # Since 0.86 react-native returns the remote URL here unless dSYMs are downloaded, leaving the
    # download to CocoaPods, which sends no Authorization header. Point the podspec at our own
    # authenticated download instead — unconditionally, so RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS stops
    # changing how the source resolves. Release is needed too: the script phase swaps it in at compile time.
    def self.podspec_source_download_prebuild_stable_tarball
        return if @@build_from_source

        debug = download_stable_rncore(@@react_native_path, @@react_native_version, :debug)
        release = download_stable_rncore(@@react_native_path, @@react_native_version, :release)

        if @@download_dsyms
            process_dsyms(debug, download_stable_rncore(@@react_native_path, @@react_native_version, :debug, true))
            process_dsyms(release, download_stable_rncore(@@react_native_path, @@react_native_version, :release, true))
        end

        # Content version of the flat tarballs — their names can't carry it, replace-rncore-version.js hardcodes them.
        File.write(File.join(File.dirname(debug), '.artifacts-version'),
                   "#{@@patched_version}#{@@download_dsyms ? '+dsym' : ''}")

        # URI::File.build validates path components as ASCII, so escape the filesystem path first —
        # matches RN 0.86's own ReactNativePodsUtils.local_file_uri, which this replaces.
        {:http => URI::File.build(path: URI::DEFAULT_PARSER.escape(debug)).to_s}
    end

    # Overriding this also keeps our artifacts out of react-native's shared cache, where their filenames
    # would be indistinguishable from vanilla ones. That cache still serves ReactNativeDependencies.
    def self.download_rncore_tarball(_react_native_path, tarball_url, version, configuration, dsyms = false)
        dir = artifacts_dir
        destination = configuration.nil? ?
            "#{dir}/reactnative-core-#{version}#{dsyms ? '-dSYM' : ''}.tar.gz" :
            "#{dir}/reactnative-core-#{version}#{dsyms ? '-dSYM' : ''}-#{configuration}.tar.gz"

        prefetched = PatchedIOSArtifacts.prefetched_path(tarball_url)
        if prefetched
            # Overwrite unconditionally: this filename carries only the react-native version, so a leftover
            # from an earlier patches version looks identical to the one we actually resolved.
            FileUtils.mkdir_p(dir)
            FileUtils.cp(prefetched, destination)
            PatchedIOSArtifacts.log("Installed #{File.basename(destination)} into Pods from cache")
        elsif !File.exist?(destination)
            # Only if something asks for a classifier the prefetch did not anticipate. abort, because
            # react-native rescues exceptions here and carries on with a nil source.
            FileUtils.mkdir_p(dir)
            tmp = "#{dir}/reactnative-core.download"
            # curl drops the Authorization header on the cross-host redirect to the object store.
            header = @@patched_github_token ? %(-H "Authorization: Bearer #{@@patched_github_token}") : ''
            ok = system(%(curl --fail --location --proto '=https' #{header} "#{tarball_url}" -o "#{tmp}" && mv "#{tmp}" "#{destination}"))
            abort("#{PatchedIOSArtifacts::LOG_PREFIX} Failed to download #{tarball_url}") unless ok
        end
        destination
    end
end
