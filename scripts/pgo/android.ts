// cspell:ignore sdcard profdata Ppatched Ppgo profraw Readelf readelf zipinfo libreactnative libhermesvm libjsi cnts

/** Android-specific release builds, native profile persistence, retrieval, and instrumentation checks. */

import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {homedir, platform, tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';

import type {BenchmarkKind, BuildArtifactPaths, BuildKind, PlatformAdapter} from './shared';

import {capture, captureBinary, fail, findFiles, rootDirectory, run, sleep} from '../lib/scriptUtils';
import {BENCHMARK_SPANS_ENVIRONMENT} from './shared';

const ANDROID_JAVA_NAMESPACE = 'org.me.mobiexpensifyg';
const PROFILE_BROADCAST_ACTION = 'com.expensify.chat.action.WRITE_PGO_PROFILES';

function createAndroidPgoAdapter(configuredAppID?: string, configuredDeviceIdentifier?: string): PlatformAdapter {
    const ndkVersion = '27.1.12297006';
    const profileDirectory = join(rootDirectory, '.pgo/android/arm64-v8a');
    const rawProfileDirectory = join(profileDirectory, 'raw');
    const apkDirectory = join(profileDirectory, 'apk');
    const benchmarkDirectory = join(rootDirectory, '.pgo/android/benchmarks');
    const androidDirectory = join(rootDirectory, 'Mobile-Expensify/Android');
    const buildGradlePath = join(androidDirectory, 'build.gradle');
    const gradleReleaseApkPath = join(androidDirectory, 'build/outputs/apk/release/Expensify-release.apk');
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

    let cachedAppID: string | undefined;

    function appID(): string {
        cachedAppID ??= androidApplicationID(readFileSync(buildGradlePath, 'utf8'), configuredAppID);
        return cachedAppID;
    }

    function deviceProfileDirectory(): string {
        return `/sdcard/Android/data/${appID()}/cache`;
    }

    function adb(args: string[]): void {
        run('adb', configuredDeviceIdentifier ? ['-s', configuredDeviceIdentifier, ...args] : args);
    }

    function adbCapture(args: string[]): string {
        return capture('adb', configuredDeviceIdentifier ? ['-s', configuredDeviceIdentifier, ...args] : args);
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

        const pgoModes: Record<BuildKind, string> = {release: 'off', instrumented: 'generate', optimized: 'use'};
        const gradleArguments = [':assembleRelease', '-PpatchedArtifacts.forceBuildFromSource=true', '-PreactNativeArchitectures=arm64-v8a', `-PpgoMode=${pgoModes[kind]}`];
        if (kind === 'optimized') {
            gradleArguments.push(`-PpgoProfile=${join(profileDirectory, 'newdot.profdata')}`);
        }

        run('/usr/bin/env', [BENCHMARK_SPANS_ENVIRONMENT, './gradlew', ...gradleArguments], androidDirectory);
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
        adb(['shell', 'am', 'broadcast', '-a', PROFILE_BROADCAST_ACTION, '-n', androidProfileReceiverComponent(appID())]);
        await waitForProfileDump();
    }

    function pullProfiles(): void {
        rmSync(rawProfileDirectory, {recursive: true, force: true});
        mkdirSync(rawProfileDirectory, {recursive: true});
        adb(['pull', `${deviceProfileDirectory()}/.`, rawProfileDirectory]);
        const profiles = findFiles(rawProfileDirectory, '.profraw');
        if (profiles.length === 0) {
            fail(`No .profraw files found in ${deviceProfileDirectory()}. Run dump first.`);
        }
        console.log(profiles.join('\n'));
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
        appID,
        build,
        install,
        verifyInstrumentation,
        clearDeviceProfiles: async () => {
            console.log(`Clearing previous device PGO profiles from ${deviceProfileDirectory()}.`);
            adb(['shell', `rm -f '${deviceProfileDirectory()}'/newdot-*.profraw`]);
        },
        dumpProfiles,
        pullProfiles,
        llvmTool,
    };
}

function androidApplicationID(buildGradle: string, configuredAppID?: string): string {
    if (configuredAppID) {
        return configuredAppID;
    }
    const applicationID = /defaultConfig\s*\{[\s\S]*?applicationId\s+["']([^"']+)["']/.exec(buildGradle)?.[1];
    if (!applicationID) {
        fail('Unable to read the release application ID from Mobile-Expensify/Android/build.gradle. Pass it with --app-id.');
    }
    return applicationID;
}

function androidProfileReceiverComponent(appID: string): string {
    return `${appID}/${ANDROID_JAVA_NAMESPACE}.PgoProfileReceiver`;
}

export default createAndroidPgoAdapter;
export {PROFILE_BROADCAST_ACTION, androidApplicationID, androidProfileReceiverComponent};
