// cspell:ignore hermesv profdata devicectl libdav intops libwebp fprofile CPLUSPLUSFLAGS ARCHS profraw cnts hermesvm

/** iOS-specific release builds, signing, native profile persistence, retrieval, and instrumentation checks. */

import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';

import type {BenchmarkKind, BuildArtifactPaths, BuildKind, PgoMode, PlatformAdapter} from './shared';

import {BENCHMARK_SPANS_ENVIRONMENT, capture, environmentString, fail, findFiles, isRecord, rootDirectory, run, runAllowFailure, sleep, valueAt} from './shared';

function createIOSPgoAdapter(configuredAppID?: string, cliDeviceIdentifier?: string): PlatformAdapter {
    const profileFormat = 'ios-clang-frontend-swift-ir-v1';
    const profileDirectory = join(rootDirectory, '.pgo/ios/arm64');
    const rawProfileDirectory = join(profileDirectory, 'raw');
    const appDirectory = join(profileDirectory, 'app');
    const benchmarkDirectory = join(rootDirectory, '.pgo/ios/benchmarks');
    const markerDirectory = join(profileDirectory, 'markers');
    const iosDirectory = join(rootDirectory, 'Mobile-Expensify/iOS');
    const hermesVersionPath = join(rootDirectory, 'node_modules/react-native/sdks/.hermesv1version');
    const remotePgoDirectory = 'Library/Caches/ExpensifyPGO';
    const profileStatusPath = `${remotePgoDirectory}/profile-status.txt`;
    const profileWriteNotification = 'com.expensify.pgo.write-profiles';
    const profileClearNotification = 'com.expensify.pgo.clear-profiles';
    const profileOperationTimeoutSeconds = 10;
    const developmentTeam = environmentString('IOS_DEVELOPMENT_TEAM');
    const codeSigningAllowed = !['0', 'false', 'no'].includes((environmentString('IOS_CODE_SIGNING_ALLOWED') ?? 'yes').toLowerCase());
    const configuredBundleIdentifier = configuredAppID ?? environmentString('IOS_BUNDLE_IDENTIFIER');
    const mergedProfilePath = join(profileDirectory, 'newdot.profdata');

    const artifactPaths: BuildArtifactPaths = {
        release: join(appDirectory, 'Expensify-release.app'),
        instrumented: join(appDirectory, 'Expensify-release-instrumented.app'),
        optimized: join(appDirectory, 'Expensify-release-optimized.app'),
    };
    const benchmarkPaths: Record<BenchmarkKind, string> = {
        release: join(benchmarkDirectory, 'release.csv'),
        optimized: join(benchmarkDirectory, 'pgo-optimized.csv'),
    };

    let cachedDeviceIdentifier: string | undefined;
    let cachedBundleIdentifier: string | undefined;

    function bundleIdentifier(): string {
        if (cachedBundleIdentifier) {
            return cachedBundleIdentifier;
        }
        if (configuredBundleIdentifier) {
            cachedBundleIdentifier = configuredBundleIdentifier;
            return configuredBundleIdentifier;
        }

        const archivedApp = [artifactPaths.instrumented, artifactPaths.optimized, artifactPaths.release].find((path) => existsSync(join(path, 'Info.plist')));
        if (!archivedApp) {
            fail('No archived iOS app is available to determine its bundle identifier. Build an app first, or set IOS_BUNDLE_IDENTIFIER.');
        }
        cachedBundleIdentifier = capture('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleIdentifier', join(archivedApp, 'Info.plist')]).trim();
        if (!cachedBundleIdentifier) {
            fail(`The archived app at ${archivedApp} has no CFBundleIdentifier.`);
        }
        console.log(`Using iOS bundle identifier ${cachedBundleIdentifier}.`);
        return cachedBundleIdentifier;
    }

    function deviceIdentifier(): string {
        if (cachedDeviceIdentifier) {
            return cachedDeviceIdentifier;
        }

        const configuredIdentifier = cliDeviceIdentifier ?? environmentString('IOS_DEVICE_ID');
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-pgo-ios-devices-'));
        const jsonPath = join(temporaryDirectory, 'devices.json');
        try {
            run('xcrun', ['devicectl', 'list', 'devices', '--json-output', jsonPath]);
            const parsedDevices: unknown = JSON.parse(readFileSync(jsonPath, 'utf8'));
            if (!isRecord(parsedDevices) || !isRecord(parsedDevices.result) || !Array.isArray(parsedDevices.result.devices)) {
                fail('CoreDevice returned an unexpected device-list response.');
            }

            const physicalDevices = parsedDevices.result.devices.flatMap((device) => {
                if (!isRecord(device) || !isRecord(device.hardwareProperties) || !isRecord(device.deviceProperties)) {
                    return [];
                }
                const {hardwareProperties, deviceProperties} = device;
                if (hardwareProperties.platform !== 'iOS' || hardwareProperties.reality !== 'physical' || deviceProperties.bootState !== 'booted') {
                    return [];
                }
                if (typeof hardwareProperties.udid !== 'string' || typeof deviceProperties.name !== 'string') {
                    return [];
                }
                const name = deviceProperties.name.trim();
                const osVersion = typeof deviceProperties.osVersionNumber === 'string' ? deviceProperties.osVersionNumber : undefined;
                const aliases = [name, hardwareProperties.udid];
                if (typeof device.identifier === 'string') {
                    aliases.push(device.identifier);
                }
                if (typeof hardwareProperties.serialNumber === 'string') {
                    aliases.push(hardwareProperties.serialNumber);
                }
                if (osVersion) {
                    aliases.push(`${name} (${osVersion})`, `${name} (${osVersion}) (${hardwareProperties.udid})`);
                }
                return [{aliases, name, udid: hardwareProperties.udid}];
            });

            if (physicalDevices.length === 0) {
                fail('No booted physical iOS device is connected. Connect and unlock a device, or set IOS_DEVICE_ID.');
            }
            const normalizeSelector = (value: string) => value.trim().replaceAll(/\s+/g, ' ').toLowerCase();
            const matchingDevices = configuredIdentifier
                ? physicalDevices.filter(({aliases}) => aliases.some((alias) => normalizeSelector(alias) === normalizeSelector(configuredIdentifier)))
                : physicalDevices;
            if (matchingDevices.length === 0) {
                fail(`No connected physical iOS device matches "${configuredIdentifier}". Available devices: ${physicalDevices.map(({name, udid}) => `${name} (${udid})`).join(', ')}.`);
            }
            if (matchingDevices.length > 1) {
                fail(`Multiple physical iOS devices are connected (${physicalDevices.map(({name}) => name).join(', ')}). Set IOS_DEVICE_ID to the desired UDID.`);
            }

            const selectedDevice = valueAt(matchingDevices, 0);
            cachedDeviceIdentifier = selectedDevice.udid;
            console.log(`Using iOS device ${selectedDevice.name} (${selectedDevice.udid}).`);
            return selectedDevice.udid;
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    }

    function llvmTool(name: string): string {
        return capture('xcrun', ['--find', name]).trim();
    }

    function sourceBuildEnvironment(mode: PgoMode): string[] {
        const environment = [
            'BUILD_RN_FROM_SOURCE=1',
            'RCT_USE_RN_DEP=0',
            'RCT_USE_PREBUILT_RNCORE=0',
            'RCT_BUILD_HERMES_FROM_SOURCE=true',
            BENCHMARK_SPANS_ENVIRONMENT,
            `EXPENSIFY_PGO_MODE=${mode}`,
        ];
        if (mode === 'use') {
            environment.push(`EXPENSIFY_PGO_PROFILE=${mergedProfilePath}`);
        }
        return environment;
    }

    function prepareSourcePods(mode: PgoMode): void {
        if (!existsSync(hermesVersionPath)) {
            fail(`Missing React Native's pinned Hermes version file at ${hermesVersionPath}.`);
        }
        const requiredPodSources = [
            {directory: join(iosDirectory, 'Pods/hermes-engine'), requiredFile: 'CMakeLists.txt'},
            {directory: join(iosDirectory, 'Pods/libdav1d'), requiredFile: 'dav1d/include/common/intops.h'},
            {directory: join(iosDirectory, 'Pods/libwebp'), requiredFile: 'src/webp/types.h'},
        ];
        for (const {directory, requiredFile} of requiredPodSources) {
            if (existsSync(directory) && !existsSync(join(directory, requiredFile))) {
                console.log(`Removing incomplete CocoaPods checkout: ${directory}`);
                rmSync(directory, {recursive: true, force: true});
            }
        }
        run('/usr/bin/env', [...sourceBuildEnvironment(mode), 'bundle', 'exec', 'pod', 'install', '--silent'], iosDirectory);
        for (const {directory, requiredFile} of requiredPodSources) {
            if (!existsSync(join(directory, requiredFile))) {
                fail(`CocoaPods did not install the required source file ${join(directory, requiredFile)}.`);
            }
        }
        rmSync(join(iosDirectory, 'Pods/hermes-engine/build'), {recursive: true, force: true});
    }

    function pgoBuildSettings(kind: BuildKind): string[] {
        const baseSettings = ['ENABLE_CODE_COVERAGE=NO', 'CLANG_COVERAGE_MAPPING=NO', 'CLANG_USE_OPTIMIZATION_PROFILE=NO'];
        if (kind === 'instrumented') {
            return [
                ...baseSettings,
                'GCC_PREPROCESSOR_DEFINITIONS=$(inherited) EXPENSIFY_PGO_GENERATE=1',
                'OTHER_CFLAGS=$(inherited) -fprofile-instr-generate',
                'OTHER_CPLUSPLUSFLAGS=$(inherited) -fprofile-instr-generate',
                'OTHER_SWIFT_FLAGS=$(inherited) -ir-profile-generate',
                'OTHER_LDFLAGS=$(inherited) -fprofile-instr-generate',
            ];
        }
        if (kind === 'optimized') {
            const clangProfileFlags = `-fprofile-instr-use=${mergedProfilePath}`;
            return [
                ...baseSettings,
                `OTHER_CFLAGS=$(inherited) ${clangProfileFlags}`,
                `OTHER_CPLUSPLUSFLAGS=$(inherited) ${clangProfileFlags}`,
                `OTHER_SWIFT_FLAGS=$(inherited) -ir-profile-use=${mergedProfilePath}`,
            ];
        }
        return baseSettings;
    }

    function build(kind: BuildKind): void {
        if (kind === 'optimized' && !existsSync(mergedProfilePath)) {
            fail(`Missing ${mergedProfilePath}. Run merge first.`);
        }
        if (kind === 'optimized') {
            const profileFormatPath = `${mergedProfilePath}.format`;
            const recordedFormat = existsSync(profileFormatPath) ? readFileSync(profileFormatPath, 'utf8').trim() : undefined;
            if (recordedFormat !== profileFormat) {
                fail('The merged iOS profile predates the current Swift IR instrumentation. Install the latest instrumented app and run record-startups again.');
            }
        }

        let mode: PgoMode = 'off';
        if (kind === 'instrumented') {
            mode = 'generate';
        } else if (kind === 'optimized') {
            mode = 'use';
        }
        prepareSourcePods(mode);
        const derivedDataDirectory = join(profileDirectory, `derived-data/${kind}`);
        const builtAppPath = join(derivedDataDirectory, 'Build/Products/Release-iphoneos/Expensify.app');
        const signingSettings = codeSigningAllowed
            ? [
                  'CODE_SIGN_STYLE=Automatic',
                  'CODE_SIGN_IDENTITY=Apple Development',
                  'PROVISIONING_PROFILE=',
                  'PROVISIONING_PROFILE_SPECIFIER=',
                  ...(developmentTeam ? [`DEVELOPMENT_TEAM=${developmentTeam}`] : []),
              ]
            : ['CODE_SIGNING_ALLOWED=NO', 'CODE_SIGNING_REQUIRED=NO'];
        const xcodeArguments = [
            'xcodebuild',
            '-workspace',
            'Expensify.xcworkspace',
            '-scheme',
            'Expensify',
            '-configuration',
            'Release',
            '-destination',
            'generic/platform=iOS',
            '-derivedDataPath',
            derivedDataDirectory,
            ...(codeSigningAllowed ? ['-allowProvisioningUpdates'] : []),
            '-quiet',
            'build',
            'ARCHS=arm64',
            'ONLY_ACTIVE_ARCH=YES',
            'COMPILER_INDEX_STORE_ENABLE=NO',
            ...signingSettings,
            ...pgoBuildSettings(kind),
        ];
        run('/usr/bin/env', [...sourceBuildEnvironment(mode), ...xcodeArguments], iosDirectory);
        if (!existsSync(builtAppPath)) {
            fail(`Missing built iOS app at ${builtAppPath}.`);
        }
        mkdirSync(appDirectory, {recursive: true});
        rmSync(artifactPaths[kind], {recursive: true, force: true});
        cpSync(builtAppPath, artifactPaths[kind], {recursive: true, preserveTimestamps: true});
        console.log(`Copied release app: ${artifactPaths[kind]}`);
    }

    function install(kind: BuildKind): void {
        const appPath = artifactPaths[kind];
        if (!existsSync(appPath)) {
            fail(`Missing app at ${appPath}. Build it first.`);
        }
        if (!existsSync(join(appPath, '_CodeSignature/CodeResources'))) {
            fail(`The app at ${appPath} is unsigned. Rebuild without IOS_CODE_SIGNING_ALLOWED=NO before installing it on a device.`);
        }
        run('xcrun', ['devicectl', 'device', 'install', 'app', '--device', deviceIdentifier(), appPath]);
        console.log(`Installed app: ${appPath}`);
    }

    function tryReadDeviceFile(remotePath: string, localName: string): string | undefined {
        mkdirSync(markerDirectory, {recursive: true});
        const localPath = join(markerDirectory, localName);
        rmSync(localPath, {recursive: true, force: true});
        const copied = runAllowFailure('xcrun', [
            'devicectl',
            'device',
            'copy',
            'from',
            '--device',
            deviceIdentifier(),
            '--source',
            remotePath,
            '--destination',
            localPath,
            '--domain-type',
            'appDataContainer',
            '--domain-identifier',
            bundleIdentifier(),
            '--quiet',
        ]);
        return copied && existsSync(localPath) ? readFileSync(localPath, 'utf8').trim() : undefined;
    }

    function postNotification(name: string): void {
        run('xcrun', ['devicectl', 'device', 'notification', 'post', '--device', deviceIdentifier(), '--name', name]);
    }

    async function waitForProfileStatus(expectedStatus: string, previousStatus: string | undefined): Promise<void> {
        const deadline = Date.now() + profileOperationTimeoutSeconds * 1000;
        while (Date.now() < deadline) {
            const statusContents = tryReadDeviceFile(profileStatusPath, 'profile-status.txt');
            if (statusContents && statusContents !== previousStatus) {
                const [, status, rawResult] = statusContents.split(',');
                if (status === 'not-instrumented') {
                    fail('The installed iOS app is not instrumented. Build and install build-instrumented before recording profiles.');
                }
                if (status === expectedStatus && Number(rawResult) === 0) {
                    console.log(`iOS PGO profiles ${expectedStatus}.`);
                    return;
                }
                fail(`The iOS PGO profile operation failed: ${statusContents}`);
            }
            await sleep(250);
        }
        fail(`The iOS app did not confirm that PGO profiles were ${expectedStatus} within ${profileOperationTimeoutSeconds}s.`);
    }

    async function clearDeviceProfiles(): Promise<void> {
        console.log(`Clearing previous iOS PGO profiles from ${remotePgoDirectory}.`);
        const previousStatus = tryReadDeviceFile(profileStatusPath, 'profile-status-before-clear.txt');
        postNotification(profileClearNotification);
        await waitForProfileStatus('cleared', previousStatus);
    }

    async function dumpProfiles(): Promise<void> {
        const previousStatus = tryReadDeviceFile(profileStatusPath, 'profile-status-before-write.txt');
        postNotification(profileWriteNotification);
        await waitForProfileStatus('written', previousStatus);
    }

    function pullProfiles(): void {
        rmSync(rawProfileDirectory, {recursive: true, force: true});
        mkdirSync(dirname(rawProfileDirectory), {recursive: true});
        run('xcrun', [
            'devicectl',
            'device',
            'copy',
            'from',
            '--device',
            deviceIdentifier(),
            '--source',
            remotePgoDirectory,
            '--destination',
            rawProfileDirectory,
            '--domain-type',
            'appDataContainer',
            '--domain-identifier',
            bundleIdentifier(),
        ]);
        const profiles = findFiles(rawProfileDirectory, '.profraw');
        if (profiles.length === 0) {
            fail(`No .profraw files found in the iOS app container at ${remotePgoDirectory}. Run dump first.`);
        }
        console.log(profiles.join('\n'));
    }

    function verifyInstrumentation(): void {
        const appPath = artifactPaths.instrumented;
        const executablePath = join(appPath, 'Expensify');
        if (!existsSync(executablePath)) {
            fail(`Missing instrumented iOS executable at ${executablePath}.`);
        }
        const requiredSections = ['__llvm_prf_data', '__llvm_prf_cnts', '__llvm_prf_names'];
        const sectionHeaders = capture('xcrun', ['size', '-m', executablePath]);
        if (!requiredSections.every((section) => sectionHeaders.includes(section))) {
            fail('LLVM PGO instrumentation is missing from the iOS app executable.');
        }
        if (!capture('strings', ['-a', executablePath]).includes('ExpensifyPGO: wrote LLVM profile')) {
            fail('The iOS app executable is missing the PGO flush marker.');
        }
        console.log(`Verified LLVM PGO instrumentation: ${executablePath}`);

        const hermesExecutable = join(appPath, 'Frameworks/hermesvm.framework/hermesvm');
        if (!existsSync(hermesExecutable)) {
            fail(`Missing embedded source-built Hermes framework at ${hermesExecutable}.`);
        }
        const hermesSections = capture('xcrun', ['size', '-m', hermesExecutable]);
        if (!requiredSections.every((section) => hermesSections.includes(section))) {
            fail('LLVM PGO instrumentation is missing from the source-built iOS Hermes framework.');
        }
        const hermesSymbols = capture('xcrun', ['nm', '-gU', hermesExecutable]);
        if (!['expensify_llvm_profile_set_filename', 'expensify_llvm_profile_write_file', 'expensify_llvm_profile_reset_counters'].every((symbol) => hermesSymbols.includes(symbol))) {
            fail('The source-built iOS Hermes framework is missing the exported PGO profile runtime APIs.');
        }
        console.log(`Verified LLVM PGO instrumentation: ${hermesExecutable}`);
    }

    return {
        name: 'ios',
        profileDirectory,
        rawProfileDirectory,
        mergedProfilePath,
        benchmarkDirectory,
        benchmarkPaths,
        artifactPaths,
        profileFormat,
        appID: bundleIdentifier,
        build,
        install,
        verifyInstrumentation,
        clearDeviceProfiles,
        dumpProfiles,
        pullProfiles,
        llvmTool,
    };
}

export default createIOSPgoAdapter;
