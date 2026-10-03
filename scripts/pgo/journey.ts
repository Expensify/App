#!/usr/bin/env bun

// cspell:ignore profraw profdata

import CLI from 'expensify-common/CLI';
import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';

import {PLATFORM_NAMES} from '../lib/nativeAppBenchmark';
import {capture, findFiles, parseChoice, parsePositiveInteger, rootDirectory, run} from '../lib/scriptUtils';
import createAndroidPgoAdapter from './android';
import createIOSPgoAdapter from './ios';
import {parseJourneyFixture} from './journeyConfig';
import {createJourneyDevice} from './journeyDevice';
import {prepareJourney, runJourneyWorkload, verifyJourneyAccount} from './journeyWorkload';

/** Run the same UI workload on a selected Android or iOS device; never automate authentication. */
async function main(): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [{name: 'platform', description: 'android or ios', parse: (value): PlatformName => parseChoice(value, PLATFORM_NAMES, 'Platform')}],
        namedArgs: {
            fixture: {description: 'JSON fixture identifying the approved heavy account and reports'},
            device: {description: 'Android serial or iOS UDID'},
            'app-id': {description: 'Installed application or bundle identifier'},
            runs: {description: 'Complete journeys to run', default: 1, parse: (value) => parsePositiveInteger(value, 'Runs')},
        },
        flags: {
            collect: {description: 'Flush, archive, and merge LLVM profiles from an already-installed instrumented app'},
            preflight: {description: 'Verify account and disable #focus, then stop without running the workload'},
            'navigation-only': {description: 'Validate navigation without sending messages; cannot collect training profiles'},
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    const platform = parseChoice(String(cli.positionalArgs.platform), PLATFORM_NAMES, 'Platform');
    const fixtureInput: unknown = JSON.parse(readFileSync(resolve(cli.namedArgs.fixture), 'utf8'));
    const fixture = parseJourneyFixture(fixtureInput);
    if (cli.flags['navigation-only'] && cli.flags.collect) {
        throw new Error('Navigation-only validation cannot produce a complete training profile.');
    }
    if (!cli.flags.preflight && !cli.flags['navigation-only'] && !fixture.allowMessages) {
        throw new Error('Confirm the personal chat with Chris before setting allowMessages=true in the fixture. Use --navigation-only to validate without sending.');
    }
    const runs = parsePositiveInteger(String(cli.namedArgs.runs), 'Runs');
    const batchID = new Date().toISOString().replaceAll(/[:.]/g, '-');
    const batchDirectory = join(rootDirectory, '.pgo', platform, 'journeys', batchID);
    mkdirSync(batchDirectory, {recursive: true});
    const device = createJourneyDevice({platform, device: cli.namedArgs.device, appID: cli.namedArgs['app-id'], session: `pgo-${platform}-${batchID}`});
    const adapter = platform === 'android' ? createAndroidPgoAdapter(cli.namedArgs['app-id'], cli.namedArgs.device) : createIOSPgoAdapter(cli.namedArgs['app-id'], cli.namedArgs.device);
    const completedProfiles: string[] = [];
    const evidence = {
        platform,
        device: cli.namedArgs.device,
        appID: cli.namedArgs['app-id'],
        accountEmail: fixture.accountEmail,
        accountClass: fixture.accountClass,
        fixture,
        sourceRevision: capture('git', ['rev-parse', 'HEAD']).trim(),
        mobileRevision: capture('git', ['-C', 'Mobile-Expensify', 'rev-parse', 'HEAD']).trim(),
        automationVersion: capture('agent-device', ['--version']).trim(),
        requestedRuns: runs,
        collectProfiles: cli.flags.collect,
        navigationOnly: cli.flags['navigation-only'],
        completedRuns: 0,
        runDurationsSeconds: [] as number[],
        status: 'running',
        failure: '',
    };
    const saveEvidence = () => writeFileSync(join(batchDirectory, 'result.json'), `${JSON.stringify(evidence, null, 2)}\n`);
    saveEvidence();
    try {
        device.open(false);
        await prepareJourney(device, fixture);
        if (cli.flags.preflight) {
            evidence.status = 'preflight-passed';
            return;
        }
        if (cli.flags.collect) {
            // Verify the installed build's writer before spending time on the workload; discard these setup counters.
            await adapter.dumpProfiles();
            await adapter.clearDeviceProfiles();
        }
        for (let index = 1; index <= runs; index += 1) {
            const runID = `${batchID}-${index}`;
            const runDirectory = join(batchDirectory, `run-${index}`);
            mkdirSync(runDirectory);
            if (index > 1) {
                await prepareJourney(device, fixture);
                if (cli.flags.collect) {
                    await adapter.clearDeviceProfiles();
                }
            }
            console.log(`Starting journey ${index}/${runs}.`);
            const startedAt = Date.now();
            device.open(true);
            await runJourneyWorkload(device, fixture, runID, cli.flags['navigation-only']);
            await verifyJourneyAccount(device, fixture);
            if (cli.flags.collect) {
                // Flush once per fresh process. Never merge partial or failed journeys.
                await adapter.dumpProfiles();
                adapter.pullProfiles();
                const rawDirectory = join(runDirectory, 'raw');
                const profiles = findFiles(adapter.rawProfileDirectory, '.profraw');
                if (profiles.length === 0) {
                    throw new Error('The completed journey produced no LLVM profiles.');
                }
                for (const profile of profiles) {
                    // Archive counters only, not unrelated files pulled from the app's cache directory.
                    const archivedProfile = join(rawDirectory, relative(adapter.rawProfileDirectory, profile));
                    mkdirSync(dirname(archivedProfile), {recursive: true});
                    copyFileSync(profile, archivedProfile);
                    completedProfiles.push(archivedProfile);
                }
            }
            evidence.completedRuns = index;
            evidence.runDurationsSeconds.push(Math.round((Date.now() - startedAt) / 1000));
            saveEvidence();
        }
        if (cli.flags.collect) {
            const mergedProfile = join(batchDirectory, 'journey.profdata');
            run(adapter.llvmTool('llvm-profdata'), ['merge', `--output=${mergedProfile}`, ...completedProfiles]);
            if (adapter.profileFormat) {
                writeFileSync(`${mergedProfile}.format`, `${adapter.profileFormat}\n`);
            }
            writeFileSync(`${mergedProfile}.txt`, capture(adapter.llvmTool('llvm-profdata'), ['show', '--all-functions', mergedProfile]));
            console.log(`Journey profile: ${mergedProfile}`);
        }
        evidence.status = cli.flags['navigation-only'] ? 'navigation-passed' : 'passed';
    } catch (error) {
        evidence.status = 'failed';
        evidence.failure = error instanceof Error ? error.message : String(error);
        throw error;
    } finally {
        saveEvidence();
        // Release the device and restore Android's original keyboard, including on failed attempts.
        // Closing a session leaves persisted authentication intact.
        try {
            device.command('close');
        } catch (error) {
            console.error(`Device cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        console.log(`Journey result: ${join(batchDirectory, 'result.json')}`);
    }
}

if (import.meta.main) {
    main().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        process.exitCode = message.startsWith('SIGN_IN_REQUIRED:') ? 2 : 1;
    });
}
