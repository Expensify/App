import {describe, expect, it} from 'bun:test';

import {parseJourneyFixture} from '@scripts/pgo/journeyConfig';
import {assertSignedIn, normalizeLabel, parseJourneySnapshot} from '@scripts/pgo/journeyDevice';
import {findReportResult, scrollDistance} from '@scripts/pgo/journeyWorkload';

const fixture = {
    accountEmail: 'heavy@example.com',
    accountClass: 'heavy',
    description: 'Owner-approved account with a populated inbox, message history, expenses, and reports.',
    report: {query: 'busy', resultLabelPrefix: '#busy, Test workspace', title: '#busy'},
    personalChat: {query: 'heavy@example.com', resultLabelPrefix: 'Test User (you), heavy@example.com', title: 'Test User (you)'},
};

describe('PGO journey safeguards', () => {
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
        }
        // Then missing viewport information must fail instead of falling back to a screen-edge gesture.
        expect(() => scrollDistance([])).toThrow('scroll bounds');
    });
});
