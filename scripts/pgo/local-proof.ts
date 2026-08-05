#!/usr/bin/env -S node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';
import {spawnSync} from 'node:child_process';
import {copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {homedir, platform, tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';

const DEFAULT_STARTUP_RUNS = 10;
const DEFAULT_APP_READY_TIMEOUT_SECONDS = 30;
const STARTUP_RELAUNCH_DELAY_MS = 500;

type BuildKind = 'release' | 'instrumented' | 'optimized';
type BenchmarkKind = Extract<BuildKind, 'release' | 'optimized'>;
type PgoMode = 'off' | 'generate' | 'use';
type PlatformName = TupleToUnion<typeof PLATFORM_NAMES>;
type WorkflowCommand = TupleToUnion<typeof WORKFLOW_COMMANDS>;

type BuildArtifactPaths = Record<BuildKind, string>;

type BenchmarkStats = {
    count: number;
    average: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
};

type PlatformAdapter = {
    readonly name: string;
    readonly profileDirectory: string;
    readonly rawProfileDirectory: string;
    readonly mergedProfilePath: string;
    readonly benchmarkDirectory: string;
    readonly benchmarkPaths: Record<BenchmarkKind, string>;
    readonly artifactPaths: BuildArtifactPaths;
    readonly profileFormat?: string;
    build: (kind: BuildKind) => void;
    install: (kind: BuildKind) => void;
    verifyInstrumentation: () => void;
    prepareProfileCollection?: (timeoutSeconds: number) => Promise<void>;
    clearDeviceProfiles: () => Promise<void>;
    dumpProfiles: () => Promise<void>;
    pullProfiles: () => void;
    forceStop: () => void;
    clearSystemLogs: () => void;
    launch: () => void;
    waitForAppReady: (timeoutSeconds: number) => Promise<number | null>;
    llvmTool: (name: string) => string;
};

const PLATFORM_NAMES = ['android', 'ios'] as const;
const WORKFLOW_COMMANDS = [
    'build-release',
    'build-instrumented',
    'build-optimized',
    'verify-instrumented',
    'install-release',
    'install-instrumented',
    'install-optimized',
    'record-startups',
    'benchmark-release',
    'benchmark-optimized',
    'benchmark',
    'compare-benchmarks',
    'dump',
    'pull',
    'merge',
] as const;

const scriptPath = process.argv.at(1);
if (!scriptPath) {
    throw new Error('Unable to resolve the PGO script path.');
}
const scriptDirectory = dirname(resolve(scriptPath));
const rootDirectory = resolve(scriptDirectory, '../..');

function fail(message: string): never {
    throw new Error(message);
}

function run(command: string, args: string[], cwd = rootDirectory): void {
    const result = spawnSync(command, args, {cwd, stdio: 'inherit'});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
}

function capture(command: string, args: string[], cwd = rootDirectory): string {
    const result = spawnSync(command, args, {cwd, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        const stderr = result.stderr.trim();
        fail(stderr.length > 0 ? stderr : `${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function captureBinary(command: string, args: string[], cwd = rootDirectory): Buffer {
    const result = spawnSync(command, args, {cwd, encoding: 'buffer', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function runAllowFailure(command: string, args: string[], cwd = rootDirectory): boolean {
    const result = spawnSync(command, args, {cwd, stdio: 'ignore'});
    return !result.error && result.status === 0;
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });
}

function findFiles(directory: string, extension: string): string[] {
    if (!existsSync(directory)) {
        return [];
    }

    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return findFiles(path, extension);
        }
        return entry.isFile() && entry.name.endsWith(extension) ? [path] : [];
    });
}

function requirePositiveInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value <= 0) {
        fail(`${label} must be a positive integer, received: ${value}`);
    }
    return value;
}

function parsePositiveInteger(rawValue: string, label: string): number {
    return requirePositiveInteger(Number(rawValue), label);
}

function parseChoice<T extends string>(rawValue: string, choices: readonly T[], label: string): T {
    const choice = choices.find((candidate) => candidate === rawValue);
    if (!choice) {
        fail(`${label} must be one of: ${choices.join(', ')}. Received: ${rawValue}`);
    }
    return choice;
}

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function valueAt<T>(values: T[], index: number): T {
    const value = values.at(index);
    if (value === undefined) {
        fail(`Expected a value at index ${index}.`);
    }
    return value;
}

function createAndroidAdapter(): PlatformAdapter {
    const ndkVersion = '27.1.12297006';
    const packageName = 'org.me.mobiexpensifyg';
    const profileDirectory = join(rootDirectory, '.pgo/android/arm64-v8a');
    const rawProfileDirectory = join(profileDirectory, 'raw');
    const apkDirectory = join(profileDirectory, 'apk');
    const benchmarkDirectory = join(rootDirectory, '.pgo/android/benchmarks');
    const androidDirectory = join(rootDirectory, 'Mobile-Expensify/Android');
    const gradleReleaseApkPath = join(androidDirectory, 'build/outputs/apk/release/Expensify-release.apk');
    const deviceProfileDirectory = `/sdcard/Android/data/${packageName}/cache`;
    const startActivity = `${packageName}/.ExpensifyActivityBase`;
    const appReadyLogTag = 'NewDotStartup';
    const appReadyLogMessage = 'APP_READY';
    const profileDumpTimeoutSeconds = 5;

    const artifactPaths: BuildArtifactPaths = {
        release: join(apkDirectory, 'Expensify-release.apk'),
        instrumented: join(apkDirectory, 'Expensify-release-instrumented.apk'),
        optimized: join(apkDirectory, 'Expensify-release-optimized.apk'),
    };

    const benchmarkPaths: Record<BenchmarkKind, string> = {
        release: join(benchmarkDirectory, 'release.csv'),
        optimized: join(benchmarkDirectory, 'pgo-optimized.csv'),
    };

    function adb(args: string[]): void {
        run('adb', args);
    }

    function adbCapture(args: string[]): string {
        return capture('adb', args);
    }

    function llvmTool(name: string): string {
        const androidNdkHome: unknown = process.env.ANDROID_NDK_HOME;
        const androidNdkRoot: unknown = process.env.ANDROID_NDK_ROOT;
        const configuredNdkRoot = [androidNdkHome, androidNdkRoot].find((value): value is string => typeof value === 'string');
        const ndkRoot = configuredNdkRoot ?? join(homedir(), `Library/Android/sdk/ndk/${ndkVersion}`);
        const hostTag = platform() === 'linux' ? 'linux-x86_64' : 'darwin-x86_64';
        const toolPath = join(ndkRoot, `toolchains/llvm/prebuilt/${hostTag}/bin/${name}`);
        if (!existsSync(toolPath)) {
            fail(`Missing ${name} at ${toolPath}. Set ANDROID_NDK_HOME (or ANDROID_NDK_ROOT) to the NDK used by the build.`);
        }
        return toolPath;
    }

    function archiveReleaseApk(destination: string): void {
        if (!existsSync(gradleReleaseApkPath)) {
            fail(`Missing built release APK at ${gradleReleaseApkPath}.`);
        }

        mkdirSync(apkDirectory, {recursive: true});
        copyFileSync(gradleReleaseApkPath, destination);
        console.log(`Copied release APK: ${destination}`);
    }

    function build(kind: BuildKind): void {
        if (kind === 'optimized' && !existsSync(join(profileDirectory, 'newdot.profdata'))) {
            fail(`Missing ${join(profileDirectory, 'newdot.profdata')}. Run merge first.`);
        }

        const pgoModes: Record<BuildKind, string> = {
            release: 'off',
            instrumented: 'generate',
            optimized: 'use',
        };
        const pgoMode = pgoModes[kind];
        const gradleArguments = [':assembleRelease', '-PpatchedArtifacts.forceBuildFromSource=true', '-PreactNativeArchitectures=arm64-v8a', `-PpgoMode=${pgoMode}`];
        if (kind === 'optimized') {
            gradleArguments.push(`-PpgoProfile=${join(profileDirectory, 'newdot.profdata')}`);
        }

        run('./gradlew', gradleArguments, androidDirectory);
        archiveReleaseApk(artifactPaths[kind]);
    }

    function install(kind: BuildKind): void {
        const apkPath = artifactPaths[kind];
        if (!existsSync(apkPath)) {
            fail(`Missing APK at ${apkPath}. Build the APK first.`);
        }

        adb(['install', '-r', apkPath]);
        console.log(`Installed APK: ${apkPath}`);
    }

    async function waitForProfileDump(): Promise<void> {
        const deadline = Date.now() + profileDumpTimeoutSeconds * 1000;
        while (Date.now() < deadline) {
            const profileLogs = adbCapture(['logcat', '-d', '-s', 'PgoProfileReceiver:I', '*:S']);
            const profileCount = /Wrote ([1-9][0-9]*) LLVM PGO profile/.exec(profileLogs)?.[1];
            if (profileCount) {
                console.log(`Wrote ${profileCount} LLVM PGO profile(s).`);
                return;
            }
            if (profileLogs.includes('Ignoring PGO profile request in a non-instrumented build.')) {
                fail('The installed APK is not instrumented. Build and install build-instrumented before recording profiles; build-optimized cannot generate .profraw files.');
            }
            if (profileLogs.includes('Wrote 0 LLVM PGO profile(s).')) {
                fail('The receiver found no instrumented native libraries in the installed APK. Rebuild and install build-instrumented before recording profiles.');
            }
            await sleep(100);
        }

        const profileLogs = adbCapture(['logcat', '-d', '-s', 'PgoProfileReceiver:I', '*:S']);
        fail(`The PGO receiver did not confirm a profile write within ${profileDumpTimeoutSeconds}s.\n${profileLogs}`);
    }

    async function dumpProfiles(): Promise<void> {
        adb(['logcat', '-c']);
        adb(['shell', 'am', 'broadcast', '-a', `${packageName}.action.WRITE_PGO_PROFILES`, '-n', `${packageName}/.PgoProfileReceiver`]);
        await waitForProfileDump();
    }

    function pullProfiles(): void {
        rmSync(rawProfileDirectory, {recursive: true, force: true});
        mkdirSync(rawProfileDirectory, {recursive: true});
        adb(['pull', `${deviceProfileDirectory}/.`, rawProfileDirectory]);

        const profiles = findFiles(rawProfileDirectory, '.profraw');
        if (profiles.length === 0) {
            fail(`No .profraw files found in ${deviceProfileDirectory}. Run dump first.`);
        }
        console.log(profiles.join('\n'));
    }

    async function waitForAppReady(timeoutSeconds: number): Promise<number | null> {
        const deadline = Date.now() + timeoutSeconds * 1000;
        console.log(`Waiting up to ${timeoutSeconds}s for ${appReadyLogTag}: ${appReadyLogMessage}.`);
        while (Date.now() < deadline) {
            const startupLogs = adbCapture(['logcat', '-d', '-s', `${appReadyLogTag}:I`, '*:S']);
            if (startupLogs.includes(appReadyLogMessage)) {
                const duration = /APP_READY durationMs=([0-9]+)/.exec(startupLogs)?.[1];
                if (duration) {
                    console.log(`NewDot reported APP_READY after ${duration}ms.`);
                    return Number(duration);
                }
                console.log('NewDot reported APP_READY without a numeric duration marker.');
                return null;
            }
            await sleep(250);
        }

        const startupLogs = adbCapture(['logcat', '-d', '-s', `${appReadyLogTag}:I`, '*:S']);
        fail(`NewDot did not report APP_READY within ${timeoutSeconds}s.\n${startupLogs}`);
    }

    function verifyInstrumentation(): void {
        const apkPath = artifactPaths.instrumented;
        if (!existsSync(apkPath)) {
            fail(`Missing APK at ${apkPath}. Build the instrumented release first.`);
        }

        const extractedDirectory = mkdtempSync(join(tmpdir(), 'expensify-pgo-apk-'));
        const llvmReadelf = llvmTool('llvm-readelf');
        const llvmNm = llvmTool('llvm-nm');
        const apkEntries = new Set(capture('zipinfo', ['-1', apkPath]).split('\n'));
        const libraries = ['libreactnative.so', 'libhermesvm.so', 'libjsi.so', 'libExpensifyNitroUtils.so'];

        try {
            for (const library of libraries) {
                const apkEntry = `lib/arm64-v8a/${library}`;
                if (!apkEntries.has(apkEntry)) {
                    fail(`Missing expected arm64 library in APK: ${apkEntry}`);
                }

                const extractedLibrary = join(extractedDirectory, library);
                writeFileSync(extractedLibrary, captureBinary('unzip', ['-p', apkPath, apkEntry]));
                const sectionHeaders = capture(llvmReadelf, ['-SW', extractedLibrary]);
                if (!['__llvm_prf_data', '__llvm_prf_cnts', '__llvm_prf_names'].every((section) => sectionHeaders.includes(section))) {
                    fail(`LLVM PGO instrumentation is missing from ${apkEntry}.`);
                }

                const dynamicSymbols = capture(llvmNm, ['-D', '--defined-only', extractedLibrary]);
                if (!['expensify_llvm_profile_set_filename', 'expensify_llvm_profile_write_file'].every((symbol) => dynamicSymbols.includes(symbol))) {
                    fail(`LLVM PGO profile-writing APIs are not exported from ${apkEntry}.`);
                }
                if (library === 'libExpensifyNitroUtils.so' && !dynamicSymbols.includes('Java_org_me_mobiexpensifyg_PgoProfileWriter_writeProfiles')) {
                    fail(`The PGO JNI writer is missing from ${apkEntry}. Rebuild the native module before installing.`);
                }
                console.log(`Verified LLVM PGO instrumentation: ${apkEntry}`);
            }
        } finally {
            rmSync(extractedDirectory, {recursive: true, force: true});
        }
    }

    return {
        name: 'android',
        profileDirectory,
        rawProfileDirectory,
        mergedProfilePath: join(profileDirectory, 'newdot.profdata'),
        benchmarkDirectory,
        benchmarkPaths,
        artifactPaths,
        build,
        install,
        verifyInstrumentation,
        clearDeviceProfiles: async () => {
            console.log(`Clearing previous device PGO profiles from ${deviceProfileDirectory}.`);
            adb(['shell', `rm -f '${deviceProfileDirectory}'/newdot-*.profraw`]);
        },
        dumpProfiles,
        pullProfiles,
        forceStop: () => adb(['shell', 'am', 'force-stop', packageName]),
        clearSystemLogs: () => adb(['logcat', '-c']),
        launch: () => adb(['shell', 'am', 'start', '-W', '-n', startActivity]),
        waitForAppReady,
        llvmTool,
    };
}

function createIosAdapter(): PlatformAdapter {
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
    const appReadyMarkerPath = `${remotePgoDirectory}/app-ready.txt`;
    const profileWriteNotification = 'com.expensify.pgo.write-profiles';
    const profileClearNotification = 'com.expensify.pgo.clear-profiles';
    const profileOperationTimeoutSeconds = 10;
    const developmentTeam = environmentString('IOS_DEVELOPMENT_TEAM');
    const codeSigningAllowed = !['0', 'false', 'no'].includes((environmentString('IOS_CODE_SIGNING_ALLOWED') ?? 'yes').toLowerCase());
    const configuredBundleIdentifier = environmentString('IOS_BUNDLE_IDENTIFIER');
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
    let previousAppReadyMarker: string | undefined;

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

        const configuredIdentifier = environmentString('IOS_DEVICE_ID');
        if (configuredIdentifier) {
            cachedDeviceIdentifier = configuredIdentifier;
            return configuredIdentifier;
        }

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
                return typeof hardwareProperties.udid === 'string' ? [{name: String(deviceProperties.name), udid: hardwareProperties.udid}] : [];
            });

            if (physicalDevices.length === 0) {
                fail('No booted physical iOS device is connected. Connect and unlock a device, or set IOS_DEVICE_ID.');
            }
            if (physicalDevices.length > 1) {
                fail(`Multiple physical iOS devices are connected (${physicalDevices.map(({name}) => name).join(', ')}). Set IOS_DEVICE_ID to the desired UDID.`);
            }

            const selectedDevice = valueAt(physicalDevices, 0);
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
        const environment = ['RCT_USE_RN_DEP=0', 'RCT_USE_PREBUILT_RNCORE=0', 'RCT_BUILD_HERMES_FROM_SOURCE=true', `EXPENSIFY_PGO_MODE=${mode}`];
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

        const hermesBuildDirectory = join(iosDirectory, 'Pods/hermes-engine/build');
        rmSync(hermesBuildDirectory, {recursive: true, force: true});
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
            const clangProfileFlags = `-fprofile-instr-use=${mergedProfilePath} -Wno-profile-instr-unprofiled -Wno-profile-instr-out-of-date`;
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

    function forceStop(): void {
        runAllowFailure('xcrun', ['devicectl', 'device', 'process', 'terminate', '--device', deviceIdentifier(), bundleIdentifier()]);
    }

    function launch(): void {
        previousAppReadyMarker = tryReadDeviceFile(appReadyMarkerPath, 'app-ready-before-launch.txt');
        run('xcrun', ['devicectl', 'device', 'process', 'launch', '--device', deviceIdentifier(), '--terminate-existing', bundleIdentifier()]);
    }

    async function waitForAppReady(timeoutSeconds: number): Promise<number | null> {
        const deadline = Date.now() + timeoutSeconds * 1000;
        console.log(`Waiting up to ${timeoutSeconds}s for the iOS NewDot APP_READY marker.`);
        while (Date.now() < deadline) {
            const marker = tryReadDeviceFile(appReadyMarkerPath, 'app-ready.txt');
            if (marker && marker !== previousAppReadyMarker) {
                const [, rawDuration] = marker.split(',');
                const duration = Number(rawDuration);
                if (Number.isFinite(duration) && duration >= 0) {
                    console.log(`NewDot reported APP_READY after ${duration}ms.`);
                    return duration;
                }
                return null;
            }
            await sleep(250);
        }
        fail(`NewDot did not report APP_READY on iOS within ${timeoutSeconds}s.`);
    }

    function verifyInstrumentation(): void {
        const appPath = artifactPaths.instrumented;
        const executablePath = join(appPath, 'Expensify');
        if (!existsSync(executablePath)) {
            fail(`Missing instrumented iOS executable at ${executablePath}.`);
        }

        const sectionHeaders = capture('xcrun', ['size', '-m', executablePath]);
        if (!['__llvm_prf_data', '__llvm_prf_cnts', '__llvm_prf_names'].every((section) => sectionHeaders.includes(section))) {
            fail('LLVM PGO instrumentation is missing from the iOS app executable.');
        }
        const executableStrings = capture('strings', ['-a', executablePath]);
        if (!['ExpensifyPGO: wrote LLVM profile', 'NewDotStartup: APP_READY'].every((marker) => executableStrings.includes(marker))) {
            fail('The iOS app executable is missing the PGO flush or APP_READY marker.');
        }
        console.log(`Verified LLVM PGO instrumentation: ${executablePath}`);

        const hermesExecutable = join(appPath, 'Frameworks/hermesvm.framework/hermesvm');
        if (!existsSync(hermesExecutable)) {
            fail(`Missing embedded source-built Hermes framework at ${hermesExecutable}.`);
        }
        const hermesSections = capture('xcrun', ['size', '-m', hermesExecutable]);
        if (!['__llvm_prf_data', '__llvm_prf_cnts', '__llvm_prf_names'].every((section) => hermesSections.includes(section))) {
            fail('LLVM PGO instrumentation is missing from the source-built iOS Hermes framework.');
        }
        console.log(`Verified LLVM PGO instrumentation: ${hermesExecutable}`);
    }

    async function prepareProfileCollection(timeoutSeconds: number): Promise<void> {
        console.log('Launching the instrumented iOS app once so its PGO notification handlers are active.');
        forceStop();
        await sleep(STARTUP_RELAUNCH_DELAY_MS);
        launch();
        await waitForAppReady(timeoutSeconds);
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
        build,
        install,
        verifyInstrumentation,
        prepareProfileCollection,
        clearDeviceProfiles,
        dumpProfiles,
        pullProfiles,
        forceStop,
        clearSystemLogs: () => undefined,
        launch,
        waitForAppReady,
        llvmTool,
    };
}

function mergeProfiles(adapter: PlatformAdapter): void {
    mkdirSync(adapter.profileDirectory, {recursive: true});
    const profiles = findFiles(adapter.rawProfileDirectory, '.profraw');
    if (profiles.length === 0) {
        fail('No .profraw files found. Run dump and pull first.');
    }

    const llvmProfdata = adapter.llvmTool('llvm-profdata');
    run(llvmProfdata, ['merge', `--output=${adapter.mergedProfilePath}`, ...profiles]);
    if (adapter.profileFormat) {
        writeFileSync(`${adapter.mergedProfilePath}.format`, `${adapter.profileFormat}\n`);
    }
    const profileReport = capture(llvmProfdata, ['show', '--all-functions', adapter.mergedProfilePath]);
    writeFileSync(`${adapter.mergedProfilePath}.txt`, profileReport);
    console.log(`Merged PGO profile: ${adapter.mergedProfilePath}`);
}

async function measureStartup(adapter: PlatformAdapter, readyTimeoutSeconds: number): Promise<number> {
    adapter.forceStop();
    await sleep(STARTUP_RELAUNCH_DELAY_MS);
    adapter.clearSystemLogs();
    adapter.launch();
    const duration = await adapter.waitForAppReady(readyTimeoutSeconds);
    if (duration === null) {
        fail(`APP_READY did not contain a numeric durationMs marker. Rebuild the ${adapter.name} app with the startup metric changes.`);
    }
    return duration;
}

async function recordStartups(adapter: PlatformAdapter, runs: number, readyTimeoutSeconds: number): Promise<void> {
    if (adapter.prepareProfileCollection) {
        await adapter.prepareProfileCollection(readyTimeoutSeconds);
    }
    await adapter.clearDeviceProfiles();
    for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
        console.log(`Recording cold-process startup ${runNumber}/${runs}.`);
        await measureStartup(adapter, readyTimeoutSeconds);
        await adapter.dumpProfiles();
    }

    adapter.pullProfiles();
    mergeProfiles(adapter);
}

async function benchmarkStartups(adapter: PlatformAdapter, kind: BenchmarkKind, runs: number, readyTimeoutSeconds: number): Promise<void> {
    const label = kind === 'release' ? 'release' : 'PGO optimized';
    const benchmarkPath = adapter.benchmarkPaths[kind];
    mkdirSync(adapter.benchmarkDirectory, {recursive: true});

    console.log(`Running one unmeasured warm-up startup for ${label}.`);
    await measureStartup(adapter, readyTimeoutSeconds);

    const samples: number[] = [];
    for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
        console.log(`Benchmarking ${label} cold-process startup ${runNumber}/${runs}.`);
        samples.push(await measureStartup(adapter, readyTimeoutSeconds));
    }

    const csv = ['run,duration_ms', ...samples.map((duration, index) => `${index + 1},${duration}`), ''].join('\n');
    writeFileSync(benchmarkPath, csv);
    console.log(`Recorded ${runs} ${label} startup samples: ${benchmarkPath}`);
}

function percentile(sortedValues: number[], fraction: number): number {
    const position = (sortedValues.length - 1) * fraction;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    const remainder = position - lowerIndex;
    const lowerValue = valueAt(sortedValues, lowerIndex);
    return lowerValue + remainder * (valueAt(sortedValues, upperIndex) - lowerValue);
}

function benchmarkStats(path: string): BenchmarkStats {
    const values = readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .slice(1)
        .map((line) => Number(line.split(',').at(1)))
        .filter(Number.isFinite)
        .sort((left, right) => left - right);
    if (values.length === 0) {
        fail(`No benchmark samples found in ${path}.`);
    }

    return {
        count: values.length,
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
        p50: percentile(values, 0.5),
        p75: percentile(values, 0.75),
        p90: percentile(values, 0.9),
        p95: percentile(values, 0.95),
        p99: percentile(values, 0.99),
        min: valueAt(values, 0),
        max: valueAt(values, -1),
    };
}

function percentageImprovement(releaseValue: number, optimizedValue: number): number {
    return ((releaseValue - optimizedValue) / releaseValue) * 100;
}

function compareBenchmarks(adapter: PlatformAdapter): void {
    const releasePath = adapter.benchmarkPaths.release;
    const optimizedPath = adapter.benchmarkPaths.optimized;
    if (!existsSync(releasePath) || !existsSync(optimizedPath)) {
        fail('Missing benchmark data. Run benchmark-release and benchmark-optimized first.');
    }

    const release = benchmarkStats(releasePath);
    const optimized = benchmarkStats(optimizedPath);
    const numericColumns: Array<keyof Omit<BenchmarkStats, 'count'>> = ['average', 'p50', 'p75', 'p90', 'p95', 'p99', 'min', 'max'];
    const improvements = numericColumns.map((key) => percentageImprovement(release[key], optimized[key]));

    const formatLabel = (value: string) => value.padEnd(18);
    const formatCount = (value: string) => value.padStart(5);
    const formatMetric = (value: string) => value.padStart(10);
    const row = (label: string, count: string, values: string[]) => [formatLabel(label), formatCount(count), ...values.map(formatMetric)].join(' ');
    const statsRow = (label: string, stats: BenchmarkStats) =>
        row(
            label,
            String(stats.count),
            [stats.average, stats.p50, stats.p75, stats.p90, stats.p95, stats.p99, stats.min, stats.max].map((value) => value.toFixed(2)),
        );

    console.log('Positive percentages are faster; negative percentages are regressions.');
    console.log(row('Build', 'Runs', ['Average', 'P50', 'P75', 'P90', 'P95', 'P99', 'Min', 'Max']));
    console.log(statsRow('Release', release));
    console.log(statsRow('PGO optimized', optimized));
    console.log(
        row(
            'PGO improvement',
            '-',
            improvements.map((improvement) => `${improvement.toFixed(2)}%`),
        ),
    );
}

function getAdapter(platformName: PlatformName): PlatformAdapter {
    if (platformName === 'android') {
        return createAndroidAdapter();
    }
    return createIosAdapter();
}

async function runWorkflow(platformName: PlatformName, workflow: WorkflowCommand, runs: number, timeoutSeconds: number): Promise<void> {
    const adapter = getAdapter(platformName);

    switch (workflow) {
        case 'build-release':
            adapter.build('release');
            return;
        case 'build-instrumented':
            adapter.build('instrumented');
            return;
        case 'build-optimized':
            adapter.build('optimized');
            return;
        case 'verify-instrumented':
            adapter.verifyInstrumentation();
            return;
        case 'install-release':
            adapter.install('release');
            return;
        case 'install-instrumented':
            adapter.install('instrumented');
            return;
        case 'install-optimized':
            adapter.install('optimized');
            return;
        case 'record-startups':
            await recordStartups(adapter, runs, timeoutSeconds);
            return;
        case 'benchmark-release':
            adapter.install('release');
            await benchmarkStartups(adapter, 'release', runs, timeoutSeconds);
            return;
        case 'benchmark-optimized':
            adapter.install('optimized');
            await benchmarkStartups(adapter, 'optimized', runs, timeoutSeconds);
            return;
        case 'benchmark':
            adapter.install('release');
            await benchmarkStartups(adapter, 'release', runs, timeoutSeconds);
            adapter.install('optimized');
            await benchmarkStartups(adapter, 'optimized', runs, timeoutSeconds);
            compareBenchmarks(adapter);
            return;
        case 'compare-benchmarks':
            compareBenchmarks(adapter);
            return;
        case 'dump':
            await adapter.dumpProfiles();
            return;
        case 'pull':
            adapter.pullProfiles();
            return;
        case 'merge':
            mergeProfiles(adapter);
            break;
        default:
            fail('Unsupported workflow.');
    }
}

async function main(): Promise<void> {
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to target (${PLATFORM_NAMES.join(', ')})`,
                parse: (value): PlatformName => parseChoice(value, PLATFORM_NAMES, 'Platform'),
            },
            {
                name: 'workflow',
                description: `PGO workflow to run (${WORKFLOW_COMMANDS.join(', ')})`,
                parse: (value): WorkflowCommand => parseChoice(value, WORKFLOW_COMMANDS, 'Workflow'),
            },
            {
                name: 'runs',
                description: 'Number of measured startup runs',
                default: DEFAULT_STARTUP_RUNS,
                parse: (value) => parsePositiveInteger(value, 'Startup run count'),
            },
            {
                name: 'timeout',
                description: 'Seconds to wait for the app-ready marker',
                default: DEFAULT_APP_READY_TIMEOUT_SECONDS,
                parse: (value) => parsePositiveInteger(value, 'App-ready timeout'),
            },
        ],
    });

    const {platform: platformName, workflow, runs, timeout} = cli.positionalArgs;
    await runWorkflow(
        parseChoice(String(platformName), PLATFORM_NAMES, 'Platform'),
        parseChoice(String(workflow), WORKFLOW_COMMANDS, 'Workflow'),
        requirePositiveInteger(Number(runs), 'Startup run count'),
        requirePositiveInteger(Number(timeout), 'App-ready timeout'),
    );
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
