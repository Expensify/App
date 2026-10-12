// cspell:ignore chrispader
/* eslint-disable @typescript-eslint/naming-convention -- Fixtures reproduce the GitHub API snake_case schema. */
import {describe, expect, it} from 'bun:test';

import {execFileSync} from 'node:child_process';

import type {GitHubRead} from '../../scripts/pgo/candidateResolve';

import {assertProducerEventAttempt, checklistMatches, matchingChecklist, resolvePreview, resolveProducer, selectProducerArtifact} from '../../scripts/pgo/candidateResolve';
import {captureCandidate} from '../../scripts/pgo/pgoCandidate';

const appSha = 'a'.repeat(40);
const mobileSha = 'b'.repeat(40);
const toolingSha = 'c'.repeat(40);
const candidate = {appSha, mobileSha, version: '9.4.94-0', environment: 'staging'};
const metadata = {schema: 1, repository: 'Expensify/App', runID: 10, runAttempt: 2, nativeEligible: true, candidate};
const run = {
    id: 10,
    run_attempt: 2,
    repository: {full_name: 'Expensify/App'},
    name: 'Deploy code to staging or production',
    path: '.github/workflows/deploy.yml',
    status: 'completed',
    conclusion: 'failure',
    event: 'workflow_dispatch',
    head_branch: 'staging',
    head_sha: toolingSha,
};
const jobs = {
    jobs: [
        {name: 'Build Android HybridApp / Build Android app', conclusion: 'success'},
        {name: 'Build iOS HybridApp / Build iOS HybridApp', conclusion: 'failure'},
    ],
};
const read: GitHubRead = async (path) => {
    if (path.includes('/git/trees/')) {
        return {tree: [{path: 'Mobile-Expensify', mode: '160000', sha: mobileSha}]};
    }
    if (path.includes('/contents/package.json')) {
        return {content: Buffer.from(JSON.stringify({version: candidate.version})).toString('base64')};
    }
    if (path.includes('/compare/')) {
        return {status: 'ahead'};
    }
    if (path.includes('/pulls/')) {
        return {head: {sha: appSha}, state: 'open'};
    }
    if (path.includes('/issues?')) {
        return [{number: 42, body: '**Release Version:** `9.4.94-0-staging`', labels: [{name: 'StagingDeployCash'}]}];
    }
    throw new Error('Unexpected metadata request.');
};

function preview(repo = 'Expensify/App', sha = appSha) {
    return {number: 3, pull_request: {head: {sha, ref: '@chrispader/perf/pgo-ci-evaluation', repo: {full_name: repo}}, base: {repo: {full_name: 'Expensify/App'}}}};
}

describe('PGO immutable candidate resolution', () => {
    it('uses actual producer metadata rather than dispatch head and preserves independent platform success', async () => {
        // Given a completed deployment with web/iOS failure and a different dispatch head.
        // When the exact producer metadata and nested native jobs are resolved.
        const plan = await resolveProducer(metadata, run, jobs, toolingSha, read);
        // Then the successful Android build alone is eligible at the actual immutable source.
        expect(plan.platforms).toEqual(['android']);
        expect(plan.candidate.appSha).toBe(appSha);
        expect(plan.candidate.appSha).not.toBe(run.head_sha);
        expect(plan.checklistIssueNumber).toBe(42);
    });

    it('rejects missing metadata, retry drift, wrong environment and candidate gitlink drift', async () => {
        // Given metadata tied to one repository, run attempt and native checkout.
        const changedRead: GitHubRead = async (path) => (path.includes('/git/trees/') ? {tree: [{path: 'Mobile-Expensify', mode: '160000', sha: 'd'.repeat(40)}]} : read(path));
        // When a required identity differs or metadata is absent.
        // Then no credential-device plan may be created.
        await expect(resolveProducer(undefined, run, jobs, toolingSha, read)).rejects.toThrow();
        await expect(resolveProducer({...metadata, runAttempt: 1}, run, jobs, toolingSha, read)).rejects.toThrow();
        await expect(resolveProducer(metadata, {...run, head_branch: 'feature'}, jobs, toolingSha, read)).rejects.toThrow();
        await expect(resolveProducer(metadata, run, jobs, toolingSha, changedRead)).rejects.toThrow();
        await expect(resolveProducer({...metadata, runID: '10'}, run, jobs, toolingSha, read)).rejects.toThrow();
        await expect(resolveProducer({...metadata, repository: 'fork/App'}, run, jobs, toolingSha, read)).rejects.toThrow();
    });

    it('does not confuse unrelated successful jobs or non-native production promotions with eligible builds', async () => {
        // Given a spoofed job suffix and a promotion that reuses prior native binaries.
        // When platform eligibility is resolved.
        const unrelated = await resolveProducer(metadata, run, {jobs: [{name: 'Unrelated / Build Android app', conclusion: 'success'}]}, toolingSha, read);
        const reused = await resolveProducer({...metadata, nativeEligible: false}, run, jobs, toolingSha, read);
        // Then neither can initiate evaluation on credential devices.
        expect(unrelated.platforms).toEqual([]);
        expect(reused.platforms).toEqual([]);
    });

    it('requires an open exact same-repository preview head and rejects forks or stale heads', async () => {
        // Given the one approved preview branch in Expensify/App.
        // When a fork, stale revision or closed pull request is supplied.
        const plan = await resolvePreview(preview(), toolingSha, read);
        // Then only the current trusted head can evaluate; normal forks receive no device authorization.
        expect(plan.platforms).toEqual(['android', 'ios']);
        await expect(resolvePreview(preview('fork/App'), toolingSha, read)).rejects.toThrow();
        await expect(resolvePreview(preview('Expensify/App', toolingSha), toolingSha, read)).rejects.toThrow();
        await expect(resolvePreview(preview(), toolingSha, async (path) => (path.includes('/pulls/') ? {head: {sha: appSha}, state: 'closed'} : read(path)))).rejects.toThrow();
    });

    it('matches historical release headers exactly instead of a latest issue or version substring', () => {
        // Given one labelled historical checklist and unrelated version text.
        const issue = {number: 42, body: '**Release Version:** `9.4.94-0-staging`', labels: [{name: 'StagingDeployCash'}]};
        // When the immutable candidate version is compared.
        // Then only its exact labelled release header qualifies.
        expect(checklistMatches(issue, '9.4.94-0')).toBe(true);
        expect(checklistMatches(issue, '9.4.94')).toBe(false);
        expect(checklistMatches({...issue, body: 'A link mentions 9.4.94-0'}, '9.4.94-0')).toBe(false);
        expect(checklistMatches({...issue, labels: []}, '9.4.94-0')).toBe(false);
    });

    it('paginates historical checklists and rejects ambiguous exact versions', async () => {
        // Given more than one page of historical deployment checklists.
        const otherIssues = Array.from({length: 100}, () => ({body: '**Release Version:** `1.0.0-staging`', labels: [{name: 'StagingDeployCash'}], number: 1}));
        const historical = {number: 42, body: '**Release Version:** `9.4.94-0-staging`', labels: [{name: 'StagingDeployCash'}]};
        // When the matching older version is on the second page.
        const found = await matchingChecklist('9.4.94-0', async (path) => (path.endsWith('page=1') ? otherIssues : [historical]));
        // Then the exact historical issue is used, and duplicate matches fail closed.
        expect(found).toBe(42);
        await expect(matchingChecklist('9.4.94-0', async () => [historical, {...historical, number: 43}])).rejects.toThrow();
    });

    it('rejects a queued producer event superseded by a newer attempt', () => {
        // Given a workflow event emitted before its producer was rerun.
        const oldEvent = {workflow_run: {id: 10, run_attempt: 1}};
        // When current metadata refers to completed attempt two.
        // Then the queued event cannot silently evaluate the newer producer.
        expect(() => assertProducerEventAttempt(oldEvent, run)).toThrow();
        expect(() => assertProducerEventAttempt({workflow_run: {id: 10, run_attempt: 2}}, run)).not.toThrow();
    });

    it('selects only metadata from the current immutable producer attempt', () => {
        // Given retained artifacts from two attempts of the same workflow run.
        const old = {id: 1, name: 'pgo-native-candidate-1', expired: false, workflow_run: {id: 10}};
        const current = {id: 2, name: 'pgo-native-candidate-2', expired: false, workflow_run: {id: 10}};
        // When manual evaluation resolves the latest completed attempt.
        const selected = selectProducerArtifact({total_count: 2, artifacts: [old, current]}, 10, 2);
        // Then stale or cross-run metadata cannot substitute for its exact artifact.
        expect(selected.id).toBe(2);
        expect(() => selectProducerArtifact({total_count: 1, artifacts: [old]}, 10, 2)).toThrow();
        expect(() => selectProducerArtifact({total_count: 1, artifacts: [{...current, workflow_run: {id: 11}}]}, 10, 2)).toThrow();
    });

    it('captures the actual local deployment HEAD and gitlink even when the workflow context SHA differs', () => {
        // Given a checked-out deployment and an unrelated workflow-context revision.
        const previous = {...process.env};
        Object.assign(process.env, {GITHUB_REPOSITORY: 'Expensify/App', GITHUB_RUN_ID: '10', GITHUB_RUN_ATTEMPT: '2', GITHUB_SHA: appSha});
        try {
            // When the producer captures its actual repository state.
            const actualHead = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
            const actualLink = execFileSync('git', ['rev-parse', 'HEAD:Mobile-Expensify'], {encoding: 'utf8'}).trim();
            const readSource = (_command: string, args: string[]) => (args.includes('-C') || args.includes('HEAD:Mobile-Expensify') ? actualLink : actualHead);
            const captured = captureCandidate('staging', true, readSource);
            expect(() => captureCandidate('staging', true, (_command, args) => (args.includes('-C') ? appSha : readSource(_command, args)))).toThrow();
            // Then HEAD and the committed native gitlink are bound independently of GITHUB_SHA.
            expect(captured.candidate.appSha).toBe(execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim());
            expect(captured.candidate.mobileSha).toBe(execFileSync('git', ['rev-parse', 'HEAD:Mobile-Expensify'], {encoding: 'utf8'}).trim());
            expect(captured.runAttempt).toBe(2);
        } finally {
            process.env = previous;
        }
    });
});
