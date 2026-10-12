// cspell:ignore cooldown
/** Public identities and measurement records for evaluation-only PGO jobs. */
import {createHash} from 'node:crypto';

import type {BenchmarkSample} from '../lib/benchmarkStatistics';

type EvaluationPlatform = 'android' | 'ios';
type CandidateIdentity = {appSha: string; mobileSha: string; version: string; environment: 'staging' | 'production' | 'preview'};
type CandidateMetadata = {schema: 1; repository: 'Expensify/App'; runID: number; runAttempt: number; nativeEligible: boolean; candidate: CandidateIdentity};
type EvaluationPlan = {
    schema: 1;
    repository: 'Expensify/App';
    toolingSha: string;
    candidate: CandidateIdentity;
    producerRunID: number | null;
    producerRunAttempt: number | null;
    platforms: EvaluationPlatform[];
    checklistIssueNumber: number | null;
};
type FrameObservation = {run: number; status: 'unavailable'} | {run: number; status: 'available'; totalFrames: number; jankyFrames: number; originalPercent: number; sampleWindowMs: number};
type EvaluationCohort = {
    scenario: 'startup' | 'journey' | 'heavy-journey';
    order: 'release-first' | 'optimized-first';
    spans: string[];
    runs: number;
    warmUpRunsPerBinary: number;
    cooldownSecondsPerBinary: number;
    release: BenchmarkSample[];
    optimized: BenchmarkSample[];
    releaseCsvSha256: string;
    optimizedCsvSha256: string;
    frames?: {release: FrameObservation[]; optimized: FrameObservation[]};
};
type EvaluationResult = {
    schema: 1;
    platform: EvaluationPlatform;
    candidate: CandidateIdentity;
    toolingSha: string;
    status: 'passed' | 'failed';
    failureStage?: string;
    artifactSha256: {release: string; instrumented: string; optimized: string};
    profileSha256: string;
    sourceIdentity: string;
    toolchain: Record<string, string>;
    compilerConsumption: 'unverified' | 'verified';
    cohorts: EvaluationCohort[];
};

function candidateKey(candidate: CandidateIdentity): string {
    return createHash('sha256')
        .update(JSON.stringify([candidate.appSha, candidate.mobileSha, candidate.version, candidate.environment]))
        .digest('hex');
}

function parsePlan(input: unknown): EvaluationPlan {
    if (!isRecord(input) || input.schema !== 1 || input.repository !== 'Expensify/App' || !isGitID(input.toolingSha) || !isRecord(input.candidate) || !Array.isArray(input.platforms)) {
        throw new Error('Invalid PGO evaluation plan.');
    }
    const candidate = parseCandidate(input.candidate);
    const platforms = input.platforms.filter((value): value is EvaluationPlatform => value === 'android' || value === 'ios');
    if (
        platforms.length !== input.platforms.length ||
        new Set(platforms).size !== platforms.length ||
        !nullableID(input.producerRunID) ||
        !nullableID(input.producerRunAttempt) ||
        !nullableID(input.checklistIssueNumber)
    ) {
        throw new Error('Invalid PGO evaluation plan identities.');
    }
    return {
        schema: 1,
        repository: 'Expensify/App',
        toolingSha: input.toolingSha,
        candidate,
        platforms,
        producerRunID: input.producerRunID,
        producerRunAttempt: input.producerRunAttempt,
        checklistIssueNumber: input.checklistIssueNumber,
    };
}

function parseCandidate(input: unknown): CandidateIdentity {
    if (
        !isRecord(input) ||
        !isGitID(input.appSha) ||
        !isGitID(input.mobileSha) ||
        typeof input.version !== 'string' ||
        !/^\d+\.\d+\.\d+(?:-\d+)?$/.test(input.version) ||
        (input.environment !== 'staging' && input.environment !== 'production' && input.environment !== 'preview')
    ) {
        throw new Error('Invalid immutable PGO candidate identity.');
    }
    return {appSha: input.appSha, mobileSha: input.mobileSha, version: input.version, environment: input.environment};
}

function isRecord(input: unknown): input is Record<string, unknown> {
    return typeof input === 'object' && input !== null && !Array.isArray(input);
}
function isGitID(input: unknown): input is string {
    return typeof input === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(input);
}
function isSha256(input: unknown): input is string {
    return typeof input === 'string' && /^[a-f0-9]{64}$/.test(input);
}
function nullableID(input: unknown): input is number | null {
    return input === null || (typeof input === 'number' && Number.isSafeInteger(input) && input > 0);
}

export {candidateKey, isGitID, isRecord, isSha256, parseCandidate, parsePlan};
export type {CandidateIdentity, CandidateMetadata, EvaluationCohort, EvaluationPlan, EvaluationPlatform, EvaluationResult, FrameObservation};
