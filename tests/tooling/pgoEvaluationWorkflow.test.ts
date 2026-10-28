// cspell:ignore chrispader
import {describe, expect, it} from 'bun:test';

import {isRecord} from '@scripts/pgo/evaluationSchema';

import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const BRANCH = '@chrispader/perf/pgo-ci-app-evaluation';
const text = readFileSync('.github/workflows/pgoEvaluation.yml', 'utf8');
const input: unknown = Bun.YAML.parse(text);
if (!isRecord(input) || !isRecord(input.jobs) || !isRecord(input.jobs.train) || !isRecord(input.jobs.benchmark) || !isRecord(input.jobs.report)) {
    throw new Error('Missing emulator evaluation jobs.');
}
const workflow = input;
const jobs = {train: input.jobs.train, benchmark: input.jobs.benchmark, report: input.jobs.report};

function expression(value: unknown): string {
    if (typeof value !== 'string') {
        throw new Error('Missing workflow expression.');
    }
    return value.startsWith('${{') ? value.slice(3, -2).trim() : value;
}

function steps(job: Record<string, unknown>): Array<Record<string, unknown>> {
    if (!Array.isArray(job.steps)) {
        throw new Error('Missing job steps.');
    }
    return job.steps.filter(isRecord);
}

describe('PGO emulator evaluation workflow', () => {
    it.each([
        ['Expensify/App', `refs/heads/${BRANCH}`, true],
        ['margelo/Expensify', `refs/heads/${BRANCH}`, false],
        ['Expensify/App', 'refs/heads/@chrispader/perf/pgo-ci-verification', false],
        ['Expensify/App', 'refs/heads/main', false],
        ['Expensify/App', 'refs/pull/34/merge', false],
    ])('limits private dependency and test account access for %s at %s', (repository, ref, expected) => {
        // Given each job's actual authorization expression.
        for (const job of Object.values(jobs)) {
            // When Actions evaluates a repository and branch.
            const result: unknown = runInNewContext(expression(job.if), {github: {repository, ref}, cancelled: () => false});
            // Then only the reviewed upstream preview branch receives credentials.
            expect(result).toBe(expected);
        }
    });

    it('starts on branch copy without requiring a deployment or a default-branch merge', () => {
        // Given the evaluation workflow's event configuration.
        const events = workflow.on;
        // When its push trigger is inspected.
        if (!isRecord(events) || !isRecord(events.push)) {
            throw new Error('Missing push trigger.');
        }
        // Then copying the branch starts the evaluation and no deployment starts it.
        expect(events.push.branches).toEqual([BRANCH]);
        expect(events.workflow_run).toBeUndefined();
        expect(events.pull_request_target).toBeUndefined();
        expect(events.workflow_dispatch).toBeDefined();
    });

    it.each(['both', 'android', 'ios'])('trains and benchmarks both orders on hosted runners for the platform selection %s', (platform) => {
        // Given the training and benchmark matrices.
        for (const job of [jobs.train, jobs.benchmark]) {
            if (!isRecord(job.strategy) || !isRecord(job.strategy.matrix)) {
                throw new Error('Missing emulator matrix.');
            }
            // When Actions expands the selected platforms and runner labels.
            const platforms: unknown = runInNewContext(expression(job.strategy.matrix.platform), {inputs: {platform}, fromJSON: JSON.parse});
            // Then neither platform requests a self-hosted physical runner.
            expect(platforms).toEqual(platform === 'both' ? ['android', 'ios'] : [platform]);
            expect(runInNewContext(expression(job['runs-on']), {matrix: {platform: 'android'}})).toBe('ubuntu-24.04');
            expect(runInNewContext(expression(job['runs-on']), {matrix: {platform: 'ios'}})).toBe('blacksmith-12vcpu-macos-latest');
        }
        // Then each benchmark order runs in its own job, so neither order shares the six-hour job limit with the other.
        expect(isRecord(jobs.benchmark.strategy) && isRecord(jobs.benchmark.strategy.matrix) && jobs.benchmark.strategy.matrix.order).toEqual(['release-first', 'optimized-first']);
        expect(jobs.benchmark.needs).toBe('train');
        expect(jobs.report.needs).toEqual(['train', 'benchmark']);
    });

    it('uses only the checkout, SDK and test account secrets and publishes only public results', () => {
        // Given the complete published workflow.
        // When private configuration references are collected.
        const secrets = [...new Set(Array.from(text.matchAll(/secrets[.]([A-Z_]+)/g), (match) => match[1]))].sort();
        // Then device IDs, signing secrets and issue access stay unnecessary, and the report job receives no secrets.
        expect(secrets).toEqual([
            'EXPENSIFY_PARTNER_NAME',
            'EXPENSIFY_PARTNER_PASSWORD',
            'EXPENSIFY_PARTNER_PASSWORD_EMAIL',
            'EXPENSIFY_PARTNER_USER_ID',
            'EXPENSIFY_PARTNER_USER_SECRET',
            'MAPBOX_SDK_DOWNLOAD_TOKEN',
            'OS_BOTIFY_TOKEN',
            'PGO_JOURNEY_FIXTURE',
        ]);
        expect(text).not.toContain('PGO_ANDROID_DEVICE_ID');
        expect(text).not.toContain('PGO_IOS_DEVICE_ID');
        expect(text).not.toContain('issues: write');
        expect(JSON.stringify(jobs.report)).not.toContain('secrets.');
        // Then the fixture stays outside every uploaded directory.
        const uploads = Object.values(jobs).flatMap((job) => steps(job).filter((step) => String(step.uses).startsWith('actions/upload-artifact@')));
        expect(text).toContain('fixture="$RUNNER_TEMP/pgo-journey-fixture.json"');
        for (const upload of uploads) {
            expect(isRecord(upload.with) && String(upload.with.path)).toMatch(/^(\.pgo\/ci\/|pgo-report$)/);
        }
        expect(readFileSync('.github/workflows/deploy.yml', 'utf8')).not.toContain('pgoCandidate');
    });

    it('keeps failure results while passing apps to benchmarks only after a complete training job', () => {
        // Given the upload steps of the training and benchmark jobs.
        const step = (job: Record<string, unknown>, name: string) => steps(job).find((candidate) => candidate.name === name);
        // When a job fails part way.
        // Then its categorical result still uploads for the report, and an incomplete training job never hands apps to the benchmarks.
        expect(step(jobs.train, 'Upload the training result and profile')?.if).toBe('always()');
        expect(step(jobs.benchmark, 'Upload the benchmark result')?.if).toBe('always()');
        expect(step(jobs.train, 'Upload the release and optimized apps for benchmarking')?.if).toBeUndefined();
    });
});
