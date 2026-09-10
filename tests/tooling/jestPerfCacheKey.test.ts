import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * reassurePerformanceTests.yml restores a Jest transform cache that seedJestPerfCache.yml writes.
 * Three agreements between those files keep that safe and effective, and each one breaks silently
 * rather than failing a check, so these tests are the enforcement:
 *
 * 1. Every copy of the cache key is byte-identical - a restore keyed differently from the save is a
 *    permanent miss and the perf jobs just go cold again. (test.yml caches the same .jest-cache
 *    path under its own key and policy; deliberate, and out of scope here.)
 * 2. No `restore-keys` anywhere: babel-jest does not hash plugin versions into an entry's name, so
 *    a prefix fallback could reuse output built by a different babel-plugin-react-compiler, and the
 *    perf workflow gates render counts at COUNT_DEVIATION: 0.
 * 3. A push-triggered workflow calls the seed. With no paths filter and no schedule, probing every
 *    push to main is both how the entry stays warm and how it recovers from an eviction.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';
const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';
const SEED_CACHE_WORKFLOW = '.github/workflows/seedCache.yml';

type Step = {uses?: string; with?: Record<string, unknown>};
type Job = {uses?: string; steps?: Step[]};
type Workflow = {
    on?: Record<string, {branches?: string[]} | null>;
    jobs: Record<string, Job>;
};

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

const seedWorkflow = readWorkflow(SEED_WORKFLOW);
const seedCacheWorkflow = readWorkflow(SEED_CACHE_WORKFLOW);
const allCacheSteps = [...cacheSteps(readWorkflow(PERF_WORKFLOW)), ...cacheSteps(seedWorkflow)];

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
        expect(seedWorkflow.on).toHaveProperty('workflow_call');
        expect(seedCacheWorkflow.on?.push?.branches).toContain('main');
        expect(Object.values(seedCacheWorkflow.jobs).map((job) => job.uses)).toContain(`./${SEED_WORKFLOW}`);
    });
});
