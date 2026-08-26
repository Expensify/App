# Declares in the Podfile whether this install consumes prebuilt react-native artifacts or builds
# react-native from source, and raises when the resolved mode does not match.
#
# The two modes produce entirely different dependency graphs, and both Podfile.lock files are committed.
# `pod install` rewrites Podfile.lock on every run, and react-native resolves the mode partly from a
# HEAD request to Maven, so a transient failure is enough to move a lockfile by ~130KB.
#
# Require AFTER react_native_pods.rb and BEFORE use_react_native!.

module RNMode
    MODES = %i[source prebuilt].freeze
    LOG_PREFIX = '[RNMode]'.freeze

    # Intentional source build. Already consumed by Mobile-Expensify/iOS/Podfile.
    OPT_OUT_ENV_VAR = 'BUILD_RN_FROM_SOURCE'.freeze
    ALLOW_OVERRIDES_ENV_VAR = 'EXPENSIFY_RN_ALLOW_ENV_OVERRIDES'.freeze

    # react-native's test-only overrides. Each one can move a lockfile on its own, and a local
    # artifact path outranks the mode flags entirely in react-native's own resolution. A stale
    # `export` in a shell is indistinguishable from a deliberate one, so they are cleared by default.
    SCRUBBED_ENV_VARS = %w[
        RCT_USE_LOCAL_RN_DEP
        RCT_TESTONLY_RNCORE_TARBALL_PATH
        RCT_DEPS_VERSION
        RCT_TESTONLY_RNCORE_VERSION
        ENTERPRISE_REPOSITORY
        RCT_BUILD_HERMES_FROM_SOURCE
        HERMES_ENGINE_TARBALL_PATH
        REACT_NATIVE_OVERRIDE_HERMES_DIR
        HERMES_COMMIT
        USE_THIRD_PARTY_JSC
        RCT_SKIP_CODEGEN
        DISABLE_CODEGEN
        RCT_IGNORE_PODS_DEPRECATION
        EXPO_USE_PRECOMPILED_MODULES
        EXPO_PRECOMPILED_MODULES_PATH
        EXPO_PRECOMPILED_MODULES_BASE_URL
        EXPO_PRECOMPILED_FLAVOR
        PROJECT_ROOT
        HERMES_OVERRIDE_HERMESC_PATH
        INSTALL_YOGA_FROM_LOCATION
        FIREBASE_SDK_VERSION
        USE_HERMES
        EXPO_IMAGE_DISABLE_LIBDAV1D
        IS_REANIMATED_EXAMPLE_APP
        REACT_NATIVE_WORKLETS_NODE_MODULES_DIR
    ].freeze

    # Deliberately NOT scrubbed, because this repo sets them itself:
    #   REACT_NATIVE_NODE_MODULES_DIR        Mobile-Expensify/iOS/Podfile
    #   RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS  PatchedIOSArtifacts.required_classifiers
    #   CI / GITHUB_TOKEN / GITHUB_ACTOR     the resolver's credential source

    # Values both Podfile files depend on, set here so the ambient shell cannot supply a different one.
    # USE_FRAMEWORKS is the subtle one: ReactNativePodsUtils.detect_use_frameworks returns early when
    # it is already set, so an exported value silently outranks the Podfile's own `use_frameworks!`.
    # 'static' is what that detection derives from `:linkage => :static` anyway.
    PINNED_ENV_VARS = {
        'USE_FRAMEWORKS' => 'static',
        'RCT_NEW_ARCH_ENABLED' => '1',
        'RCT_HERMES_V1_ENABLED' => '1',
    }.freeze

    # Ours and PatchedIOSArtifacts', never the invoking shell's.
    MODE_ENV_VARS = %w[RCT_USE_RN_DEP RCT_USE_PREBUILT_RNCORE].freeze

    # Bounds connection setup rather than total transfer: upstream had no timeout at all, so a slow
    # but working Maven must still succeed.
    CONNECT_TIMEOUT_SECONDS = 5
    PROBE_TIMEOUT_SECONDS = 30
    PROBE_ATTEMPTS = 3

    @mode = nil
    @downgrade_reasons = []

    class << self
        attr_reader :mode

        def log(message, level = :info)
            return unless defined?(Pod::UI)
            level == :error ? Pod::UI.warn("#{LOG_PREFIX} #{message}") : Pod::UI.puts("#{LOG_PREFIX} #{message}")
        end

        # Call once per Podfile, before use_react_native!.
        def declare!(mode)
            raise ArgumentError, "#{LOG_PREFIX} Unknown mode #{mode.inspect} (expected one of #{MODES.inspect})" unless MODES.include?(mode)

            @mode = mode
            @downgrade_reasons = []
            scrub_environment!
            # In :prebuilt mode PatchedIOSArtifacts.setup owns these, and sets both from one
            # resolution so RNCore and ReactNativeDependencies cannot disagree.
            MODE_ENV_VARS.each { |name| ENV[name] = '0' } if source?
            PINNED_ENV_VARS.each { |name, value| ENV[name] = value }
            install_hooks!
            # The opt-out only relaxes the :prebuilt direction, so it is only worth announcing there.
            relaxed = opted_out? && !source?
            log("Mode declared: #{mode}#{relaxed ? " (#{OPT_OUT_ENV_VAR}=1, source fallbacks allowed)" : ''}")
        end

        def source?
            @mode == :source
        end

        def opted_out?
            ENV[OPT_OUT_ENV_VAR] == '1'
        end

        # Recorded, not raised on: the layer that knows the cause does not know whether a source
        # build was asked for.
        def record_downgrade(reason)
            @downgrade_reasons << reason
            log(reason, :error)
        end

        def check_deps!(build_from_source)
            check_mode!(build_from_source, 'ReactNativeDependencies')
        end

        def check_rncore!(using_prebuilt)
            check_mode!(!using_prebuilt, 'React-Core-prebuilt')
        end

        # hermes-engine resolves its own source independently of the mode flags, and both
        # Podfile.lock files pin the prebuilt tarball, so this applies in either mode.
        def check_hermes!(source_type)
            return if @mode.nil?
            return if HermesEngineSourceType.isPrebuilt(source_type)
            return if opted_out?

            banner("hermes-engine resolved to #{source_type}, not the prebuilt tarball both Podfile.lock files pin.",
                   "This rewrites hermes-engine's pod source, version and checksum in Podfile.lock.",
                   "hermes-engine is no longer pinned to a prebuilt tag; do not commit the resulting Podfile.lock.")
        end

        private

        # A degraded install still produces a working app, so it warns and carries on — matching
        # react-native's own contract that prebuilt artifacts are an optimization. What must not
        # happen is the guess reaching main, so the committed file is guarded by a marker-pod check
        # in CI, where a human can still reject it.
        def check_mode!(build_from_source, component)
            # No mode declared: stay out of the way.
            return if @mode.nil?
            return if build_from_source == source?

            if build_from_source
                return if opted_out?
                banner("#{component} fell back to building react-native from source, but this Podfile declares :prebuilt.",
                       'react-native will be compiled from source. The build succeeds; Podfile.lock is written in source-build mode.')
                return
            end

            # Only reachable if something re-set a prebuilt override after declare! ran, which is a
            # broken configuration rather than a degraded network — so this one still stops.
            raise <<~MESSAGE
                #{LOG_PREFIX} #{component} resolved to prebuilt artifacts, but this Podfile declares :source.

                Something set a prebuilt or local-artifact override after RNMode.declare!(:source) ran.
                Check for #{(MODE_ENV_VARS + SCRUBBED_ENV_VARS).join(', ')} in your shell and in any wrapper script.
            MESSAGE
        end

        def banner(headline, consequence, summary = 'Podfile.lock is written in source-build mode; do not commit it.')
            body = [
                '',
                "#{LOG_PREFIX} #{headline}",
                '',
                reasons_block.chomp,
                '',
                consequence,
                '',
                "Do not commit the resulting Podfile.lock. Re-run once the cause is fixed, or set",
                "#{OPT_OUT_ENV_VAR}=1 to silence this when the source build is deliberate.",
                '',
            ].join("\n")

            if defined?(Pod::UI)
                Pod::UI.puts(body)
                # Also registered so it reappears in the summary CocoaPods prints when the run ends.
                Pod::UI.warn("#{LOG_PREFIX} #{headline} #{summary}")
            else
                $stderr.puts(body)
            end
        end

        def reasons_block
            return "No cause was recorded, which itself is a bug worth reporting.\n" if @downgrade_reasons.empty?
            "Cause:\n#{@downgrade_reasons.map { |reason| "  - #{reason}" }.join("\n")}\n"
        end

        def scrub_environment!
            # Ours to set, so an inherited value is always stale.
            MODE_ENV_VARS.each { |name| ENV.delete(name) }

            present = SCRUBBED_ENV_VARS.select { |name| ENV[name] && !ENV[name].empty? }
            return if present.empty?

            if ENV[ALLOW_OVERRIDES_ENV_VAR] == '1'
                log("Keeping react-native overrides from the environment (#{ALLOW_OVERRIDES_ENV_VAR}=1): #{present.join(', ')}. Podfile.lock may not be reproducible.", :error)
                return
            end

            present.each { |name| ENV.delete(name) }
            log("Ignoring react-native overrides found in the environment: #{present.join(', ')}. Re-run with #{ALLOW_OVERRIDES_ENV_VAR}=1 to keep them.", :error)
        end

        # Reopened rather than patched: anything under patches/ feeds the artifact hash, so a patch
        # here would invalidate every published artifact.
        def install_hooks!
            return if @hooks_installed
            @hooks_installed = true

            verify_hook_targets!
            ReactNativeDependenciesUtils.singleton_class.prepend(DepsHooks)
            # hermes-utils.rb defines its helpers at top level, so they are private instance methods
            # on Object. It is required by hermes-engine.podspec, which CocoaPods evaluates after the
            # Podfile, so `super` resolves by the time these run.
            Object.prepend(HermesHooks)
        end
    end

    module DepsHooks
        def setup_react_native_dependencies(react_native_path, react_native_version)
            super
            RNMode.check_deps!(build_react_native_deps_from_source)
        end

        # Upstream issues one `curl -I` with no timeout and no retry, and compares the status to
        # "200", so a timeout or a 503 reads as "artifact does not exist". Retry, and classify the
        # outcome, so that check_deps! can distinguish an absent artifact from an unreachable one.
        def artifact_exists(tarball_url)
            status, detail = RNMode.send(:probe, tarball_url)
            case status
            when :present
                true
            when :absent
                RNMode.record_downgrade("Maven has no ReactNativeDependencies artifact at #{tarball_url} (HTTP 404).")
                false
            else
                RNMode.record_downgrade("Could not reach #{tarball_url} after #{PROBE_ATTEMPTS} attempts (#{detail}).")
                false
            end
        end
    end

    # hermes_source_type falls through to an unguarded `curl -I` with no timeout and no retry, and
    # no flag disables it, so hermes-engine can flip to a git-commit source in either mode.
    module HermesHooks
        def hermes_artifact_exists(tarball_url)
            status, detail = RNMode.send(:probe, tarball_url)
            return true if status == :present

            RNMode.record_downgrade(
                status == :absent ?
                    "Maven has no hermes-engine artifact at #{tarball_url} (HTTP 404)." :
                    "Could not reach #{tarball_url} after #{PROBE_ATTEMPTS} attempts (#{detail}).",
            )
            false
        end

        def hermes_source_type(version, react_native_path)
            super.tap { |source_type| RNMode.check_hermes!(source_type) }
        end
    end

    class << self
        private

        # A prepend over a method react-native has renamed is simply never called — no error, and the
        # guard is silently gone. Warn rather than raise, so a bump PR sees it without being blocked.
        def verify_hook_targets!
            missing = []
            %i[artifact_exists setup_react_native_dependencies build_react_native_deps_from_source].each do |name|
                missing << "ReactNativeDependenciesUtils.#{name}" unless ReactNativeDependenciesUtils.respond_to?(name)
            end
            # The hermes helpers cannot be checked here: hermes-utils.rb is required by
            # hermes-engine.podspec, which CocoaPods evaluates after the Podfile. HermesHooks still
            # prepends correctly against a later definition, but a rename there stays undetectable.
            return if missing.empty?

            log("react-native no longer defines #{missing.join(', ')}, so those checks are inactive. " \
                'This usually means a react-native upgrade moved them.', :error)
        end

        # Returns [:present | :absent | :unreachable, detail].
        def probe(url)
            # Upstream's nightly helpers return "" when their metadata fetch fails.
            return [:unreachable, 'no tarball URL'] if url.to_s.empty?

            detail = nil
            PROBE_ATTEMPTS.times do |attempt|
                code = `curl -o /dev/null --silent -Iw '%{http_code}' -L --connect-timeout #{CONNECT_TIMEOUT_SECONDS} --max-time #{PROBE_TIMEOUT_SECONDS} "#{url}"`.strip
                reachable = $?.success?
                return [:present, nil] if reachable && code == '200'
                # A 404 is a fact about the artifact, not the network: do not retry.
                return [:absent, nil] if reachable && code == '404'
                detail = reachable ? "HTTP #{code}" : "curl exited #{$?.exitstatus}"
                # The 503s and rate limits this retry exists for need time to clear; without a pause
                # all three attempts hit the same overloaded edge within milliseconds.
                sleep(2**attempt) unless attempt == PROBE_ATTEMPTS - 1
            end
            [:unreachable, detail]
        end
    end
end
