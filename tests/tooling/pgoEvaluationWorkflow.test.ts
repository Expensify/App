// cspell:ignore chrispader
/* eslint-disable @typescript-eslint/naming-convention -- Fixtures reproduce GitHub's event schema. */
import {describe, expect, it} from 'bun:test';

import {isRecord} from '@scripts/pgo/evaluationSchema';

import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

describe('PGO evaluation workflow contract', () => {
    it.each([
        ['Expensify/App', '@chrispader/perf/pgo-ci-verification', true],
        ['margelo/Expensify', '@chrispader/perf/pgo-ci-verification', false],
        ['Expensify/App', 'other-preview', false],
    ])('gates physical-device access for %s on %s', (repository, branch, eligible) => {
        // Given the actual prepare-job condition and a pull-request head.
        const job = workflowJob('.github/workflows/pgoEvaluation.yml', 'prepare');
        if (typeof job.if !== 'string') {
            throw new Error('Missing preview authorization condition.');
        }
        const github = {repository: 'Expensify/App', event_name: 'pull_request', event: {pull_request: {head: {repo: {full_name: repository}, ref: branch}}}};
        // When the condition runs with the event metadata available to Actions.
        const actual: unknown = runInNewContext(job.if, {github});
        // Then only the named upstream branch can request credential devices.
        expect(actual).toBe(eligible);
    });

    it('keeps producer metadata failures outside canonical deployment eligibility', () => {
        // Given the ordinary deploy workflow and its evaluation metadata additions.
        const job = workflowJob('.github/workflows/deploy.yml', 'prep');
        // When both metadata steps are inspected.
        const capture = workflowStep(job, 'Record native evaluation candidate');
        const upload = workflowStep(job, 'Upload native evaluation candidate metadata');
        // Then either failure is non-blocking and reruns retain separate attempt artifacts.
        expect(capture?.['continue-on-error']).toBe(true);
        expect(upload?.['continue-on-error']).toBe(true);
        expect(isRecord(upload.with) && upload.with.name).toBe(expression('pgo-native-candidate-', 'github.run_attempt'));
    });

    it('schedules eligible platforms only and masks private device configuration', () => {
        // Given the standalone evaluation workflow.
        const job = workflowJob('.github/workflows/pgoEvaluation.yml', 'evaluate');
        // When runner selection, permissions and its execution environment are read.
        const environment = workflowStep(job, 'Evaluate pinned candidate on its physical device').env;
        expect(isRecord(environment)).toBe(true);
        if (!isRecord(environment) || !isRecord(job.strategy) || !isRecord(job.strategy.matrix) || !isRecord(job.permissions) || !isRecord(job.concurrency)) {
            throw new Error('Missing workflow job contract.');
        }
        // Then an ineligible platform never requests a device runner and private paths are masked.
        expect(job.strategy.matrix.platform).toContain('fromJSON(needs.prepare.outputs.platform-matrix)');
        expect(job.permissions.issues).toBeUndefined();
        expect(environment.PGO_ANDROID_DEVICE_ID).toBe(expression('', 'secrets.PGO_ANDROID_DEVICE_ID'));
        expect(environment.PGO_IOS_FIXTURE_PATH).toBe(expression('', 'secrets.PGO_IOS_FIXTURE_PATH'));
        expect(environment.PGO_IOS_ENVFILE).toBe(expression('', 'secrets.PGO_IOS_ENVFILE'));
        expect(environment.PGO_ANDROID_KEYSTORE_PATH).toBe(expression('', 'secrets.PGO_ANDROID_KEYSTORE_PATH'));
        expect(environment.PGO_ANDROID_KEYSTORE_PASSWORD).toBe(expression('', 'secrets.PGO_ANDROID_KEYSTORE_PASSWORD'));
        const checkout = workflowStep(job, 'Checkout pinned native candidate');
        expect(isRecord(checkout.with) && checkout.with.token).toBe(expression('', 'secrets.OS_BOTIFY_TOKEN'));
        expect(job.concurrency.queue).toBe('max');
        const report = workflowJob('.github/workflows/pgoEvaluation.yml', 'report');
        if (!isRecord(report.concurrency)) {
            throw new Error('Missing report concurrency.');
        }
        expect(report.concurrency.group).toContain('needs.prepare.outputs.app-sha');
        expect(report.concurrency.queue).toBe('max');
    });

    it.each([
        ['9.4.94-0-staging', 1],
        ['9.4.94-01-staging', 0],
    ])('posts only to the exact historical checklist tag %s', async (tag, expectedPosts) => {
        // Given the actual YAML posting script and a closed historical checklist.
        const step = workflowStep(workflowJob('.github/workflows/pgoEvaluation.yml', 'report'), 'Attach report to its matching deploy checklist');
        const script = isRecord(step.with) ? step.with.script : undefined;
        expect(script).toBeDefined();
        let posts = 0;
        const issue = {state: 'closed', labels: [{name: 'StagingDeployCash'}], body: `**Release Version:** \`${tag}\``};
        const github = {
            rest: {
                issues: {
                    get: async () => ({data: issue}),
                    listComments: async () => [],
                    createComment: async () => {
                        posts += 1;
                    },
                    updateComment: async () => {
                        posts += 1;
                    },
                },
            },
            paginate: async () => [],
        };
        const requireFixture = () => ({readFileSync: () => JSON.stringify({targetIssueNumber: 42, marker: '<!--pgo-candidate-->', body: 'Public numeric report', version: '9.4.94-0'})});
        // When the trusted inline script rechecks the live checklist before posting.
        // This executes only the repository's static workflow script with mocked GitHub and filesystem inputs.
        if (typeof script !== 'string') {
            throw new Error('Missing posting script.');
        }
        const completion: unknown = runInNewContext(`(async () => {${script}})()`, {
            require: requireFixture,
            core: {notice: () => undefined},
            github,
            context: {repo: {owner: 'Expensify', repo: 'App'}},
        });
        await completion;
        // Then a closed matching issue works while a similar version cannot receive the report.
        expect(posts).toBe(expectedPosts);
    });
});

function workflowJob(path: string, name: string): Record<string, unknown> {
    const input: unknown = Bun.YAML.parse(readFileSync(path, 'utf8'));
    if (!isRecord(input) || !isRecord(input.jobs) || !isRecord(input.jobs[name])) {
        throw new Error('Missing workflow job.');
    }
    return input.jobs[name];
}
function workflowStep(job: Record<string, unknown>, name: string): Record<string, unknown> {
    if (!Array.isArray(job.steps)) {
        throw new Error('Missing workflow steps.');
    }
    const step: unknown = job.steps.find((input: unknown) => isRecord(input) && input.name === name);
    if (!isRecord(step)) {
        throw new Error('Missing workflow step.');
    }
    return step;
}
function expression(prefix: string, content: string): string {
    return `${prefix}${String.fromCharCode(36)}{{ ${content} }}`;
}
