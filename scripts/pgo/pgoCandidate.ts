#!/usr/bin/env bun
/* eslint-disable @typescript-eslint/naming-convention -- CLI and GitHub output keys use their external hyphenated schema. */
/** Capture deployment identity or resolve a trusted evaluation plan without device access. */
import {createHash} from 'node:crypto';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {parseArgs} from 'node:util';

import type {GitHubRead} from './candidateResolve';
import type {CandidateMetadata} from './evaluationSchema';

import {capture} from '../lib/scriptUtils';
import {assertProducerEventAttempt, resolvePreview, resolveProducer, selectProducerArtifact} from './candidateResolve';
import {isRecord, parseCandidate} from './evaluationSchema';

async function main(): Promise<void> {
    const {values, positionals} = parseArgs({
        allowPositionals: true,
        options: {
            output: {type: 'string'},
            environment: {type: 'string'},
            'native-eligible': {type: 'string'},
            'source-run-id': {type: 'string'},
            platform: {type: 'string', default: 'both'},
        },
    });
    const output = values.output;
    if (!output) {
        throw new Error('An explicit output path is required.');
    }
    if (positionals.at(0) === 'capture') {
        if (!['true', 'false'].includes(values['native-eligible'] ?? '')) {
            throw new Error('Explicit native eligibility is required.');
        }
        const candidate = captureCandidate(values.environment ?? '', values['native-eligible'] === 'true');
        writeJSON(output, candidate);
        return;
    }
    if (positionals.at(0) !== 'prepare' || process.env.GITHUB_REPOSITORY !== 'Expensify/App') {
        throw new Error('Expected a trusted prepare invocation in Expensify/App.');
    }
    const read = createGitHubReader();
    const event: unknown = JSON.parse(readFileSync(requiredEnvironment('GITHUB_EVENT_PATH'), 'utf8'));
    const toolingSha = capture('git', ['rev-parse', 'HEAD']).trim();
    const platform = values.platform === 'both' ? undefined : values.platform;
    if (platform !== undefined && platform !== 'android' && platform !== 'ios') {
        throw new Error('Invalid evaluation platform.');
    }
    let plan;
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
        plan = await resolvePreview(event, toolingSha, read, platform);
    } else {
        let runID = 0;
        if (values['source-run-id']) {
            runID = positiveID(values['source-run-id']);
        } else if (isRecord(event) && isRecord(event.workflow_run)) {
            runID = positiveID(String(event.workflow_run.id));
        }
        if (runID === 0) {
            throw new Error('An immutable producer run ID is required.');
        }
        const run = await read(`/repos/Expensify/App/actions/runs/${runID}`);
        if (!isRecord(run)) {
            throw new Error('Invalid producer run.');
        }
        const jobs = await read(`/repos/Expensify/App/actions/runs/${runID}/attempts/${positiveID(String(run.run_attempt))}/jobs?per_page=100`);
        if (!isRecord(jobs) || Number(jobs.total_count) > 100) {
            throw new Error('Producer jobs require complete bounded enumeration.');
        }
        if (process.env.GITHUB_EVENT_NAME === 'workflow_run') {
            assertProducerEventAttempt(event, run);
        }
        plan = await resolveProducer(await producerMetadata(runID, positiveID(String(run.run_attempt)), read), run, jobs, toolingSha, read, platform);
    }
    writeJSON(output, plan);
    appendOutputs({
        eligible: String(plan.platforms.length > 0),
        'app-sha': plan.candidate.appSha,
        'mobile-sha': plan.candidate.mobileSha,
        version: plan.candidate.version,
        platforms: plan.platforms.join(','),
        'platform-matrix': JSON.stringify(plan.platforms),
    });
}

function captureCandidate(environment: string, nativeEligible: boolean, readSource = capture): CandidateMetadata {
    if (process.env.GITHUB_REPOSITORY !== 'Expensify/App' || !['staging', 'production'].includes(environment)) {
        throw new Error('Invalid producer repository or environment.');
    }
    const pkg: unknown = JSON.parse(readFileSync('package.json', 'utf8'));
    if (!isRecord(pkg)) {
        throw new Error('Missing deployment package metadata.');
    }
    const mobileSha = readSource('git', ['rev-parse', 'HEAD:Mobile-Expensify']).trim();
    if (readSource('git', ['-C', 'Mobile-Expensify', 'rev-parse', 'HEAD']).trim() !== mobileSha) {
        throw new Error('Native checkout differs from the committed deployment gitlink.');
    }
    const candidate = parseCandidate({appSha: readSource('git', ['rev-parse', 'HEAD']).trim(), mobileSha, version: pkg.version, environment});
    return {
        schema: 1,
        repository: 'Expensify/App',
        runID: positiveID(requiredEnvironment('GITHUB_RUN_ID')),
        runAttempt: positiveID(requiredEnvironment('GITHUB_RUN_ATTEMPT')),
        nativeEligible,
        candidate,
    };
}

async function producerMetadata(runID: number, runAttempt: number, read: GitHubRead): Promise<unknown> {
    const response = await read(`/repos/Expensify/App/actions/runs/${runID}/artifacts?per_page=100`);
    const artifact = selectProducerArtifact(response, runID, runAttempt);
    const responseZip = await fetch(`https://api.github.com/repos/Expensify/App/actions/artifacts/${artifact.id}/zip`, {headers: githubHeaders()});
    if (!responseZip.ok) {
        throw new Error('Producer metadata download failed.');
    }
    const bytes = Buffer.from(await responseZip.arrayBuffer());
    if (bytes.length > 1024 * 1024) {
        throw new Error('Producer metadata archive exceeds its size bound.');
    }
    if (typeof artifact.digest === 'string' && artifact.digest !== `sha256:${createHash('sha256').update(bytes).digest('hex')}`) {
        throw new Error('Producer metadata digest differs.');
    }
    const directory = mkdtempSync(join(tmpdir(), 'pgo-candidate-'));
    try {
        const archive = join(directory, 'candidate.zip');
        writeFileSync(archive, bytes);
        const entries = capture('unzip', ['-Z1', archive]).trim().split('\n');
        if (entries.length !== 1 || entries.at(0) !== 'candidate.json') {
            throw new Error('Unexpected producer metadata archive contents.');
        }
        return JSON.parse(capture('unzip', ['-p', archive, 'candidate.json'])) as unknown;
    } finally {
        rmSync(directory, {recursive: true, force: true});
    }
}

function createGitHubReader(): GitHubRead {
    return async (path) => {
        if (!path.startsWith('/repos/Expensify/App/')) {
            throw new Error('GitHub read escaped the approved repository.');
        }
        const response = await fetch(`https://api.github.com${path}`, {headers: githubHeaders()});
        if (!response.ok) {
            throw new Error(`GitHub metadata request failed (${response.status}).`);
        }
        return response.json();
    };
}

function githubHeaders(): Record<string, string> {
    return {Authorization: `Bearer ${requiredEnvironment('GITHUB_TOKEN')}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'};
}
function positiveID(value: string): number {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error('Invalid immutable run identity.');
    }
    return id;
}
function requiredEnvironment(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ${name}.`);
    }
    return value;
}
function writeJSON(path: string, value: unknown): void {
    mkdirSync(dirname(resolve(path)), {recursive: true});
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
function appendOutputs(values: Record<string, string>): void {
    if (!process.env.GITHUB_OUTPUT) {
        return;
    }
    writeFileSync(
        process.env.GITHUB_OUTPUT,
        Object.entries(values)
            .map(([key, value]) => `${key}=${value}\n`)
            .join(''),
        {flag: 'a'},
    );
}

if (import.meta.main) {
    try {
        await main();
    } catch {
        appendOutputs({eligible: 'false', reason: 'Candidate metadata or trust validation failed.'});
        console.error('PGO candidate metadata or trust validation failed; no device evaluation is eligible.');
        process.exitCode = 1;
    }
}
export {captureCandidate, createGitHubReader, main};
