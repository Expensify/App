import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * reassurePerformanceTests.yml restores a Jest transform cache that seedJestPerfCache.yml writes.
 * Two agreements between those files have to hold, and neither file references the other, so
 * reading either one alone cannot tell you whether it still does:
 *
 * 1. Every copy of the cache key is byte-identical - a restore keyed differently from the save is a
 *    permanent miss and the perf jobs just go cold again. (test.yml caches the same .jest-cache
 *    path under its own key and policy; deliberate, and out of scope here.)
 * 2. Both workflows run on one runner class, so the transform output is interchangeable between
 *    them. The same holds for the baseline the seed measures, once the perf workflow reads it
 *    instead of measuring its own: that key hashes only runner.os and runner.arch, neither of which
 *    moves with a vcpu count, so a split class would not rotate the key - it would compare
 *    durations across hardware on a check gated at DURATION_DEVIATION_PERCENTAGE: 20.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';
const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';

type Step = {uses?: string; with?: Record<string, unknown>};
// eslint-disable-next-line @typescript-eslint/naming-convention -- `runs-on` is the YAML key GitHub Actions defines, not a name this repo chooses
type Job = {'runs-on'?: string; steps?: Step[]};
type Workflow = {jobs: Record<string, Job>};

function readWorkflow(path: string): Workflow {
    // Bun.YAML rather than js-yaml: js-yaml is only present as a hoisted transitive at v3 while the
    // repo declares @types/js-yaml v4, so importing it would rest on an undeclared package whose
    // types do not match its runtime.
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
        // Both measure jobs restore, and so does the seed job, which also saves.
        expect(allCacheSteps).toHaveLength(4);
        const keys = new Set(allCacheSteps.map((step) => String(step.with?.key)));
        expect([...keys]).toHaveLength(1);
    });

    it('measures on the runner class the perf jobs are judged on', () => {
        const runners = new Set([...Object.values(seedWorkflow.jobs), ...Object.values(perfWorkflow.jobs)].map((job) => String(job['runs-on'])));
        expect([...runners]).toHaveLength(1);
    });
});
