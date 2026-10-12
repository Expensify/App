// cspell:ignore cooldown probey

import {describe, expect, it} from 'bun:test';

import createAndroidPgoAdapter from '@scripts/pgo/android';
import {benchmarkStagePlan, configureSafeEvaluationOptions, readCohort, readPublicFrames, readSamples, runGuardedStage} from '@scripts/pgo/evaluationRun';
import {hasExecutedSwiftFunctions, profileCounts, validateJourney} from '@scripts/pgo/proof';

import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

describe('PGO evaluation cohort acceptance', () => {
    it('selects the shrunk artifact directory before constructing the Android adapter', () => {
        // Given inherited settings that would select the ordinary bootstrap directory.
        const names = ['PGO_ANDROID_RELEASE_PIPELINE', 'PGO_ANDROID_SHRINK', 'PGO_BENCHMARK_COOLDOWN_SECONDS', 'PATH'];
        const previous = names.map((name) => [name, process.env[name]] as const);
        process.env.PGO_ANDROID_SHRINK = 'false';
        try {
            // When safe evaluation options are applied before adapter construction.
            configureSafeEvaluationOptions(process.cwd());
            const adapter = createAndroidPgoAdapter('evaluation.app', 'physical');
            // Then the parent and child build both refer to the shrunk artifact path.
            expect(adapter.artifactPaths.instrumented).toContain('/apk-shrunk/');
            expect(process.env.PGO_ANDROID_RELEASE_PIPELINE).toBe('false');
        } finally {
            for (const [name, value] of previous) {
                if (value === undefined) {
                    delete process.env[name];
                } else {
                    process.env[name] = value;
                }
            }
        }
    });
    it('publishes frame availability without private responses or invented zeros', () => {
        // Given twenty unavailable frame windows containing private raw responses.
        const directory = mkdtempSync(join(tmpdir(), 'pgo-evaluation-'));
        const path = join(directory, 'frames.json');
        writeFileSync(
            path,
            JSON.stringify({
                schema: 1,
                requestedRuns: 20,
                samples: Array.from({length: 20}, (_, index) => ({run: index + 1, status: 'unavailable', raw: 'private UI response', reason: 'private path'})),
            }),
        );
        try {
            // When frame observations pass into the public result.
            const frames = readPublicFrames(path);
            // Then unavailable observations retain their run identity and no private fields or numeric replacements.
            expect(frames).toHaveLength(20);
            expect(frames.at(0)).toEqual({run: 1, status: 'unavailable'});
            expect(JSON.stringify(frames)).not.toContain('private');
        } finally {
            rmSync(directory, {recursive: true, force: true});
        }
    });
    it('rejects partial and foreign training before optimizing', () => {
        // Given a complete training result and its expected source and toolchain.
        const result = {
            platform: 'android',
            status: 'passed',
            accountClass: 'heavy',
            requestedRuns: 3,
            completedRuns: 3,
            collectProfiles: true,
            navigationOnly: false,
            sourceIdentity: 'source',
            toolchain: 'tools',
        };
        // When a completed run is missing or the source differs.
        // Then neither result can be accepted for optimization.
        expect(() => validateJourney({...result, completedRuns: 2}, 'android', 'source', 'tools')).toThrow();
        expect(() => validateJourney(result, 'android', 'foreign', 'tools')).toThrow();
        expect(() => validateJourney(result, 'android', 'source', 'tools')).not.toThrow();
    });

    it('retains large LLVM counters and rejects a zero execution maximum', () => {
        // Given LLVM summaries using Maximum function count rather than Total count.
        const positive = 'Total functions: 2\nMaximum function count: 4294967297\n';
        // When counts exceed the unsigned 32-bit range.
        const counts = profileCounts(positive);
        // Then the exact count survives and a zero maximum remains invalid.
        expect(counts.count).toBe('4294967297');
        expect(() => profileCounts('Total functions: 2\nMaximum function count: 0\n')).toThrow();
    });
    it('prefers an explicit aggregate LLVM count over a positive maximum', () => {
        // Given frontend and IR summaries with different supported execution-count fields.
        const frontend = 'Total functions: 2\nMaximum function count: 42\nTotal count: 100';
        const ir = 'Total functions: 2\nMaximum function count: 42';
        // When both summaries are parsed, or an explicit aggregate count is zero.
        expect(profileCounts(frontend).count).toBe('100');
        expect(profileCounts(ir).count).toBe('42');
        // Then an executed maximum cannot override a reported zero aggregate count.
        expect(() => profileCounts(frontend.replace('Total count: 100', 'Total count: 0'))).toThrow('no executed functions');
    });

    it('requires executed Swift counters without borrowing a neighboring function count', () => {
        // Given a zero-count Swift function followed by an executed Clang function.
        const report = 'Counters:\n  $s5Probe5probeyS2iF:\n    Hash: 0x0\n    Counters: 1\n    Function count: 0\n    Block counts: []\n  clangFunction:\n    Function count: 42\n';
        // When the iOS execution guard reads frontend or IR function counter reports.
        expect(hasExecutedSwiftFunctions(report)).toBe(false);
        expect(hasExecutedSwiftFunctions(report.replace('Function count: 0', 'Function count: 3'))).toBe(true);
        expect(hasExecutedSwiftFunctions(report.replace('$s5Probe5probeyS2iF', 'anotherClangFunction'))).toBe(false);
        expect(hasExecutedSwiftFunctions('Total count: 42')).toBe(false);
        // Then only Swift functions with their own positive execution counters pass.
        expect(hasExecutedSwiftFunctions('Counters:\n  $s5Probe5probeyS2iF:\n    Hash: 0x12\n    Counters: 3\n    Block counts: [0, 102, 1]\n')).toBe(true);
        expect(hasExecutedSwiftFunctions('Counters:\n  $s5Probe5probeyS2iF:\n    Block counts: [0, 0, 0]\n')).toBe(false);
        expect(hasExecutedSwiftFunctions(report.replace('$s5Probe5probeyS2iF', '/tmp/Probe.swift:$s5Probe5probeyS2iF').replace('Function count: 0', 'Function count: 3'))).toBe(true);
    });

    it('executes fresh paired workloads in both orders using supported CLI actions', () => {
        // Given the evaluation stage plan used by the physical runner.
        const stages = benchmarkStagePlan();
        // When its actions and orders are inspected without touching a device.
        const actions = stages.map(({order, scenario}) => `${scenario.action}:${order}`);
        // Then all three workload types have distinct cohorts in each order.
        expect(actions).toEqual([
            'benchmark-heavy-journey:release-first',
            'benchmark-journey:release-first',
            'benchmark:release-first',
            'benchmark-heavy-journey:optimized-first',
            'benchmark-journey:optimized-first',
            'benchmark:optimized-first',
        ]);
    });

    it('stops before launching a workload when immutable inputs changed', () => {
        // Given a failed source or profile guard and a workload that has not started.
        let launched = false;
        // When the guarded execution boundary is entered.
        const execute = () =>
            runGuardedStage(
                () => {
                    throw new Error('changed');
                },
                () => {
                    launched = true;
                },
            );
        // Then no device operation is launched.
        expect(execute).toThrow('changed');
        expect(launched).toBe(false);
    });

    it('rejects completed work if its inputs changed during execution', () => {
        // Given a guard that succeeds before work and fails afterward.
        let checks = 0;
        // When the workload completes against changing inputs.
        const execute = () =>
            runGuardedStage(
                () => {
                    checks += 1;
                    if (checks === 2) {
                        throw new Error('changed');
                    }
                },
                () => 'completed',
            );
        // Then the stage cannot be accepted as a successful cohort.
        expect(execute).toThrow('changed');
        expect(checks).toBe(2);
    });

    it('rejects a cohort from the wrong physical device before reading samples', () => {
        // Given metadata from a different device despite a successful command exit.
        const directory = mkdtempSync(join(tmpdir(), 'pgo-evaluation-'));
        writeFileSync(join(directory, 'run.json'), JSON.stringify({deviceID: 'other', appID: 'app', order: 'release-first', runs: 20, warmUpRunsPerBinary: 1, cooldownSecondsPerBinary: 5}));
        try {
            // When the expected cohort is bound to the approved device.
            // Then metadata mismatch prevents accepting unrelated CSV files.
            expect(() => readCohort(directory, 'startup', 'release-first', ['ManualAppStartup'], 'approved', 'app')).toThrow('context');
        } finally {
            rmSync(directory, {recursive: true, force: true});
        }
    });

    it('accepts actual startup batch filenames and preserves every native timing', () => {
        // Given a completed startup batch using the startup producer's optimized.csv name.
        const directory = mkdtempSync(join(tmpdir(), 'pgo-evaluation-'));
        writeFileSync(
            join(directory, 'run.json'),
            JSON.stringify({platform: 'android', deviceID: 'approved', appID: 'app', order: 'optimized-first', runs: 20, warmUpRunsPerBinary: 1, cooldownSecondsPerBinary: 5}),
        );
        const csv = `run,span,duration_ms\n${Array.from({length: 20}, (_, index) => `${index + 1},ManualAppStartup,${100 + index}`).join('\n')}\n`;
        writeFileSync(join(directory, 'release.csv'), csv);
        writeFileSync(join(directory, 'optimized.csv'), csv);
        try {
            // When the startup cohort reader binds the physical device and run order.
            const cohort = readCohort(directory, 'startup', 'optimized-first', ['ManualAppStartup'], 'approved', 'app');
            // Then both complete observations and their actual file hashes are retained.
            expect(cohort.release).toHaveLength(20);
            expect(cohort.optimized).toHaveLength(20);
            expect(cohort.optimizedCsvSha256).toBe(cohort.releaseCsvSha256);
        } finally {
            rmSync(directory, {recursive: true, force: true});
        }
    });
    it('retains zero duration samples and requires twenty distinct runs', () => {
        // Given a complete native span cohort including a zero duration observation.
        const directory = mkdtempSync(join(tmpdir(), 'pgo-evaluation-'));
        const path = join(directory, 'samples.csv');
        writeFileSync(path, `run,span,duration_ms\n${Array.from({length: 20}, (_, index) => `${index + 1},startup,${index}`).join('\n')}\n`);
        try {
            // When the exact expected span is read.
            const samples = readSamples(path, ['startup']);
            // Then all observations are retained without inventing an exclusion threshold.
            expect(samples).toHaveLength(20);
            expect(samples.at(0)?.durationMs).toBe(0);
        } finally {
            rmSync(directory, {recursive: true, force: true});
        }
    });

    it('rejects duplicate runs even when the total row count is twenty', () => {
        // Given a CSV whose final row repeats run nineteen instead of run twenty.
        const directory = mkdtempSync(join(tmpdir(), 'pgo-evaluation-'));
        const path = join(directory, 'samples.csv');
        writeFileSync(path, `run,span,duration_ms\n${Array.from({length: 20}, (_, index) => `${Math.min(index + 1, 19)},startup,1`).join('\n')}\n`);
        try {
            // When cohort validation checks each run and span pair.
            // Then the incomplete cohort cannot become a successful public evaluation.
            expect(() => readSamples(path, ['startup'])).toThrow('twenty complete samples');
        } finally {
            rmSync(directory, {recursive: true, force: true});
        }
    });
});
