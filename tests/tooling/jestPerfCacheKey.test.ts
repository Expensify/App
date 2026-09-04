import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * reassurePerformanceTests.yml restores a Jest transform cache that seedJestPerfCache.yml writes.
 * Four properties make that safe and effective, and all four are invisible at a glance because they
 * are agreements between two files. These tests are the enforcement:
 *
 * 1. Every copy of the cache key is byte-identical. A restore keyed differently from the save is a
 *    silent permanent miss - nothing fails, the perf jobs just go cold again.
 * 2. A push-triggered workflow calls the seed. It carries no paths filter and no schedule, so
 *    probing every push to main is both how the entry stays warm and how it recovers from an
 *    eviction. Orphan the call and the cache goes stale forever with no failing check.
 * 3. No `restore-keys` anywhere. A prefix fallback would reuse transform output built by a
 *    different babel-plugin-react-compiler, because babel-jest does not hash plugin versions into
 *    an entry's name, and this workflow gates render counts at COUNT_DEVIATION: 0.
 * 4. Every restore is followed by a step that reads its `cache-hit`. A miss costs each measure job
 *    a full cold Babel pass and fails nothing, and `Report Jest cache size` reads the directory
 *    after the perf run, by which point Jest has written a full transform set either way. So that
 *    warning is the only thing distinguishing a working mechanism from one that silently died.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';
const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';
const STICKY_WORKFLOW = '.github/workflows/seedStickyDisks.yml';

type Step = {name?: string; id?: string; uses?: string; if?: string; run?: string; with?: Record<string, unknown>};
// eslint-disable-next-line @typescript-eslint/naming-convention -- these mirror the workflow YAML keys verbatim
type Job = {'runs-on'?: string; uses?: string; steps?: Step[]};
type Workflow = {on?: Record<string, {paths?: string[]; branches?: string[]} | null>; jobs: Record<string, Job>};

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
const stickyWorkflow = readWorkflow(STICKY_WORKFLOW);
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

    it('is reachable from a push to main, so an evicted entry is rebuilt on the next merge', () => {
        // The seed carries no paths filter and no schedule. Probing on every push to main is what
        // keeps the entry warm and what rebuilds it after an eviction, and that holds only while a
        // push-triggered workflow still calls it. Renaming or dropping the call fails silently.
        expect(seedWorkflow.on).toHaveProperty('workflow_call');
        expect(stickyWorkflow.on?.push?.branches).toContain('main');
        expect(Object.values(stickyWorkflow.jobs).map((job) => job.uses)).toContain(`./${SEED_WORKFLOW}`);
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

    it('warns on a miss, so a silently dead cache is not indistinguishable from a warm one', () => {
        for (const job of Object.values(perfWorkflow.jobs)) {
            const steps = job.steps ?? [];
            for (const [index, step] of steps.entries()) {
                if (!(typeof step.uses === 'string' && step.uses.startsWith('actions/cache')) || String(step.with?.path) !== '.jest-cache') {
                    continue;
                }
                // The restore has to be addressable before anything can read its outputs.
                expect(step.id).toBeString();
                const consumers = steps.slice(index + 1).filter((later) => JSON.stringify(later).includes(`steps.${String(step.id)}.outputs.cache-hit`));
                expect(consumers).not.toBeEmpty();
            }
        }
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
