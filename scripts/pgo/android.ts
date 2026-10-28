// cspell:ignore Dorg jvmargs Metaspace sdcard profdata Ppatched Ppgo profraw Readelf readelf zipinfo libreactnative libhermesvm libjsi cnts

/** Android-specific release builds, native profile persistence, retrieval, and instrumentation checks. */

import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {homedir, platform, tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';

import type {BenchmarkKind, BuildArtifactPaths, BuildKind, PlatformAdapter} from './shared';

import {capture, captureBinary, fail, findFiles, rootDirectory, run, runAllowFailure, sleep} from '../lib/scriptUtils';
import {androidBuildEnvironment} from './proof';
import {BENCHMARK_SPANS_ENVIRONMENT, emulatorEntryFile} from './shared';

const ANDROID_JAVA_NAMESPACE = 'org.me.mobiexpensifyg';
const PROFILE_BROADCAST_ACTION = 'com.expensify.chat.action.WRITE_PGO_PROFILES';
const INSTRUMENTED_LIBRARIES = ['libreactnative.so', 'libhermesvm.so', 'libjsi.so', 'libExpensifyNitroUtils.so'];
// FullStory's APK transform writes the final APK listing. Without it, AGP's IDE listing redirect fails on a clean build.
const FULLSTORY_EXCLUSIONS = ['-x', 'fullstoryRelease', '-x', 'createReleaseApkListingFileRedirect'];

function createAndroidPgoAdapter(configuredAppID?: string, configuredDeviceIdentifier?: string): PlatformAdapter {
    const architecture = process.env.PGO_ANDROID_ARCH ?? 'arm64-v8a';
    if (architecture !== 'arm64-v8a' && architecture !== 'x86_64') {
        fail('PGO_ANDROID_ARCH must be arm64-v8a or x86_64.');
    }
    const emulatorVerification = process.env.PGO_CI_EMULATOR === 'true';
    const releasePipeline = androidReleasePipeline(process.env.PGO_ANDROID_RELEASE_PIPELINE, process.env.PGO_ANDROID_SHRINK);
    const profileDirectory = join(rootDirectory, '.pgo/android', architecture);
    const rawProfileDirectory = join(profileDirectory, 'raw');
    const apkDirectory = join(profileDirectory, releasePipeline.artifactDirectory);
    const benchmarkDirectory = join(rootDirectory, '.pgo/android/benchmarks');
    const androidDirectory = join(rootDirectory, 'Mobile-Expensify/Android');
    const buildGradlePath = join(androidDirectory, 'build.gradle');
    const gradleReleaseApkPath = join(androidDirectory, `build/intermediates/apk/release/${releasePipeline.apkTask}/Expensify-release.apk`);
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
        if (configuredAppID) {
            return configuredAppID;
        }
        cachedAppID ??= androidApplicationID(readFileSync(buildGradlePath, 'utf8'));
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
        const toolPath = androidLlvmToolPath(name);
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

    function build(kind: BuildKind, profileOverride?: string): void {
        const buildEnvironment = androidBuildEnvironment();
        const profilePath = profileOverride ?? join(profileDirectory, 'newdot.profdata');
        if (kind === 'optimized' && !existsSync(profilePath)) {
            fail(`Missing ${profilePath}. Run merge first or pass --profile.`);
        }

        const pgoModes: Record<BuildKind, string> = {release: 'off', instrumented: 'generate', optimized: 'use'};
        const gradleArguments = [
            releasePipeline.task,
            '-PpatchedArtifacts.forceBuildFromSource=true',
            `-PreactNativeArchitectures=${architecture}`,
            `-PpgoMode=${pgoModes[kind]}`,
            ...releasePipeline.arguments,
            ...(emulatorVerification
                ? [
                      '--init-script',
                      join(rootDirectory, 'scripts/pgo/androidEmulator.init.gradle'),
                      `-PpgoEntryFile=${emulatorEntryFile()}`,
                      '--max-workers=2',
                      '-Dorg.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1024m',
                  ]
                : []),
        ];
        if (releasePipeline.enabled) {
            console.log(
                'Android release pipeline rehearsal enables shrinking and FullStory processing, including external asset uploads. The existing local app ID and signing configuration still apply.',
            );
        } else if (releasePipeline.shrinking) {
            console.log('Android shrinking rehearsal enables release ProGuard rules and disables FullStory tasks. The existing local app ID and signing configuration still apply.');
        }
        if (kind === 'optimized') {
            gradleArguments.push(`-PpgoProfile=${profilePath}`);
        }

        run(
            '/usr/bin/env',
            [
                BENCHMARK_SPANS_ENVIRONMENT,
                'SENTRY_DISABLE_AUTO_UPLOAD=true',
                'IS_HYBRID_APP=true',
                'BUNDLER=metro',
                `PATH=${join(rootDirectory, 'node_modules/.bin')}:${process.env.PATH ?? ''}`,
                'node',
                join(rootDirectory, 'node_modules/rock/dist/src/bin.js'),
                ...androidRockBuildArguments(releasePipeline.task, gradleArguments.slice(1)),
            ],
            join(rootDirectory, 'Mobile-Expensify'),
        );
        if (JSON.stringify(androidBuildEnvironment()) !== JSON.stringify(buildEnvironment)) {
            fail('Build environment changed during the Android build. Restore the selected environment file and rebuild.');
        }
        archiveReleaseApk(artifactPaths[kind]);
        writeFileSync(
            `${artifactPaths[kind]}.build-settings.json`,
            `${JSON.stringify({kind, architecture, emulatorVerification, releasePipeline: releasePipeline.enabled, appID: appID(), sourceBuiltRuntime: true, shrinking: releasePipeline.shrinking, fullStory: releasePipeline.enabled, signing: emulatorVerification ? 'debug-keystore' : 'existing-project-configuration', storeEquivalent: false, gradleArguments, buildEnvironment}, null, 2)}\n`,
        );
    }

    function install(kind: BuildKind): void {
        const apkPath = artifactPaths[kind];
        if (!existsSync(apkPath)) {
            fail(`Missing APK at ${apkPath}. Build the APK first.`);
        }
        adb(['install', '-r', apkPath]);
        if (emulatorVerification) {
            // A fresh emulator would otherwise cover the signed-in app with the notification prompt. API levels below 33 have no such permission.
            runAllowFailure('adb', [...(configuredDeviceIdentifier ? ['-s', configuredDeviceIdentifier] : []), 'shell', 'pm', 'grant', appID(), 'android.permission.POST_NOTIFICATIONS']);
        }
        console.log(`Installed APK: ${apkPath}`);
    }

    async function waitForProfileDump(): Promise<void> {
        const deadline = Date.now() + profileDumpTimeoutSeconds * 1000;
        while (Date.now() < deadline) {
            const profileLogs = adbCapture(['logcat', '-d', '-s', 'PgoProfileReceiver:I', '*:S']);
            const profileCount = /Wrote ([0-9]+) LLVM PGO profile/.exec(profileLogs)?.[1];
            if (profileCount !== undefined && Number(profileCount) !== 0) {
                if (Number(profileCount) !== INSTRUMENTED_LIBRARIES.length) {
                    fail(
                        `The PGO receiver wrote ${profileCount} profiles, but expected ${INSTRUMENTED_LIBRARIES.length}. All instrumented native libraries must write successfully before recording profiles.`,
                    );
                }
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
        try {
            for (const library of INSTRUMENTED_LIBRARIES) {
                const apkEntry = `lib/${architecture}/${library}`;
                if (!apkEntries.has(apkEntry)) {
                    fail(`Missing expected ${architecture} library in APK: ${apkEntry}`);
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

/** Keep release processing separate from bootstrap artifacts without rewriting local signing or identifiers. */
function androidReleasePipeline(value?: string, shrinkValue?: string): {enabled: boolean; shrinking: boolean; artifactDirectory: string; task: string; apkTask: string; arguments: string[]} {
    if (value && value !== 'true' && value !== 'false') {
        fail('PGO_ANDROID_RELEASE_PIPELINE must be true or false.');
    }
    if (shrinkValue && shrinkValue !== 'true' && shrinkValue !== 'false') {
        fail('PGO_ANDROID_SHRINK must be true or false.');
    }
    if (value === 'true' && shrinkValue === 'true') {
        fail('Choose PGO_ANDROID_RELEASE_PIPELINE or PGO_ANDROID_SHRINK, not both.');
    }
    if (shrinkValue === 'true') {
        return {
            enabled: false,
            shrinking: true,
            artifactDirectory: 'apk-shrunk',
            task: ':packageRelease',
            apkTask: 'packageRelease',
            arguments: [...FULLSTORY_EXCLUSIONS, '-PpgoSkipFullStory=true', '--init-script', join(rootDirectory, 'scripts/pgo/androidRelease.init.gradle')],
        };
    }
    if (value !== 'true') {
        return {enabled: false, shrinking: false, artifactDirectory: 'apk', task: ':packageRelease', apkTask: 'packageRelease', arguments: [...FULLSTORY_EXCLUSIONS]};
    }
    return {
        enabled: true,
        shrinking: true,
        artifactDirectory: 'apk-release-pipeline',
        task: ':fullstoryRelease',
        apkTask: 'fullstoryRelease',
        arguments: ['--init-script', join(rootDirectory, 'scripts/pgo/androidRelease.init.gradle')],
    };
}

/** Rock prefixes the application module and parses the extra Gradle arguments as one quoted argument list. */
function androidRockBuildArguments(task: string, gradleArguments: string[]): string[] {
    return [
        'build:android',
        '--local',
        '--verbose',
        '--variant',
        'release',
        '--tasks',
        // Mobile-Expensify only runs buildGrunt, which bundles OldDot's shared JS into the APK assets, for install, assemble and bundle tasks.
        `buildGrunt,${task.replace(/^:/, '')}`,
        '--extra-params',
        gradleArguments.map((argument) => JSON.stringify(argument)).join(' '),
    ];
}

/** Resolve LLVM tools from the build's explicit NDK or host-specific SDK installation. */
function androidLlvmToolPath(
    name: string,
    {hostPlatform = platform(), homeDirectory = homedir(), environment = process.env}: {hostPlatform?: NodeJS.Platform; homeDirectory?: string; environment?: NodeJS.ProcessEnv} = {},
): string {
    const configuredNdkRoot = [environment.ANDROID_NDK_HOME, environment.ANDROID_NDK_ROOT].find((value): value is string => typeof value === 'string' && value.length > 0);
    const configuredSdkRoot = [environment.ANDROID_HOME, environment.ANDROID_SDK_ROOT].find((value): value is string => typeof value === 'string' && value.length > 0);
    const sdkRoot = configuredSdkRoot ?? join(homeDirectory, hostPlatform === 'linux' ? 'Android/Sdk' : 'Library/Android/sdk');
    const ndkRoot = configuredNdkRoot ?? join(sdkRoot, 'ndk/27.1.12297006');
    const hostTag = hostPlatform === 'linux' ? 'linux-x86_64' : 'darwin-x86_64';
    return join(ndkRoot, `toolchains/llvm/prebuilt/${hostTag}/bin/${name}`);
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
export {PROFILE_BROADCAST_ACTION, androidApplicationID, androidLlvmToolPath, androidProfileReceiverComponent, androidReleasePipeline, androidRockBuildArguments};
