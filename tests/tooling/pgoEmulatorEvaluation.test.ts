// cspell:ignore cooldown devicectl simctl
import {describe, expect, it} from 'bun:test';

import {parseBootedIOSSimulators} from '@scripts/lib/nativeAppBenchmark';
import {emulatorJourneyFixture, roomLabelPrefix, selfChatTitle} from '@scripts/pgo/emulatorAccount';
import type {BenchmarkResult, TrainingResult} from '@scripts/pgo/emulatorEvaluation';
import {evaluationResults} from '@scripts/pgo/emulatorEvaluation';
import {needsEmulatorSignIn, parseEmulatorSignIn, SESSION_REFRESH_MS} from '@scripts/pgo/emulatorSignIn';
import {evaluationReport} from '@scripts/pgo/evaluationReport';
import type {EvaluationCohort, EvaluationPlan} from '@scripts/pgo/evaluationSchema';
import type {JourneyNode} from '@scripts/pgo/journeyDevice';
import {emulatorEntryFile, HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES, STARTUP_SPAN_NAME} from '@scripts/pgo/shared';

import {existsSync} from 'node:fs';

const hash = 'a'.repeat(64);
const otherHash = 'b'.repeat(64);
const candidate: EvaluationPlan['candidate'] = {appSha: 'a'.repeat(40), mobileSha: 'b'.repeat(40), version: '9.4.94-0', environment: 'preview'};
const noChecklist = () => Promise.reject(new Error('The emulator report must not read a checklist.'));

function nodes(...labels: string[]): JourneyNode[] {
    return labels.map((label) => ({label, value: '', identifier: '', type: 'Button', enabled: true, width: 300, height: 60, x: 0, y: 0}));
}

function training(overrides: Partial<TrainingResult> = {}): TrainingResult {
    return {
        schema: 1,
        platform: 'android',
        target: 'android-emulator-x86_64',
        status: 'passed',
        appSha: candidate.appSha,
        mobileSha: candidate.mobileSha,
        artifactSha256: {release: hash, instrumented: hash, optimized: hash},
        profileSha256: hash,
        sourceIdentity: hash,
        toolchain: {identitySha256: hash, fixtureSha256: hash},
        profile: {functions: 1200, count: '123456'},
        journeyRunDurationsSeconds: [610, 590, 605],
        ...overrides,
    };
}

function benchmark(order: BenchmarkResult['order'], overrides: Partial<BenchmarkResult> = {}): BenchmarkResult {
    const scenarios = [
        ['heavy-journey', [...HEAVY_JOURNEY_SPAN_NAMES]],
        ['journey', [...JOURNEY_SPAN_NAMES]],
        ['startup', [STARTUP_SPAN_NAME]],
    ] as const;
    const cohorts: EvaluationCohort[] = scenarios.map(([scenario, spans]) => ({
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
    }));
    return {schema: 1, platform: 'android', order, status: 'passed', artifactSha256: {release: hash, optimized: hash}, cohorts, ...overrides};
}

describe('PGO emulator evaluation', () => {
    it('accepts the partner login only with a test account email and complete partner credentials', () => {
        // Given the values the workflow maps from repository secrets, with padding a secret editor can add.
        const signIn = {email: ' ci@example.com ', partnerUserID: ' user ', partnerUserSecret: ' secret '};
        // When the runner and the app parse them.
        // Then they are trimmed, and the app falls back to its own partner name when none is configured.
        expect(parseEmulatorSignIn(signIn)).toEqual({email: 'ci@example.com', partnerUserID: 'user', partnerUserSecret: 'secret'});
        expect(parseEmulatorSignIn({...signIn, partnerName: 'ci', partnerPassword: 'password'})).toMatchObject({partnerName: 'ci', partnerPassword: 'password'});
        // Then an unset secret or half of a partner pair fails before any request is sent.
        expect(() => parseEmulatorSignIn('ci@example.com')).toThrow('JSON object');
        expect(() => parseEmulatorSignIn({...signIn, email: 'ci'})).toThrow('test account email');
        expect(() => parseEmulatorSignIn({...signIn, partnerUserSecret: ''})).toThrow('missing partnerUserSecret');
        expect(() => parseEmulatorSignIn({...signIn, partnerName: 'ci'})).toThrow('both partnerName and partnerPassword');
    });

    it('signs in again only when the stored session cannot cover the next journey', () => {
        // Given a session the CI entry stored for the test account.
        const now = 10 * SESSION_REFRESH_MS;
        const session = {authToken: 'token', email: 'ci@example.com', creationDate: now - SESSION_REFRESH_MS};
        // When the app launches for the next sample.
        // Then a recent session is reused, so most launches send no Authenticate request.
        expect(needsEmulatorSignIn(session, 'ci@example.com', now)).toBe(false);
        // Then a missing, foreign, undated or old session is replaced before its token can expire mid-journey.
        expect(needsEmulatorSignIn(undefined, 'ci@example.com', now)).toBe(true);
        expect(needsEmulatorSignIn({...session, authToken: undefined}, 'ci@example.com', now)).toBe(true);
        expect(needsEmulatorSignIn(session, 'other@example.com', now)).toBe(true);
        expect(needsEmulatorSignIn({...session, creationDate: undefined}, 'ci@example.com', now)).toBe(true);
        expect(needsEmulatorSignIn({...session, creationDate: now - SESSION_REFRESH_MS - 1}, 'ci@example.com', now)).toBe(true);
    });

    it('reads the self-chat and busy room of the CI account from search instead of a fixture secret', () => {
        // Given search results as the app labels them, including a self-chat whose subtitle became its last message.
        const selfChat = nodes('Search for ci@example.com', 'CI Tester (you), PGO run 1 message 2');
        const rooms = nodes('#announce, Crowded Policy (Do Not Delete) • Welcome', '#announcements-old, Other workspace');
        // When the runner reads the journey targets.
        const title = selfChatTitle(selfChat);
        const prefix = roomLabelPrefix(rooms, '#announce');
        // Then it finds the one "(you)" chat and the one #announce room, waits while results load, and stops on ambiguity.
        expect(title).toBe('CI Tester (you)');
        expect(prefix).toBe('#announce, Crowded Policy (Do Not Delete)');
        expect(selfChatTitle(nodes('Search for ci@example.com'))).toBeUndefined();
        expect(() => roomLabelPrefix(nodes('#announce, Workspace A', '#announce, Workspace B'), '#announce')).toThrow('2 #announce rooms');
        expect(() => selfChatTitle(nodes('A (you), a@example.com', 'B (you), b@example.com'))).toThrow('2 chats titled');
    });

    it('binds the generated fixture to the CI account so training messages go only to its own chat', () => {
        // Given the values read from the signed-in app.
        // When the runner writes the journey fixture.
        const fixture = emulatorJourneyFixture('ci@example.com', 'CI Tester (you)', '#announce, Crowded Policy (Do Not Delete)');
        // Then it passes the journey's own fixture checks and names the account's self-chat as the only message target.
        expect(fixture.personalChat).toEqual({query: 'ci@example.com', resultLabelPrefix: 'CI Tester (you), ci@example.com', title: 'CI Tester (you)'});
        expect(fixture.report).toEqual({query: 'announce', resultLabelPrefix: '#announce, Crowded Policy (Do Not Delete)', title: '#announce'});
        expect(fixture.allowMessages).toBe(true);
        expect(() => emulatorJourneyFixture('ci@example.com', 'CI Tester', '#announce, Workspace')).toThrow('(you)');
    });

    it('builds the real app only for the app workload and keeps the synthetic verification entry otherwise', () => {
        // Given the workload variable that the emulator evaluation sets.
        const previous = process.env.PGO_CI_WORKLOAD;
        try {
            // When the emulator build selects its entry file.
            process.env.PGO_CI_WORKLOAD = 'app';
            const app = emulatorEntryFile();
            delete process.env.PGO_CI_WORKLOAD;
            const verification = emulatorEntryFile();
            // Then both entries exist and only the evaluation runs the real app.
            expect(app).toEndWith('/src/PgoEmulatorApp.ts');
            expect(verification).toEndWith('/src/PgoVerificationApp.tsx');
            expect(existsSync(app) && existsSync(verification)).toBe(true);
        } finally {
            if (previous === undefined) {
                delete process.env.PGO_CI_WORKLOAD;
            } else {
                process.env.PGO_CI_WORKLOAD = previous;
            }
        }
    });

    it('treats only booted simulators as simulators, so devices keep the devicectl path', () => {
        // Given simctl output with a booted and a shut-down simulator in different runtimes.
        const output = JSON.stringify({
            devices: {
                ios26: [{udid: 'BOOTED', state: 'Booted'}],
                ios18: [{udid: 'SHUTDOWN', state: 'Shutdown'}, {state: 'Booted'}],
            },
        });
        // When the benchmark resolves its target.
        // Then only the booted simulator matches, and an unexpected response fails instead of guessing.
        expect(parseBootedIOSSimulators(output)).toEqual(['BOOTED']);
        expect(() => parseBootedIOSSimulators('[]')).toThrow('unexpected device-list response');
    });

    it('publishes a complete report only when training and both benchmark orders measured the trained apps', async () => {
        // Given a passed training job and both passed benchmark orders.
        const {plan, results} = evaluationResults(candidate, ['android'], [training()], [benchmark('release-first'), benchmark('optimized-first')]);
        // When the release evaluation report renders them.
        const {summary} = await evaluationReport(plan, results, noChecklist);
        // Then every workload has both orders, and the report never looks for a deploy checklist.
        expect(summary.status).toBe('complete');
        expect(summary.platforms.at(0)?.cohorts).toHaveLength(6);
        expect(summary.platforms.at(0)?.cohorts?.at(0)?.statistics.at(0)?.meanEffectPercent).toBe(10);
        expect(plan.checklistIssueNumber).toBeNull();
    });

    it('reports failed, unfinished and missing legs at their stage without publishing their samples', async () => {
        // Given a failed second order, an order that never uploaded and a platform that never trained.
        const failedOrder = evaluationResults(
            candidate,
            ['android'],
            [training()],
            [benchmark('release-first'), benchmark('optimized-first', {status: 'failed', failureStage: 'journey-optimized-first', cohorts: []})],
        );
        const unfinishedOrder = evaluationResults(candidate, ['android'], [training()], [benchmark('release-first')]);
        const missingPlatform = evaluationResults(candidate, ['android', 'ios'], [training()], [benchmark('release-first'), benchmark('optimized-first')]);
        // When each is rendered.
        const failed = await evaluationReport(failedOrder.plan, failedOrder.results, noChecklist);
        const unfinished = await evaluationReport(unfinishedOrder.plan, unfinishedOrder.results, noChecklist);
        const missing = await evaluationReport(missingPlatform.plan, missingPlatform.results, noChecklist);
        // Then the report names the failed stage and keeps the platform that never produced a result.
        expect(failed.summary.platforms.at(0)).toMatchObject({status: 'failed', failureStage: 'journey-optimized-first'});
        expect(failedOrder.results.at(0)?.cohorts).toEqual([]);
        expect(unfinished.summary.platforms.at(0)).toMatchObject({status: 'failed', failureStage: 'heavy-journey-optimized-first'});
        expect(missing.summary.status).toBe('incomplete');
        expect(missing.summary.platforms.map((platform) => platform.status)).toEqual(['passed', 'missing']);
    });

    it('rejects benchmarks of other apps and training from another revision', () => {
        // Given results that do not belong to one evaluated build.
        const orders = [benchmark('release-first'), benchmark('optimized-first')];
        // When they are combined.
        // Then benchmarks of different apps, foreign revisions and duplicate or unselected platforms fail the report.
        expect(() => evaluationResults(candidate, ['android'], [training()], [benchmark('release-first', {artifactSha256: {release: hash, optimized: otherHash}}), orders.at(1)])).toThrow(
            'measured different apps',
        );
        expect(() => evaluationResults(candidate, ['android'], [training({mobileSha: 'c'.repeat(40)})], orders)).toThrow('another App or Mobile-Expensify revision');
        expect(() => evaluationResults(candidate, ['android'], [training(), training()], orders)).toThrow('at most one training result');
        expect(() => evaluationResults(candidate, ['android'], [training({platform: 'ios'})], orders)).toThrow('at most one training result');
        expect(() => evaluationResults(candidate, ['android'], [training()], [...orders, benchmark('release-first')])).toThrow('Duplicate android release-first');
    });
});
