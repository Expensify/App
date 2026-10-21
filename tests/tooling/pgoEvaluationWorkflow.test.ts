// cspell:ignore chrispader
import {describe, expect, it} from 'bun:test';

import {isRecord} from '@scripts/pgo/evaluationSchema';

import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const input: unknown = Bun.YAML.parse(readFileSync('.github/workflows/pgoEvaluation.yml', 'utf8'));
if (!isRecord(input) || !isRecord(input.jobs) || !isRecord(input.jobs.verify)) {
    throw new Error('Missing emulator verification workflow.');
}
const workflow = input;
const job = input.jobs.verify;

describe('PGO emulator workflow', () => {
    it.each([
        ['Expensify/App', 'refs/heads/@chrispader/perf/pgo-ci-verification', true],
        ['margelo/Expensify', 'refs/heads/@chrispader/perf/pgo-ci-verification', false],
        ['Expensify/App', 'refs/heads/main', false],
        ['Expensify/App', 'refs/pull/34/merge', false],
    ])('limits private dependency access for %s at %s', (repository, ref, expected) => {
        // Given the workflow's actual authorization expression.
        if (typeof job.if !== 'string') {
            throw new Error('Missing authorization condition.');
        }
        // When Actions evaluates a repository and branch.
        const result: unknown = runInNewContext(job.if, {github: {repository, ref}});
        // Then only the reviewed upstream preview branch receives credentials.
        expect(result).toBe(expected);
    });

    it('starts on branch copy without requiring a deployment or a default-branch merge', () => {
        // Given the verification workflow's event configuration.
        const events = workflow.on;
        // When its push trigger is inspected.
        if (!isRecord(events) || !isRecord(events.push)) {
            throw new Error('Missing push trigger.');
        }
        // Then copying the branch starts verification and no deployment starts it.
        expect(events.push.branches).toEqual(['@chrispader/perf/pgo-ci-verification']);
        expect(events.workflow_run).toBeUndefined();
        expect(events.pull_request_target).toBeUndefined();
        expect(events.workflow_dispatch).toBeDefined();
    });

    it.each(['both', 'android', 'ios'])('runs the requested hosted platform selection %s', (platform) => {
        // Given the actual platform matrix expression and hosted runner expression.
        if (!isRecord(job.strategy) || !isRecord(job.strategy.matrix) || typeof job.strategy.matrix.platform !== 'string' || typeof job['runs-on'] !== 'string') {
            throw new Error('Missing emulator matrix.');
        }
        const expression = (value: string) => value.slice(3, -2).trim();
        // When the selected platforms are expanded by Actions.
        const platforms: unknown = runInNewContext(expression(job.strategy.matrix.platform), {inputs: {platform}, fromJSON: JSON.parse});
        // Then neither platform requests a self-hosted physical runner.
        expect(platforms).toEqual(platform === 'both' ? ['android', 'ios'] : [platform]);
        expect(runInNewContext(expression(job['runs-on']), {matrix: {platform: 'android'}})).toBe('ubuntu-24.04');
        expect(runInNewContext(expression(job['runs-on']), {matrix: {platform: 'ios'}})).toBe('blacksmith-12vcpu-macos-latest');
    });

    it('uses only the existing checkout and SDK secrets and preserves failure artifacts', () => {
        // Given the complete published workflow.
        const text = readFileSync('.github/workflows/pgoEvaluation.yml', 'utf8');
        // When private configuration references are collected.
        const secrets = [...new Set(Array.from(text.matchAll(/secrets[.]([A-Z_]+)/g), (match) => match[1]))].sort();
        // Then account login, device IDs and signing secrets are unnecessary.
        expect(secrets).toEqual(['MAPBOX_SDK_DOWNLOAD_TOKEN', 'OS_BOTIFY_TOKEN']);
        expect(text).not.toContain('PGO_ANDROID_DEVICE_ID');
        expect(text).not.toContain('PGO_IOS_DEVICE_ID');
        expect(text).not.toContain('issues: write');
        if (!Array.isArray(job.steps)) {
            throw new Error('Missing verification steps.');
        }
        const upload: unknown = job.steps.find((step: unknown) => isRecord(step) && step.name === 'Upload verification profiles and report');
        expect(isRecord(upload) && upload.if).toBe('always()');
        expect(readFileSync('.github/workflows/deploy.yml', 'utf8')).not.toContain('pgoCandidate');
    });
});
