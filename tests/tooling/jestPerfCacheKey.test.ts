import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * reassurePerformanceTests.yml restores two caches seedJestPerfCache.yml writes - the Jest transform
 * cache and main's measured Reassure baseline - and neither file references the other. Asserted from
 * outside both: keys that agree, or every restore is a permanent silent miss, and one runner class,
 * or the transform output is not interchangeable and durations are compared across hardware.
 * (test.yml caches the transform path under its own key and policy; out of scope here.)
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';
const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';

type Step = {uses?: string; with?: Record<string, unknown>};
// eslint-disable-next-line @typescript-eslint/naming-convention -- `runs-on` is the YAML key GitHub Actions defines, not a name this repo chooses
type Job = {'runs-on'?: string; steps?: Step[]};
type Workflow = {jobs: Record<string, Job>};

function readWorkflow(path: string): Workflow {
    // Bun.YAML rather than js-yaml: js-yaml is only a hoisted transitive at v3 while the repo declares
    // @types/js-yaml v4, so importing it would rest on an undeclared package with mismatched types.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Bun.YAML.parse returns unknown, and every field this test reads is optional, so a shape mismatch fails an assertion rather than throwing
    return Bun.YAML.parse(fs.readFileSync(path, 'utf8')) as Workflow;
}

function cacheSteps(workflow: Workflow, path: string): Step[] {
    return Object.values(workflow.jobs)
        .flatMap((job) => job.steps ?? [])
        .filter((step) => typeof step.uses === 'string' && step.uses.startsWith('actions/cache') && String(step.with?.path) === path);
}

/**
 * The commit expression is the one allowed difference: the seed writes the commit it just measured,
 * the perf job reads its merge ref's base parent. Normalized away so the rest still matches byte for
 * byte.
 */
function baselineKeyShape(step: Step): string {
    return String(step.with?.key).replace(/github\.sha|steps\.[\w-]+\.outputs\.[\w-]+/, '<commit>');
}

const perfWorkflow = readWorkflow(PERF_WORKFLOW);
const seedWorkflow = readWorkflow(SEED_WORKFLOW);
const allCacheSteps = [...cacheSteps(perfWorkflow, '.jest-cache'), ...cacheSteps(seedWorkflow, '.jest-cache')];
const allBaselineSteps = [...cacheSteps(perfWorkflow, '.reassure/baseline.perf'), ...cacheSteps(seedWorkflow, '.reassure/baseline.perf')];

describe('Reassure perf caches', () => {
    it('keys every .jest-cache step identically', () => {
        // Both measure jobs restore, and so does the seed job, which also saves.
        expect(allCacheSteps).toHaveLength(4);
        const keys = new Set(allCacheSteps.map((step) => String(step.with?.key)));
        expect([...keys]).toHaveLength(1);
    });

    it('keys every .reassure/baseline.perf step identically apart from the commit', () => {
        // The seed looks the entry up and saves it; baseline-perf-tests restores it.
        expect(allBaselineSteps).toHaveLength(3);
        const shapes = new Set(allBaselineSteps.map(baselineKeyShape));
        expect([...shapes]).toHaveLength(1);
        // Catches a key with no commit expression at all: three identical constants satisfy the
        // assertion above while pinning every PR to one stale baseline.
        expect([...shapes].at(0)).toContain('<commit>');
    });

    it('measures on the runner class the perf jobs are judged on', () => {
        const runners = new Set([...Object.values(seedWorkflow.jobs), ...Object.values(perfWorkflow.jobs)].map((job) => String(job['runs-on'])));
        expect([...runners]).toHaveLength(1);
    });
});
