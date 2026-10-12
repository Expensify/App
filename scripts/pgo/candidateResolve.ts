// cspell:ignore chrispader
/** Resolve immutable trusted candidates; no candidate code runs on the hosted resolver. */
import type {EvaluationPlan, EvaluationPlatform} from './evaluationSchema';

import {isGitID, isRecord, parseCandidate} from './evaluationSchema';

type GitHubRead = (path: string) => Promise<unknown>;
const repository = 'Expensify/App';
const previewBranch = '@chrispader/perf/pgo-ci-evaluation';
const producerName = 'Deploy code to staging or production';

async function resolveProducer(metadata: unknown, run: unknown, jobs: unknown, toolingSha: string, read: GitHubRead, platform?: EvaluationPlatform): Promise<EvaluationPlan> {
    if (
        !isRecord(metadata) ||
        metadata.schema !== 1 ||
        metadata.repository !== repository ||
        !isRecord(run) ||
        run.name !== producerName ||
        run.path !== '.github/workflows/deploy.yml' ||
        run.status !== 'completed' ||
        !isRecord(run.repository) ||
        run.repository.full_name !== repository ||
        !isRecord(jobs) ||
        !Array.isArray(jobs.jobs) ||
        !isGitID(toolingSha)
    ) {
        throw new Error('Untrusted or incomplete producer run.');
    }
    if (
        !validID(metadata.runID) ||
        !validID(metadata.runAttempt) ||
        !validID(run.id) ||
        !validID(run.run_attempt) ||
        !['staging', 'production'].includes(String(run.head_branch)) ||
        !['push', 'workflow_dispatch'].includes(String(run.event)) ||
        metadata.runID !== run.id ||
        metadata.runAttempt !== run.run_attempt ||
        typeof metadata.nativeEligible !== 'boolean'
    ) {
        throw new Error('Producer metadata does not match its immutable run attempt.');
    }
    const candidate = parseCandidate(metadata.candidate);
    if (candidate.environment === 'preview') {
        throw new Error('Producer environment must be staging or production.');
    }
    await verifyRepositoryCandidate(candidate.appSha, candidate.mobileSha, candidate.version, read);
    const comparison = await read(`/repos/${repository}/compare/${candidate.appSha}...${candidate.environment}`);
    if (!isRecord(comparison) || !['ahead', 'identical'].includes(String(comparison.status))) {
        throw new Error('Producer candidate is not an ancestor of its environment.');
    }
    const nativeJobs = jobs.jobs;
    const platforms: EvaluationPlatform[] = ['android', 'ios'].filter((value): value is EvaluationPlatform => {
        if (!metadata.nativeEligible || (platform && value !== platform)) {
            return false;
        }
        const names = value === 'android' ? ['Build Android HybridApp', 'Build Android HybridApp / Build Android app'] : ['Build iOS HybridApp', 'Build iOS HybridApp / Build iOS HybridApp'];
        return nativeJobs.some((job: unknown) => isRecord(job) && names.includes(String(job.name)) && job.conclusion === 'success');
    });
    return {
        schema: 1,
        repository,
        toolingSha,
        candidate,
        producerRunID: Number(metadata.runID),
        producerRunAttempt: Number(metadata.runAttempt),
        platforms,
        checklistIssueNumber: await matchingChecklist(candidate.version, read),
    };
}

async function resolvePreview(event: unknown, toolingSha: string, read: GitHubRead, platform?: EvaluationPlatform): Promise<EvaluationPlan> {
    if (
        !isRecord(event) ||
        !isRecord(event.pull_request) ||
        !isRecord(event.pull_request.head) ||
        !isRecord(event.pull_request.head.repo) ||
        !isRecord(event.pull_request.base) ||
        !isRecord(event.pull_request.base.repo) ||
        event.pull_request.head.repo.full_name !== repository ||
        event.pull_request.base.repo.full_name !== repository ||
        event.pull_request.head.ref !== previewBranch ||
        !isGitID(event.pull_request.head.sha) ||
        !isGitID(toolingSha)
    ) {
        throw new Error('Credential devices require the approved same-repository preview branch.');
    }
    const sha = event.pull_request.head.sha;
    const current = await read(`/repos/${repository}/pulls/${Number(event.number)}`);
    if (!isRecord(current) || !isRecord(current.head) || current.head.sha !== sha || current.state !== 'open') {
        throw new Error('Preview head changed or pull request is closed.');
    }
    const candidate = await repositoryCandidate(sha, read);
    return {
        schema: 1,
        repository,
        toolingSha,
        candidate: {...candidate, environment: 'preview'},
        producerRunID: null,
        producerRunAttempt: null,
        platforms: platform ? [platform] : ['android', 'ios'],
        checklistIssueNumber: null,
    };
}

async function repositoryCandidate(sha: string, read: GitHubRead): Promise<{appSha: string; mobileSha: string; version: string}> {
    const tree = await read(`/repos/${repository}/git/trees/${sha}`);
    const packageFile = await read(`/repos/${repository}/contents/package.json?ref=${sha}`);
    if (!isRecord(tree) || !Array.isArray(tree.tree) || !isRecord(packageFile) || typeof packageFile.content !== 'string') {
        throw new Error('Missing candidate tree or package metadata.');
    }
    const mobile: unknown = tree.tree.find((entry: unknown) => isRecord(entry) && entry.path === 'Mobile-Expensify' && entry.mode === '160000');
    if (!isRecord(mobile) || !isGitID(mobile.sha)) {
        throw new Error('Candidate has no immutable Mobile-Expensify gitlink.');
    }
    const pkg: unknown = JSON.parse(Buffer.from(packageFile.content, 'base64').toString('utf8'));
    if (!isRecord(pkg) || typeof pkg.version !== 'string') {
        throw new Error('Missing candidate version.');
    }
    return parseCandidate({appSha: sha, mobileSha: mobile.sha, version: pkg.version, environment: 'preview'});
}

async function verifyRepositoryCandidate(sha: string, mobile: string, version: string, read: GitHubRead): Promise<void> {
    const actual = await repositoryCandidate(sha, read);
    if (actual.mobileSha !== mobile || actual.version !== version) {
        throw new Error('Producer metadata differs from the actual candidate checkout.');
    }
}

async function matchingChecklist(version: string, read: GitHubRead): Promise<number | null> {
    const matches: number[] = [];
    for (let page = 1; page <= 100; page += 1) {
        const issues = await read(`/repos/${repository}/issues?labels=StagingDeployCash&state=all&per_page=100&page=${page}`);
        if (!Array.isArray(issues)) {
            throw new Error('Invalid deployment checklist response.');
        }
        for (const issue of issues) {
            if (!checklistMatches(issue, version) || !isRecord(issue) || !validID(issue.number)) {
                continue;
            }
            matches.push(issue.number);
        }
        if (matches.length > 1) {
            throw new Error('Multiple deployment checklists match the exact candidate version.');
        }
        if (issues.length < 100) {
            return matches.at(0) ?? null;
        }
    }
    throw new Error('Historical checklist search exceeds its bounded pagination limit.');
}

function assertProducerEventAttempt(event: unknown, run: unknown): void {
    if (isRecord(event) && isRecord(event.workflow_run) && isRecord(run) && event.workflow_run.id === run.id && event.workflow_run.run_attempt === run.run_attempt) {
        return;
    }
    throw new Error('Producer event was superseded by another run or attempt.');
}

function selectProducerArtifact(input: unknown, runID: number, runAttempt: number): Record<string, unknown> & {id: number} {
    if (!isRecord(input) || !Array.isArray(input.artifacts) || typeof input.total_count !== 'number' || input.total_count > 100) {
        throw new Error('Invalid producer artifact enumeration.');
    }
    const artifacts: unknown[] = input.artifacts.filter((item: unknown) => isRecord(item) && item.name === `pgo-native-candidate-${runAttempt}` && item.expired === false);
    const artifact = artifacts.at(0);
    if (artifacts.length !== 1 || !isRecord(artifact) || !isRecord(artifact.workflow_run) || artifact.workflow_run.id !== runID || !validID(artifact.id)) {
        throw new Error('Missing or ambiguous immutable producer metadata.');
    }
    return {...artifact, id: artifact.id};
}

function validID(value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function checklistMatches(issue: unknown, version: string): boolean {
    if (!isRecord(issue) || typeof issue.body !== 'string' || !Array.isArray(issue.labels) || issue.pull_request) {
        return false;
    }
    return (
        issue.labels.some((label: unknown) => label === 'StagingDeployCash' || (isRecord(label) && label.name === 'StagingDeployCash')) &&
        issue.body.match(/\*\*Release Version:\*\*\s*`([^`]+)`/)?.at(1) === `${version}-staging`
    );
}

export {assertProducerEventAttempt, selectProducerArtifact, checklistMatches, matchingChecklist, repositoryCandidate, resolvePreview, resolveProducer};
export type {GitHubRead};
