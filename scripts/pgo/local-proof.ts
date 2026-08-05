#!/usr/bin/env -S node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON

import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {homedir, platform, tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const DEFAULT_STARTUP_RUNS = 10;
const DEFAULT_APP_READY_TIMEOUT_SECONDS = 30;
const STARTUP_RELAUNCH_DELAY_MS = 500;

type BuildKind = 'release' | 'instrumented' | 'optimized';
type BenchmarkKind = Extract<BuildKind, 'release' | 'optimized'>;

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
    build: (kind: BuildKind) => void;
    install: (kind: BuildKind) => void;
    verifyInstrumentation: () => void;
    clearDeviceProfiles: () => void;
    dumpProfiles: () => Promise<void>;
    pullProfiles: () => void;
    forceStop: () => void;
    clearSystemLogs: () => void;
    launch: () => void;
    waitForAppReady: (timeoutSeconds: number) => Promise<number | null>;
    llvmTool: (name: string) => string;
};

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
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

function requirePositiveInteger(rawValue: string | undefined, defaultValue: number, label: string): number {
    if (rawValue === undefined || rawValue.length === 0) {
        return defaultValue;
    }

    const value = Number(rawValue);
    if (!Number.isSafeInteger(value) || value <= 0) {
        fail(`${label} must be a positive integer, received: ${rawValue}`);
    }
    return value;
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
        clearDeviceProfiles: () => {
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

function mergeProfiles(adapter: PlatformAdapter): void {
    mkdirSync(adapter.profileDirectory, {recursive: true});
    const profiles = findFiles(adapter.rawProfileDirectory, '.profraw');
    if (profiles.length === 0) {
        fail('No .profraw files found. Run dump and pull first.');
    }

    const llvmProfdata = adapter.llvmTool('llvm-profdata');
    run(llvmProfdata, ['merge', `--output=${adapter.mergedProfilePath}`, ...profiles]);
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
        fail('APP_READY did not contain a numeric durationMs marker. Rebuild the APK with the startup metric changes.');
    }
    return duration;
}

async function recordStartups(adapter: PlatformAdapter, runs: number, readyTimeoutSeconds: number): Promise<void> {
    adapter.clearDeviceProfiles();
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

function printUsage(): void {
    console.log(
        `Usage: ${basename(process.argv.at(1) ?? 'local-proof.ts')} android {build-release|build-instrumented|build-optimized|verify-instrumented|install-release|install-instrumented|install-optimized|record-startups [runs] [ready-timeout-seconds]|benchmark-release [runs] [ready-timeout-seconds]|benchmark-optimized [runs] [ready-timeout-seconds]|benchmark [runs] [ready-timeout-seconds]|compare-benchmarks|dump|pull|merge}`,
    );
}

function getAdapter(platformName: string | undefined): PlatformAdapter {
    if (platformName === 'android') {
        return createAndroidAdapter();
    }
    if (platformName === 'ios') {
        fail('The iOS PGO workflow is not implemented yet.');
    }

    printUsage();
    fail(`Unsupported or missing platform: ${platformName ?? '(none)'}`);
}

async function main(): Promise<void> {
    const [, , platformName, command, runsArgument, timeoutArgument] = process.argv;
    const adapter = getAdapter(platformName);
    const runs = requirePositiveInteger(runsArgument, DEFAULT_STARTUP_RUNS, 'Startup run count');
    const timeoutSeconds = requirePositiveInteger(timeoutArgument, DEFAULT_APP_READY_TIMEOUT_SECONDS, 'App-ready timeout');

    switch (command) {
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
            return;
        default:
            printUsage();
            fail(`Unsupported or missing command: ${command ?? '(none)'}`);
    }
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
