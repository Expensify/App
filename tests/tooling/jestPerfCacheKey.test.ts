import {describe, expect, it} from 'bun:test';

import fs from 'fs';
import path from 'path';

/**
 * reassurePerformanceTests.yml restores two caches seedJestPerfCache.yml writes - the Jest transform
 * cache and main's measured Reassure baseline - and neither file references the other. Asserted from
 * outside both: keys that agree, or every restore is a permanent silent miss, and one runner class,
 * or the transform output is not interchangeable and durations are compared across hardware.
 * (test.yml caches the transform path under its own key and policy; out of scope here.)
 *
 * Both also split the suite into the shards named in `strategy.matrix.shard`, one `REASSURE_SHARD_*`
 * pattern each, and validate-perf-tests merges the slices. The split has to agree across the two
 * files and across every measuring job, or a baseline slice is compared against a differently cut
 * branch slice, which compare() reports only as Added/Removed scenarios that nothing gates.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';
const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';

type Step = {uses?: string; run?: string; with?: Record<string, unknown>};
// eslint-disable-next-line @typescript-eslint/naming-convention -- `runs-on` is the YAML key GitHub Actions defines, not a name this repo chooses
type Job = {'runs-on'?: string; strategy?: {matrix?: {shard?: string[]}}; steps?: Step[]};
type Workflow = {env?: Record<string, string>; jobs: Record<string, Job>};

function readWorkflow(file: string): Workflow {
    // Bun.YAML rather than js-yaml: js-yaml is only a hoisted transitive at v3 while the repo declares
    // @types/js-yaml v4, so importing it would rest on an undeclared package with mismatched types.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Bun.YAML.parse returns unknown, and every field this test reads is optional, so a shape mismatch fails an assertion rather than throwing
    return Bun.YAML.parse(fs.readFileSync(file, 'utf8')) as Workflow;
}

function cacheSteps(workflow: Workflow, cachePath: string): Step[] {
    return Object.values(workflow.jobs)
        .flatMap((job) => job.steps ?? [])
        .filter((step) => typeof step.uses === 'string' && step.uses.startsWith('actions/cache') && String(step.with?.path) === cachePath);
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
const allJobs = [...Object.values(seedWorkflow.jobs), ...Object.values(perfWorkflow.jobs)];
const shards = perfWorkflow.jobs['baseline-perf-tests']?.strategy?.matrix?.shard ?? null;

function shardPatterns(workflow: Workflow): Record<string, string> {
    return Object.fromEntries(Object.entries(workflow.env ?? {}).filter(([name]) => name.startsWith('REASSURE_SHARD_')));
}
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

    it('defines the same shard patterns in both workflows', () => {
        // The seed writes a slice under one pattern and baseline-perf-tests restores it by shard name only.
        expect(Object.keys(shardPatterns(perfWorkflow)).length).toBeGreaterThan(0);
        expect(shardPatterns(seedWorkflow)).toEqual(shardPatterns(perfWorkflow));
    });

    it('shards every job that runs reassure with the same matrix, one REASSURE_SHARD_* pattern per entry', () => {
        // A measuring job without the matrix reads `matrix.shard` as empty, so its PATTERN ternary falls
        // through to the complement and that side never measures the carved-out files. The matrix picks
        // the pattern by shard name, and the merge step counts REASSURE_SHARD_* variables to know how
        // many shard artifacts to expect.
        const measuringJobs = allJobs.filter((job) => (job.steps ?? []).some((step) => step.run?.includes('npx reassure')));
        expect(measuringJobs).toHaveLength(3);
        const matrices = new Set(measuringJobs.map((job) => JSON.stringify(job.strategy?.matrix?.shard ?? null)));
        expect([...matrices]).toHaveLength(1);
        expect(shards).not.toBeNull();
        const expectedNames = (shards ?? []).map((shard) => `REASSURE_SHARD_${shard.toUpperCase().replaceAll('-', '_')}`).sort();
        expect(Object.keys(shardPatterns(perfWorkflow)).sort()).toEqual(expectedNames);
    });

    it('puts every perf test file in exactly one shard', () => {
        // Jest tests each pattern against the absolute test path, case-insensitively. A file in no shard is
        // never measured; a file in two is measured twice and the merge step fails on the duplicates. A shard
        // with no file, such as one keyed to a file that has since been renamed, fails every PR's measure job
        // with "No tests found", including PRs that touch nothing near it.
        const patterns = Object.entries(shardPatterns(perfWorkflow)).map(([name, pattern]) => [name, new RegExp(pattern, 'i')] as const);
        const perfTestFiles = [...new Bun.Glob('{src,tests}/**/*.{perf,perf-test}.{js,jsx,ts,tsx}').scanSync('.')].map((file) => path.resolve(file));
        expect(perfTestFiles.length).toBeGreaterThan(1);
        const filesPerShard = Object.fromEntries(patterns.map(([name, regex]) => [name, perfTestFiles.filter((file) => regex.test(file))]));
        for (const file of perfTestFiles) {
            expect(patterns.filter(([, regex]) => regex.test(file)).map(([name]) => name)).toHaveLength(1);
        }
        for (const [name, files] of Object.entries(filesPerShard)) {
            expect(files, `${name} matches no perf test file`).not.toHaveLength(0);
        }
    });

    it('measures on the runner class the perf jobs are judged on', () => {
        const runners = new Set([...Object.values(seedWorkflow.jobs), ...Object.values(perfWorkflow.jobs)].map((job) => String(job['runs-on'])));
        expect([...runners]).toHaveLength(1);
    });
});
