// cspell:ignore sdcard profdata profraw simctl
import {appendFileSync, cpSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';
import type {VerificationMarker} from './emulatorFixture';
import type {PlatformAdapter} from './shared';

import {capture, fail, findFiles, parseChoice, rootDirectory, run, runAllowFailure, sleep} from '../lib/scriptUtils';
import createAndroidPgoAdapter from './android';
import {parseVerificationMarker, VERIFICATION_MARKER} from './emulatorFixture';
import createIOSPgoAdapter from './ios';
import {bootIOSVerificationSimulator, createIOSSimulatorDevice} from './iosSimulator';
import {fileHash, profileCounts} from './proof';

/** Verify the real native PGO build cycle with a self-running synthetic workload. */
async function verifyEmulator(platform: PlatformName): Promise<void> {
    const output = join(rootDirectory, '.pgo/ci', platform);
    rmSync(output, {recursive: true, force: true});
    mkdirSync(output, {recursive: true});
    process.env.PGO_CI_EMULATOR = 'true';
    process.env.PGO_ANDROID_RELEASE_PIPELINE = 'false';
    process.env.PGO_ANDROID_SHRINK = 'false';
    let simulatorIdentifier: string | undefined;
    try {
        if (platform === 'android') {
            process.env.PGO_ANDROID_ARCH = 'x86_64';
        } else {
            simulatorIdentifier = bootIOSVerificationSimulator();
            process.env.PGO_IOS_SIMULATOR_ID = simulatorIdentifier;
        }
        const identifier = simulatorIdentifier ?? androidEmulatorIdentifier();
        const adapter = platform === 'android' ? createAndroidPgoAdapter(undefined, identifier) : createIOSPgoAdapter();

        adapter.build('release');
        adapter.build('instrumented');
        adapter.verifyInstrumentation();
        adapter.install('instrumented');
        const workload = createEmulatorWorkload(adapter, identifier);
        await workload();
        for (let repetition = 1; repetition <= 3; repetition++) {
            await adapter.clearDeviceProfiles();
            await workload();
            await adapter.dumpProfiles();
            adapter.pullProfiles();
            cpSync(adapter.rawProfileDirectory, join(output, 'raw', String(repetition)), {recursive: true});
        }

        const profiles = findFiles(join(output, 'raw'), '.profraw').sort();
        if (profiles.length < 3) {
            fail('Each emulator training repetition must produce a native profile.');
        }
        const llvm = adapter.llvmTool('llvm-profdata');
        run(llvm, ['merge', `--output=${adapter.mergedProfilePath}`, ...profiles]);
        if (adapter.profileFormat) {
            writeFileSync(`${adapter.mergedProfilePath}.format`, `${adapter.profileFormat}\n`);
        }
        const profileReport = capture(llvm, ['show', '--all-functions', '--counts', adapter.mergedProfilePath]);
        const counts = profileCounts(profileReport);
        writeFileSync(join(output, 'profile.txt'), profileReport);
        cpSync(adapter.mergedProfilePath, join(output, 'verification.profdata'));
        const profileHash = fileHash(adapter.mergedProfilePath);
        adapter.build('optimized', adapter.mergedProfilePath);
        if (fileHash(adapter.mergedProfilePath) !== profileHash) {
            fail('The training profile changed during the optimized build.');
        }

        const samples: Array<{kind: 'release' | 'optimized'; workload: VerificationMarker}> = [];
        for (const kind of ['release', 'optimized', 'optimized', 'release'] as const) {
            adapter.install(kind);
            samples.push({kind, workload: await workload()});
        }
        writeFileSync(
            join(output, 'result.json'),
            `${JSON.stringify(
                {
                    schema: 1,
                    status: 'passed',
                    platform,
                    target: platform === 'android' ? 'android-emulator-x86_64' : `ios-simulator-${process.arch}`,
                    workload: 'synthetic',
                    deployable: false,
                    appSHA: capture('git', ['rev-parse', 'HEAD']).trim(),
                    mobileSHA: capture('git', ['rev-parse', 'HEAD'], join(rootDirectory, 'Mobile-Expensify')).trim(),
                    profile: {sha256: profileHash, ...counts},
                    artifacts: Object.fromEntries(Object.entries(adapter.artifactPaths).map(([kind, path]) => [kind, fileHash(path)])),
                    samples,
                },
                null,
                2,
            )}\n`,
        );
        publishSummary(
            `Native PGO ${platform} emulator verification passed. Baseline, instrumentation, three training runs, profile merge and optimized rebuild completed. Both builds completed the synthetic workload. These samples do not establish phone performance or select a deployment artifact.\n`,
            output,
        );
    } catch (error) {
        writeFileSync(join(output, 'result.json'), `${JSON.stringify({schema: 1, status: 'failed', platform, workload: 'synthetic', deployable: false}, null, 2)}\n`);
        publishSummary(`Native PGO ${platform} emulator verification failed. Open the failed step's log for the build or workload error.\n`, output);
        throw error;
    } finally {
        if (simulatorIdentifier) {
            runAllowFailure('xcrun', ['simctl', 'shutdown', simulatorIdentifier]);
            runAllowFailure('xcrun', ['simctl', 'delete', simulatorIdentifier]);
        }
    }
}

function createEmulatorWorkload(adapter: PlatformAdapter, identifier: string): () => Promise<VerificationMarker> {
    const simulator = adapter.name === 'ios' ? createIOSSimulatorDevice(identifier, adapter.appID) : undefined;
    const marker = `/sdcard/Android/data/${adapter.appID()}/cache/${VERIFICATION_MARKER}`;
    const adb = (args: string[]) => run('adb', ['-s', identifier, ...args]);
    return async () => {
        if (simulator) {
            simulator.removeFile(`Library/Caches/${VERIFICATION_MARKER}`);
            simulator.launch();
        } else {
            adb(['shell', 'am', 'force-stop', adapter.appID()]);
            adb(['shell', 'rm', '-f', marker]);
            adb(['shell', 'monkey', '-p', adapter.appID(), '-c', 'android.intent.category.LAUNCHER', '1']);
        }
        const deadline = Date.now() + 90_000;
        while (Date.now() < deadline) {
            let text: string | undefined;
            if (simulator) {
                text = simulator.readFile(`Library/Caches/${VERIFICATION_MARKER}`);
            } else if (runAllowFailure('adb', ['-s', identifier, 'shell', 'test', '-f', marker])) {
                text = capture('adb', ['-s', identifier, 'shell', 'cat', marker]);
            }
            if (text) {
                const input: unknown = JSON.parse(text);
                return parseVerificationMarker(input);
            }
            await sleep(500);
        }
        fail('The bundled emulator workload did not finish within 90 seconds.');
    };
}

function androidEmulatorIdentifier(abi = 'x86_64'): string {
    const devices = capture('adb', ['devices'])
        .split('\n')
        .flatMap((line) => {
            const identifier = /^(emulator-\d+)\s+device$/.exec(line.trim())?.[1];
            return identifier ? [identifier] : [];
        });
    const identifier = devices.length === 1 ? devices.at(0) : undefined;
    if (!identifier || capture('adb', ['-s', identifier, 'shell', 'getprop', 'ro.product.cpu.abi']).trim() !== abi) {
        fail(`PGO CI requires one booted ${abi} Android emulator.`);
    }
    return identifier;
}

function publishSummary(text: string, output: string): void {
    writeFileSync(join(output, 'summary.md'), text);
    if (process.env.GITHUB_STEP_SUMMARY) {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
    }
}

if (import.meta.main) {
    const platform = parseChoice(process.argv.at(2) ?? '', ['android', 'ios'], 'Emulator platform');
    await verifyEmulator(platform);
}

export {androidEmulatorIdentifier};
export default verifyEmulator;
