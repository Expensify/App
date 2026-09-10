import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * seedJestPerfCache.yml measures `main` once per push and stores `.reassure/baseline.perf` as a
 * cache entry keyed on the commit it was measured at. Nothing restores that entry yet - the perf
 * workflow still measures its own baseline - so what these tests protect is the entry being
 * written correctly and cheaply, before anything depends on it:
 *
 * 1. The key carries `github.sha` and nothing else. A push head is exactly what a PR's merge ref
 *    carries as its first parent, so this is the one expression a `pull_request.base.sha` lookup
 *    can ever hit. Any other key produces a permanent miss on the consumer side.
 * 2. No `restore-keys`. A prefix fallback here does not serve a stale entry, it serves a *different
 *    commit's measurement*, which is a wrong verdict rather than a slow one, on a check that gates
 *    render counts at COUNT_DEVIATION: 0.
 * 3. One measure feeds both entries, so the transform cache save has to be guarded on both lookups.
 *    On a re-run of an already-measured commit the measure is skipped, and an unguarded save would
 *    write a transform set this run never produced.
 */

const SEED_WORKFLOW = '.github/workflows/seedJestPerfCache.yml';

const BASELINE_PATH = '.reassure/baseline.perf';
const LOOKUP_ID = 'lookupBaseline';
const RESTORE_JEST_ID = 'restoreJestCache';
// eslint-disable-next-line no-template-curly-in-string -- this is a GitHub Actions expression read out of YAML, not a JS template literal
const BASELINE_KEY = "${{ format('{0}-{1}-reassure-baseline-{2}', runner.os, runner.arch, github.sha) }}";

type Step = {name?: string; id?: string; uses?: string; if?: string; run?: string; env?: Record<string, string>; with?: Record<string, unknown>};
type Job = {steps?: Step[]};
type Workflow = {jobs: Record<string, Job>};

function readWorkflow(path: string): Workflow {
    // Bun.YAML for the same reason jestPerfCacheKey.test.ts uses it: js-yaml is only present as a
    // hoisted transitive at a version the repo's types do not match.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Bun.YAML.parse returns unknown, and every field this test reads is optional, so a shape mismatch fails an assertion rather than throwing
    return Bun.YAML.parse(fs.readFileSync(path, 'utf8')) as Workflow;
}

const seedWorkflow = readWorkflow(SEED_WORKFLOW);
const seedSteps = Object.values(seedWorkflow.jobs).flatMap((job) => job.steps ?? []);
const baselineCacheSteps = seedSteps.filter((step) => typeof step.uses === 'string' && step.uses.startsWith('actions/cache') && String(step.with?.path) === BASELINE_PATH);

describe('Reassure baseline cache', () => {
    it('keys the baseline on the pushed commit alone', () => {
        expect(baselineCacheSteps).toHaveLength(2); // one lookup, one save
        for (const step of baselineCacheSteps) {
            expect(String(step.with?.key)).toBe(BASELINE_KEY);
        }
    });

    it('never falls back to a prefix key', () => {
        for (const step of baselineCacheSteps) {
            expect(step.with).not.toHaveProperty('restore-keys');
        }
    });

    it('measures once per commit, and skips the measure when the commit is already cached', () => {
        const measure = seedSteps.find((step) => String(step.run).includes('reassure --baseline'));
        expect(String(measure?.if)).toContain(`steps.${LOOKUP_ID}.outputs.cache-hit != 'true'`);
    });

    it('writes nothing when the measure did not run', () => {
        const save = baselineCacheSteps.find((step) => String(step.uses).startsWith('actions/cache/save@'));
        expect(String(save?.if)).toContain(`steps.${LOOKUP_ID}.outputs.cache-hit != 'true'`);

        const upload = seedSteps.find((step) => String(step.uses).startsWith('actions/upload-artifact@'));
        expect(String(upload?.if)).toContain(`steps.${LOOKUP_ID}.outputs.cache-hit != 'true'`);
        expect(String(upload?.with?.path)).toBe(BASELINE_PATH);
        // .reassure is a dotfile directory, so the upload drops it silently without this.
        expect(upload?.with?.['include-hidden-files']).toBe(true);
    });

    it('keeps the seed from saving a transform set no Jest run wrote', () => {
        // The seed measures once and feeds two entries. If a re-run finds the baseline already
        // present it skips the measurement, and then the transform save has nothing behind it.
        const transformSave = seedSteps.find((step) => String(step.uses).startsWith('actions/cache/save@') && String(step.with?.path) === '.jest-cache');
        expect(String(transformSave?.if)).toContain(`steps.${RESTORE_JEST_ID}.outputs.cache-hit != 'true'`);
        expect(String(transformSave?.if)).toContain(`steps.${LOOKUP_ID}.outputs.cache-hit != 'true'`);
    });

    it('restores the transform cache rather than looking it up, so the measure it now runs every push is warm', () => {
        const restore = seedSteps.find((step) => step.id === RESTORE_JEST_ID);
        expect(restore?.uses).toStartWith('actions/cache/restore@');
        expect(restore?.with).not.toHaveProperty('lookup-only');
    });
});
