// cspell:ignore cooldown
import {describe, expect, it} from 'bun:test';

import type {EvaluationCohort, EvaluationPlan, EvaluationResult} from '../../scripts/pgo/evaluationSchema';

import {distribution, evaluationReport, summarizePlatform, summarizeFrames} from '../../scripts/pgo/evaluationReport';
import {candidateKey, parsePlan} from '../../scripts/pgo/evaluationSchema';
import {HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES} from '../../scripts/pgo/shared';

const hash = 'a'.repeat(64);
const plan: EvaluationPlan = {
    schema: 1,
    repository: 'Expensify/App',
    toolingSha: 'c'.repeat(40),
    candidate: {appSha: 'a'.repeat(40), mobileSha: 'b'.repeat(40), version: '9.4.94-0', environment: 'staging'},
    producerRunID: 10,
    producerRunAttempt: 2,
    platforms: ['android'],
    checklistIssueNumber: 42,
};
function result(): EvaluationResult {
    const definitions = [
        ['startup', ['ManualAppStartup']],
        ['journey', [...JOURNEY_SPAN_NAMES]],
        ['heavy-journey', [...HEAVY_JOURNEY_SPAN_NAMES]],
    ] as const;
    const cohorts: EvaluationCohort[] = definitions.flatMap(([scenario, spans]) =>
        (['release-first', 'optimized-first'] as const).map((order) => ({
            scenario,
            order,
            spans: [...spans],
            runs: 20,
            warmUpRunsPerBinary: 1,
            cooldownSecondsPerBinary: 5,
            releaseCsvSha256: hash,
            optimizedCsvSha256: hash,
            release: Array.from({length: 20}, (_, index) => spans.map((span) => ({run: index + 1, span, durationMs: 100}))).flat(),
            optimized: Array.from({length: 20}, (_, index) => spans.map((span) => ({run: index + 1, span, durationMs: 90}))).flat(),
        })),
    );
    return {
        schema: 1,
        platform: 'android',
        candidate: plan.candidate,
        toolingSha: plan.toolingSha,
        status: 'passed',
        artifactSha256: {release: hash, instrumented: hash, optimized: hash},
        profileSha256: hash,
        sourceIdentity: hash,
        toolchain: {compilerVersion: 'Clang 17'},
        compilerConsumption: 'unverified',
        cohorts,
    };
}

describe('PGO public evaluation reports', () => {
    it('retains all observations and computes distributions and positive-faster effects without selection', async () => {
        // Given complete opposite-order cohorts for every workload.
        const input = result();
        // When the report computes numeric summaries.
        const report = await evaluationReport(plan, [input], async () => ({body: '**Release Version:** `9.4.94-0-staging`', labels: [{name: 'StagingDeployCash'}]}));
        const summary = report.summary;
        // Then all samples remain and the mean effect is ten percent without choosing a deployment artifact.
        expect(summary.status).toBe('complete');
        expect(summary.platforms.at(0)?.cohorts?.at(0)?.statistics.at(0)?.meanEffectPercent).toBe(10);
        expect(report.markdown).toContain('canonical baseline artifacts and deployment selection are unchanged');
        expect(report.comment.targetIssueNumber).toBe(42);
        expect(report.comment.body).toStartWith("Chris's AI");
    });

    it('rejects incomplete, extra, reordered and cross-candidate measurements rather than salvaging subsets', () => {
        // Given a complete result bound to the candidate.
        const input = result();
        const cohort = input.cohorts.at(0);
        if (!cohort) {
            throw new Error('Missing synthetic cohort.');
        }
        // When any mandatory measurement or identity is changed.
        // Then the entire claimed complete platform evidence is rejected.
        expect(() => summarizePlatform(plan, 'android', {...input, candidate: {...plan.candidate, appSha: 'd'.repeat(40)}})).toThrow();
        expect(() => summarizePlatform(plan, 'android', {...input, cohorts: input.cohorts.slice(1)})).toThrow();
        for (const release of [cohort.release.slice(1), [...cohort.release, {...cohort.release.at(0)}], [...cohort.release].reverse()]) {
            expect(() => summarizePlatform(plan, 'android', {...input, cohorts: [{...cohort, release}, ...input.cohorts.slice(1)]})).toThrow();
        }
        expect(() => summarizePlatform(plan, 'android', {...input, cohorts: [{...cohort, warmUpRunsPerBinary: 0}, ...input.cohorts.slice(1)]})).toThrow();
    });

    it('whitelists public numeric provenance and excludes private fields and raw errors', async () => {
        // Given private extra fields that must never enter uploaded or commented report data.
        const input = {...result(), accountEmail: 'private@example.com', fixture: '/private/fixture.json', rawError: 'private error', deviceID: 'secret-device'};
        // When explicit output fields are selected and an unavailable platform is represented.
        const report = await evaluationReport(plan, [input], async () => ({body: 'wrong version', labels: [{name: 'StagingDeployCash'}]}));
        const serialized = JSON.stringify(report);
        // Then secrets are omitted and an obsolete checklist cannot receive a report for another version.
        expect(serialized).not.toContain('private@example.com');
        expect(serialized).not.toContain('secret-device');
        expect(serialized).not.toContain('/private/fixture.json');
        expect(report.comment.targetIssueNumber).toBeNull();
        expect(report.comment.skippedReason).toContain('No exact historical');
    });

    it('keeps missing and failed platforms explicit while candidate-specific markers remain stable across reruns', async () => {
        // Given a missing result or a failed cohort for the same immutable candidate.
        const first = await evaluationReport(plan, [], async () => ({}));
        const second = await evaluationReport(
            plan,
            [{schema: 1, candidate: plan.candidate, toolingSha: plan.toolingSha, platform: 'android', status: 'failed', rawError: 'secret'}],
            async () => ({}),
        );
        // When the version or App commit changes.
        const other = {...plan.candidate, appSha: 'd'.repeat(40)};
        // Then the old failed result is not converted to numeric success, and other candidates have separate markers.
        expect(JSON.stringify(first.summary)).toContain('missing');
        expect(JSON.stringify(second.summary)).toContain('failed');
        expect(first.comment.marker).toBe(second.comment.marker);
        expect(candidateKey(other)).not.toBe(candidateKey(plan.candidate));
        expect(JSON.stringify(second)).not.toContain('secret');
    });

    it('retains hashed overlay/config provenance and reports missing frames without zero filling', () => {
        // Given approved digest fields and twenty unavailable ancillary samples.
        const input = {...result(), toolchain: {identitySha256: hash, reviewedOverlaySha256: hash, environmentSha256: hash, fixtureSha256: hash}};
        const missing = Array.from({length: 20}, (_, index) => ({run: index + 1, status: 'unavailable', raw: 'private'}));
        // When numeric coverage and the public hash whitelist are summarized.
        const publicResult = summarizePlatform(plan, 'android', input);
        const coverage = summarizeFrames(missing);
        // Then provenance survives while unavailable frames have no fabricated summary or raw data.
        expect(publicResult.toolchain?.reviewedOverlaySha256).toBe(hash);
        expect(coverage.availableSamples).toBe(0);
        expect(coverage.unavailableSamples).toBe(20);
        expect(coverage.summary).toBeNull();
        expect(JSON.stringify(coverage)).not.toContain('private');
        expect(() => summarizeFrames(missing.slice(1))).toThrow();
    });

    it('weights native jank by total frames while preserving original percentages and windows', () => {
        // Given two available windows with unequal total frame counts.
        const samples = Array.from({length: 20}, (_, index) => ({run: index + 1, status: 'unavailable'}));
        const available = [
            {run: 1, status: 'available', totalFrames: 10, jankyFrames: 5, originalPercent: 50, sampleWindowMs: 100},
            {run: 2, status: 'available', totalFrames: 90, jankyFrames: 0, originalPercent: 0, sampleWindowMs: 200},
        ];
        // When total-frame weighted jank and original per-window values are calculated.
        const coverage = summarizeFrames([...available, ...samples.slice(2)]);
        // Then the weighted percentage is five rather than the sample-mean twenty-five.
        expect(coverage.summary?.weightedJankyPercent).toBe(5);
        expect(coverage.summary?.originalPercent.average).toBe(25);
        expect(coverage.unavailableSamples).toBe(18);
        expect(coverage.summary?.sampleWindowMs.average).toBe(150);
    });

    it('uses known interpolated statistics while retaining IQR outliers', () => {
        // Given a small known distribution containing an outlier.
        // When all values are summarized without trimming.
        const stats = distribution([1, 2, 3, 100]);
        // Then the arithmetic and retained outlier count are explicit.
        expect(stats.runs).toBe(4);
        expect(stats.average).toBe(26.5);
        expect(stats.median).toBe(2.5);
        expect(stats.p10).toBe(1.3);
        expect(stats.iqrOutliers).toBe(1);
    });

    it('rejects malformed plan identities before execution or reporting', () => {
        // Given a valid immutable plan.
        // When a platform or artifact identity is malformed.
        // Then no permissive fallback can interpret it as another candidate.
        expect(parsePlan(plan)).toEqual(plan);
        expect(() => parsePlan({...plan, toolingSha: 'short'})).toThrow();
        expect(() => parsePlan({...plan, platforms: ['android', 'android']})).toThrow();
        expect(() => summarizePlatform(plan, 'android', {...result(), artifactSha256: {release: 'a'.repeat(40), optimized: hash, instrumented: hash}})).toThrow();
    });
});
