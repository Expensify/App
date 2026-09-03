import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * reassurePerformanceTests.yml restores a Jest transform cache that seedJestPerfCache.yml writes.
 * Three properties make that safe and effective, and all three are invisible at a glance because
 * they are agreements between two files. These tests are the enforcement:
 *
 * 1. Every copy of the cache key is byte-identical. A restore keyed differently from the save is a
 *    silent permanent miss - nothing fails, the perf jobs just go cold again.
 * 2. The seed workflow's `paths` filter is a superset of what the key hashes. If the key can rotate
 *    on a push that schedules no writer, the cache goes stale forever with no failing check.
 * 3. No `restore-keys` anywhere. A prefix fallback would reuse transform output built by a
 *    different babel-plugin-react-compiler, because babel-jest does not hash plugin versions into
 *    an entry's name, and this workflow gates render counts at COUNT_DEVIATION: 0.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';
const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';

type Step = {name?: string; uses?: string; with?: Record<string, unknown>};
// eslint-disable-next-line @typescript-eslint/naming-convention -- these mirror the workflow YAML keys verbatim
type Job = {'runs-on'?: string; steps?: Step[]};
type Workflow = {on?: Record<string, {paths?: string[]}>; jobs: Record<string, Job>};

function readWorkflow(path: string): Workflow {
    // Bun.YAML rather than js-yaml: this suite already runs under Bun, and js-yaml is only present
    // as a hoisted transitive at v3 while the repo declares @types/js-yaml v4, so importing it here
    // would rest on an undeclared package whose types do not match its runtime.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Bun.YAML.parse returns unknown, and every field this test reads is optional, so a shape mismatch fails an assertion rather than throwing
    return Bun.YAML.parse(fs.readFileSync(path, 'utf8')) as Workflow;
}

function cacheSteps(workflow: Workflow): Step[] {
    return Object.values(workflow.jobs)
        .flatMap((job) => job.steps ?? [])
        .filter((step) => typeof step.uses === 'string' && step.uses.startsWith('actions/cache') && String(step.with?.path) === '.jest-cache');
}

const perfWorkflow = readWorkflow(PERF_WORKFLOW);
const seedWorkflow = readWorkflow(SEED_WORKFLOW);
const allCacheSteps = [...cacheSteps(perfWorkflow), ...cacheSteps(seedWorkflow)];

describe('Jest perf transform cache', () => {
    it('keys every .jest-cache step identically', () => {
        // Both measure jobs restore, the seed job looks up and saves.
        expect(allCacheSteps).toHaveLength(4);
        const keys = new Set(allCacheSteps.map((step) => String(step.with?.key)));
        expect([...keys]).toHaveLength(1);
    });

    it('never falls back to a prefix key', () => {
        for (const step of allCacheSteps) {
            expect(step.with).not.toHaveProperty('restore-keys');
        }
    });

    it('filters the seed workflow on a superset of what the key hashes', () => {
        const key = String(allCacheSteps.at(0)?.with?.key);
        const hashed: string[] = [...key.matchAll(/'([^']+)'/g)].map((match) => String(match.at(1))).filter((entry) => !entry.includes('{0}'));
        expect(hashed.length).toBeGreaterThan(0);

        const filtered = seedWorkflow.on?.push?.paths ?? [];
        // setupNode derives normalized-package-lock.json from package-lock.json, so the filter
        // watches the source file the generated one is built from.
        const covered = hashed.map((entry) => (entry === 'normalized-package-lock.json' ? 'package-lock.json' : entry));
        for (const entry of covered) {
            expect(filtered).toContain(entry);
        }
    });

    it('restores only in the perf workflow, so a fork PR can never write the shared entry', () => {
        for (const step of cacheSteps(perfWorkflow)) {
            expect(step.uses).toStartWith('actions/cache/restore@');
        }
    });

    it('seeds on the same runner class the perf jobs measure on', () => {
        const measureRunners = new Set(
            Object.entries(perfWorkflow.jobs)
                .filter(([name]) => name.endsWith('-perf-tests') && name !== 'validate-perf-tests')
                .map(([, job]) => String(job['runs-on'])),
        );
        const seedRunner = String(Object.values(seedWorkflow.jobs).at(0)?.['runs-on']);
        expect([...measureRunners]).toEqual([seedRunner]);
    });

    it('computes the key after setupNode has written normalized-package-lock.json', () => {
        for (const job of [...Object.values(perfWorkflow.jobs), ...Object.values(seedWorkflow.jobs)]) {
            const steps = job.steps ?? [];
            const setupNodeIndex = steps.findIndex((step) => step.uses === './.github/actions/composite/setupNode');
            for (const [index, step] of steps.entries()) {
                if (!(typeof step.uses === 'string' && step.uses.startsWith('actions/cache')) || String(step.with?.path) !== '.jest-cache') {
                    continue;
                }
                expect(setupNodeIndex).toBeGreaterThanOrEqual(0);
                expect(index).toBeGreaterThan(setupNodeIndex);
            }
        }
    });
});
