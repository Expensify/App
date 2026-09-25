import {describe, expect, it} from 'bun:test';

import {journeyBenchmarkPaths, sha256Artifact} from '@scripts/pgo/journeyBenchmark';
import {parseJourneyFixture} from '@scripts/pgo/journeyConfig';
import {assertSignedIn, normalizeLabel, parseJourneySnapshot} from '@scripts/pgo/journeyDevice';
import {
    allFilterTapPoint,
    contentSignature,
    findReportResult,
    findTabNode,
    inAppBackTapPoint,
    scrollDistance,
    scrollFastBothWays,
    spendSectionTapPoint,
    waitForTab,
} from '@scripts/pgo/journeyWorkload';
import {BENCHMARK_SPANS_ENVIRONMENT, HEAVY_JOURNEY_SPAN_NAMES, JOURNEY_SPAN_NAMES, STARTUP_SPAN_NAME} from '@scripts/pgo/shared';

import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const fixture = {
    accountEmail: 'heavy@example.com',
    accountClass: 'heavy',
    description: 'Owner-approved account with a populated inbox, message history, expenses, and reports.',
    report: {query: 'busy', resultLabelPrefix: '#busy, Test workspace', title: '#busy'},
    personalChat: {query: 'heavy@example.com', resultLabelPrefix: 'Test User (you), heavy@example.com', title: 'Test User (you)'},
};

describe('PGO journey safeguards', () => {
    it('logs the held-out navigation spans in both PGO builds without replacing startup samples', () => {
        // Given release and optimized artifacts share one build-time benchmark allowlist.
        const enabledSpans = BENCHMARK_SPANS_ENVIRONMENT.split('=').at(1)?.split(',');
        // When / Then the startup span and every short-journey span remain available.
        expect(enabledSpans).toEqual([STARTUP_SPAN_NAME, ...JOURNEY_SPAN_NAMES, ...HEAVY_JOURNEY_SPAN_NAMES]);
        expect(journeyBenchmarkPaths({benchmarkDirectory: '/pgo/ios/benchmarks'}, 'batch-1')).toEqual({
            release: '/pgo/ios/benchmarks/journey/batch-1/release.csv',
            optimized: '/pgo/ios/benchmarks/journey/batch-1/pgo-optimized.csv',
        });
        expect(journeyBenchmarkPaths({benchmarkDirectory: '/pgo/ios/benchmarks'}, 'batch-1', 'heavy-journey')).toEqual({
            release: '/pgo/ios/benchmarks/heavy-journey/batch-1/release.csv',
            optimized: '/pgo/ios/benchmarks/heavy-journey/batch-1/pgo-optimized.csv',
        });
    });

    it('hashes iOS bundle resources as well as the app executable', async () => {
        const app = mkdtempSync(join(tmpdir(), 'pgo-test-app-'));
        try {
            mkdirSync(join(app, 'Frameworks'));
            writeFileSync(join(app, 'Expensify'), 'same executable');
            writeFileSync(join(app, 'main.jsbundle'), 'first bundle');
            const before = await sha256Artifact(app);
            writeFileSync(join(app, 'main.jsbundle'), 'second bundle');
            expect(await sha256Artifact(app)).not.toBe(before);
        } finally {
            rmSync(app, {recursive: true, force: true});
        }
    });

    it('requires explicit message approval in the fixture', () => {
        // Given account approval alone does not authorize a particular message destination.
        for (const allowMessages of [undefined, false, 'true']) {
            // When / Then full journeys remain unavailable until approval is recorded explicitly.
            expect(parseJourneyFixture({...fixture, allowMessages}).allowMessages).toBe(false);
        }
        expect(parseJourneyFixture({...fixture, allowMessages: true}).allowMessages).toBe(true);
    });

    it('requires the account owner to select a heavy account explicitly', () => {
        // Given an unclassified or ordinary account, a populated-looking screen is insufficient evidence.
        for (const accountClass of [undefined, 'ordinary', '']) {
            // When / Then the fixture cannot start a training run.
            expect(() => parseJourneyFixture({...fixture, accountClass})).toThrow('accountClass="heavy"');
        }
    });

    it("rejects message destinations that are not the approved account's personal chat", () => {
        // Given a fixture that would send messages to another person or to a different account's personal chat.
        for (const personalChat of [
            {...fixture.personalChat, query: 'another@example.com'},
            {...fixture.personalChat, title: 'Another person'},
            {...fixture.personalChat, resultLabelPrefix: 'Other User (you), other@example.com'},
            {...fixture.personalChat, resultLabelPrefix: 'Test User (you), heavy@example.com.invalid'},
        ]) {
            // When / Then no device action is permitted for that fixture.
            expect(() => parseJourneyFixture({...fixture, personalChat})).toThrow('own "(you)" chat');
        }
    });

    it('rejects an empty workload or an unbounded scrolling loop', () => {
        // Given invalid workload sizes that would create an unrepresentative or runaway recording.
        for (const scrolls of [0, 1, 31, NaN, '8']) {
            // When / Then parsing fails before the app is touched.
            expect(() => parseJourneyFixture({...fixture, scrolls})).toThrow('scrolls');
        }
    });

    it('filters system keyboard content out of app assertions', () => {
        // Given Android's keyboard can display labels unrelated to the foreground app.
        const nodes = parseJourneySnapshot(
            {
                appBundleId: 'test.app',
                nodes: [
                    {bundleId: 'keyboard.app', label: 'Sign in'},
                    {bundleId: 'test.app', label: 'Inbox'},
                ],
            },
            'test.app',
        );
        // When / Then keyboard content cannot falsely trigger a sign-in failure.
        expect(nodes).toHaveLength(1);
        expect(() => assertSignedIn(nodes)).not.toThrow();
    });

    it('stops for manual sign-in on both platforms', () => {
        // Given either platform has reached an authentication or code-entry screen.
        for (const identifier of ['username', 'validateCode']) {
            for (const type of ['android.widget.EditText', 'TextField']) {
                const nodes = parseJourneySnapshot({appBundleId: 'test.app', nodes: [{identifier, type}]}, 'test.app');
                // When / Then the runner requests user input instead of filling credentials.
                expect(() => assertSignedIn(nodes)).toThrow('SIGN_IN_REQUIRED');
            }
        }
    });

    it('rejects a snapshot from the wrong app', () => {
        // Given device focus has moved to an unexpected application.
        const snapshot = {appBundleId: 'other.app', nodes: []};
        // When / Then its labels cannot satisfy the journey's assertions.
        expect(() => parseJourneySnapshot(snapshot, 'test.app')).toThrow('expected app');
    });

    it('normalizes accessibility text direction markers without changing its words', () => {
        // Given translated UI labels include bidirectional isolation and non-breaking spaces.
        const label = '\u2066Most\u00a0recent\u2069';
        // When / Then the same label can be compared across native platforms.
        expect(normalizeLabel(label)).toBe('Most recent');
    });

    it('matches report identity independently of the changing last-message preview', () => {
        // Given the workspace has similarly named reports and a new message changes the preview.
        const label = '#busy, Test workspace • New message';
        const nodes = parseJourneySnapshot({appBundleId: 'test.app', nodes: [{label}, {label: '#busy, Test workspace copy • Other message'}]}, 'test.app');
        // When / Then only the specified workspace can be selected.
        expect(findReportResult(nodes, '#busy, Test workspace')).toBe(label);
    });

    it('refuses ambiguous report matches', () => {
        // Given two results share the fixture identity.
        const nodes = parseJourneySnapshot({appBundleId: 'test.app', nodes: [{label: '#busy, Test workspace'}, {label: '#busy, Test workspace • Message'}]}, 'test.app');
        // When / Then choosing the first result would risk opening an unintended destination.
        expect(() => findReportResult(nodes, '#busy, Test workspace')).toThrow('Ambiguous');
    });

    it('finds the approved personal chat after its email subtitle becomes a message preview', () => {
        // Given a previous run sent a message, while another account has a similarly named chat.
        const label = 'Test User (you), PGO previous run message';
        const nodes = parseJourneySnapshot({appBundleId: 'test.app', nodes: [{label}, {label: 'Test User (you)'}, {label: 'Test User, Message from another account'}]}, 'test.app');
        // When / Then the validated personal-chat title matches only the full result row.
        expect(findReportResult(nodes, fixture.personalChat.resultLabelPrefix, fixture.personalChat.title)).toBe(label);
        expect(findReportResult(nodes, fixture.personalChat.resultLabelPrefix)).toBeUndefined();
    });

    it('sizes scrolls for different screens without starting inside the fixed header', () => {
        // Given Android uses physical pixels while iOS accessibility exposes logical screen dimensions.
        for (const [width, height] of [
            [1080, 2280],
            [390, 844],
        ]) {
            const nodes = parseJourneySnapshot({appBundleId: 'test.app', nodes: [{type: 'ScrollView', rect: {width, height}}]}, 'test.app');
            // When the gesture is centered, both ends stay within the middle half of the portrait viewport.
            const distance = scrollDistance(nodes);
            expect(distance).toBeGreaterThan(0);
            expect(distance).toBeLessThanOrEqual((height ?? 0) / 2);
            expect(scrollDistance(nodes, true)).toBeGreaterThan(distance);
        }
        // Then missing viewport information must fail instead of falling back to a screen-edge gesture.
        expect(() => scrollDistance([])).toThrow('scroll bounds');
    });

    it('uses fixed rapid swipes and validates movement in both directions', () => {
        // Given a report with distinct content at the recent and older scroll positions.
        const snapshots = ['recent', 'older', 'recent'].map((label) =>
            parseJourneySnapshot({appBundleId: 'test.app', nodes: [{type: 'ScrollView', rect: {width: 390, height: 844}}, {label}]}, 'test.app'),
        );
        const commands: string[][] = [];
        let read = 0;
        // When the heavy benchmark scrolls in both directions.
        scrollFastBothWays(
            {
                snapshot: () => snapshots.at(read++) ?? [],
                command: (...args) => commands.push(args),
            },
            4,
        );
        // Then it sends fixed-duration gestures and checks content after each direction.
        expect(commands).toHaveLength(8);
        expect(commands.every((args) => args.includes('120'))).toBe(true);
        expect(commands.filter((args) => args.includes('--settle'))).toHaveLength(2);
        expect(commands.at(0)?.at(1)).toBe('up');
        expect(commands.at(-1)?.at(1)).toBe('down');
    });

    it('selects iOS status-bearing bottom tabs without confusing them with page headings', () => {
        const nodes = parseJourneySnapshot(
            {
                appBundleId: 'test.app',
                nodes: [
                    {type: 'Application', rect: {width: 390, height: 844, y: 0}},
                    {label: 'Inbox', rect: {width: 390, height: 50, y: 80}},
                    {label: 'Inbox. Your review is required', rect: {width: 78, height: 71, y: 749}},
                    {label: 'Inbox', type: 'StaticText', rect: {width: 26, height: 14, y: 793}},
                    {label: 'Account, My settings. Your review is required.', rect: {width: 78, height: 71, y: 749}},
                ],
            },
            'test.app',
        );
        expect(findTabNode(nodes, 'Inbox')?.label).toBe('Inbox. Your review is required');
        expect(findTabNode(nodes, 'Account')?.label).toBe('Account, My settings. Your review is required.');
    });

    it('waits for a status-bearing iOS Account tab without requiring an exact label', async () => {
        const nodes = parseJourneySnapshot(
            {
                appBundleId: 'test.app',
                nodes: [
                    {type: 'Application', rect: {width: 390, height: 844, y: 0}},
                    {label: 'Account, My settings. Your review is required.', rect: {width: 78, height: 71, y: 749}},
                ],
            },
            'test.app',
        );
        const device = {snapshot: () => nodes};
        await expect(waitForTab(device, 'Account')).resolves.toBeUndefined();
    });

    it('accepts a duplicated Android navigation subtree but rejects distinct tab targets', () => {
        const tab = {type: 'android.view.View', label: 'Inbox. Your review is required', rect: {x: 216, y: 1968, width: 216, height: 186}};
        const snapshot = (tabs: Array<typeof tab>) =>
            parseJourneySnapshot({appBundleId: 'test.app', nodes: [{type: 'Application', rect: {x: 0, y: 0, width: 1080, height: 2280}}, ...tabs]}, 'test.app');

        expect(findTabNode(snapshot([tab, tab]), 'Inbox')?.x).toBe(216);
        expect(() => findTabNode(snapshot([tab, {...tab, rect: {...tab.rect, x: 432}}]), 'Inbox')).toThrow('Ambiguous Inbox tab');
    });

    it('targets the visible All filter rather than the iOS strip cell center over Unread', () => {
        // Given an iOS accessibility cell whose bounds cover the whole Inbox filter strip.
        const nodes = parseJourneySnapshot(
            {
                appBundleId: 'test.app',
                nodes: [
                    {type: 'Application', rect: {width: 390, height: 844, x: 0, y: 0}},
                    {label: 'All', type: 'Cell', rect: {width: 390, height: 52, x: 0, y: 115}},
                    {label: 'Unread', type: 'Other', rect: {width: 136, height: 40, x: 102, y: 115}},
                ],
            },
            'test.app',
        );
        // When the journey chooses the All filter's tap point.
        const tapPoint = allFilterTapPoint(nodes);
        // Then it stays left of Unread.
        expect(tapPoint).toEqual({x: 51, y: 135});
    });

    it('taps the iOS search Back button even when the keyboard marks it non-hittable', () => {
        // Given the search screen's bounded Back button beneath an open keyboard.
        const nodes = parseJourneySnapshot(
            {
                appBundleId: 'test.app',
                nodes: [
                    {type: 'Application', rect: {width: 390, height: 844, x: 0, y: 0}},
                    {label: 'Back', type: 'Button', hittable: false, rect: {width: 40, height: 40, x: 8, y: 59}},
                    {label: 'Back', type: 'Button', rect: {width: 40, height: 40, x: 300, y: 700}},
                ],
            },
            'test.app',
        );
        // When the journey looks for the in-app Back control.
        const tapPoint = inAppBackTapPoint(nodes);
        // Then it chooses the top-left button rather than the keyboard area.
        expect(tapPoint).toEqual({x: 28, y: 79});
    });

    it('detects iOS report scrolling when offscreen accessibility labels stay loaded', () => {
        // Given the same report labels at different vertical positions after a scroll.
        const reportNodes = (firstMessageY: number) =>
            parseJourneySnapshot(
                {
                    appBundleId: 'test.app',
                    nodes: [
                        {type: 'Application', rect: {width: 390, height: 844, y: 0}},
                        {label: 'Old message', rect: {width: 390, height: 40, y: firstMessageY - 80}},
                        {label: 'Recent message', rect: {width: 390, height: 40, y: firstMessageY}},
                    ],
                },
                'test.app',
            );
        // When content signatures are compared.
        const before = contentSignature(reportNodes(500));
        const after = contentSignature(reportNodes(266));
        // Then movement is visible despite identical labels.
        expect(before).not.toBe(after);
    });

    it('targets the visible iOS Spend segments despite a wide Expenses strip cell', () => {
        // Given an Expenses cell that covers the full segment strip and a bounded Reports control.
        const nodes = parseJourneySnapshot(
            {
                appBundleId: 'test.app',
                nodes: [
                    {type: 'Application', rect: {width: 390, height: 844, x: 0, y: 0}},
                    {label: 'Expenses', type: 'Cell', rect: {width: 1426, height: 52, x: 0, y: 115}},
                    {label: 'Reports', type: 'Other', rect: {width: 94, height: 40, x: 125, y: 115}},
                ],
            },
            'test.app',
        );
        // When each section is selected.
        const expenses = spendSectionTapPoint(nodes, 'Expenses');
        const reports = spendSectionTapPoint(nodes, 'Reports');
        // Then both tap points land inside their visible segments.
        expect(expenses).toEqual({x: 63, y: 135});
        expect(reports).toEqual({x: 172, y: 135});
    });
});
