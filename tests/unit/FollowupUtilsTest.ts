import CONST from '../../src/CONST';
import {containsActionableFollowUps, parseFollowupsFromHtml} from '../../src/libs/ReportActionsFollowupUtils';
import {stripFollowupListFromHtml} from '../../src/libs/ReportActionsUtils';
import type {ReportAction} from '../../src/types/onyx';

describe('FollowupUtils', () => {
    describe('parseFollowupsFromHtml', () => {
        it('should return null when no followup-list exists', () => {
            const html = '<p>Hello world</p>';
            expect(parseFollowupsFromHtml(html)).toBeNull();
        });

        it('should return null for empty string', () => {
            expect(parseFollowupsFromHtml('')).toBeNull();
        });

        it('should return empty array when followup-list has selected attribute', () => {
            const html = `<p>Some message</p>
<followup-list selected>
  <followup><followup-text>How do I set up QuickBooks?</followup-text></followup>
</followup-list>`;
            expect(parseFollowupsFromHtml(html)).toEqual([]);
        });

        it('should return empty array when followup-list has selected attribute with other attributes', () => {
            const html = `<followup-list class="test" selected data-id="123">
  <followup><followup-text>Question 1</followup-text></followup>
</followup-list>`;
            expect(parseFollowupsFromHtml(html)).toEqual([]);
        });

        it('should parse single followup from unresolved list', () => {
            const html = `<p>Hello</p>
<followup-list>
  <followup><followup-text>How do I set up QuickBooks?</followup-text></followup>
</followup-list>`;
            expect(parseFollowupsFromHtml(html)).toEqual([{text: 'How do I set up QuickBooks?'}]);
        });

        it('should parse multiple followups from unresolved list', () => {
            const html = `<followup-list>
  <followup><followup-text>How do I set up QuickBooks?</followup-text></followup>
  <followup><followup-text>What is the Expensify Card cashback?</followup-text></followup>
</followup-list>`;
            expect(parseFollowupsFromHtml(html)).toEqual([{text: 'How do I set up QuickBooks?'}, {text: 'What is the Expensify Card cashback?'}]);
        });

        it('should handle followup-list with whitespace attributes', () => {
            const html = `<followup-list >
  <followup><followup-text>Question</followup-text></followup>
</followup-list>`;
            expect(parseFollowupsFromHtml(html)).toEqual([{text: 'Question'}]);
        });

        it('should return empty array for followup-list with selected but no followups', () => {
            const html = '<followup-list selected></followup-list>';
            expect(parseFollowupsFromHtml(html)).toEqual([]);
        });

        it('should return empty array for unresolved followup-list with no followups', () => {
            const html = '<followup-list></followup-list>';
            expect(parseFollowupsFromHtml(html)).toEqual([]);
        });
    });

    describe('stripFollowupListFromHtml', () => {
        it('should return original string when no followup-list exists', () => {
            const html = '<p>Hello world</p>';
            expect(stripFollowupListFromHtml(html)).toBe('<p>Hello world</p>');
        });

        it('should return undefined for empty input', () => {
            expect(stripFollowupListFromHtml('')).not.toBeDefined();
        });

        it('should strip followup-list and trim result', () => {
            const html = `<p>Some message</p>
<followup-list>
  <followup><followup-text>How do I set up QuickBooks?</followup-text></followup>
</followup-list>`;
            expect(stripFollowupListFromHtml(html)).toBe('<p>Some message</p>');
        });

        it('should strip resolved followup-list with selected attribute', () => {
            const html = `<p>Answer to your question</p>
<followup-list selected>
  <followup><followup-text>Old question</followup-text></followup>
</followup-list>`;
            expect(stripFollowupListFromHtml(html)).toBe('<p>Answer to your question</p>');
        });

        it('should handle content before and after followup-list', () => {
            const html = `<p>Before</p>
<followup-list>
  <followup><followup-text>Question</followup-text></followup>
</followup-list>
<p>After</p>`;
            expect(stripFollowupListFromHtml(html)).toBe(`<p>Before</p>

<p>After</p>`);
        });
    });

    describe('containsActionableFollowUps', () => {
        it('should return false for null/undefined reportAction', () => {
            expect(containsActionableFollowUps(null)).toBe(false);
            expect(containsActionableFollowUps(undefined)).toBe(false);
        });

        it('should return false for non-ADD_COMMENT action types', () => {
            const action = {
                reportActionID: '123',
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                message: [{html: '<followup-list><followup><followup-text>Question</followup-text></followup></followup-list>', text: '', type: 'COMMENT'}],
            } as ReportAction;

            expect(containsActionableFollowUps(action)).toBe(false);
        });

        it('should return false for ADD_COMMENT without message html', () => {
            const action = {
                reportActionID: '123',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [{text: 'Just text', type: 'COMMENT'}],
            } as ReportAction;

            expect(containsActionableFollowUps(action)).toBe(false);
        });

        it('should return false for ADD_COMMENT without followup-list', () => {
            const action = {
                reportActionID: '123',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [{html: '<p>Regular message</p>', text: 'Regular message', type: 'COMMENT'}],
            } as ReportAction;

            expect(containsActionableFollowUps(action)).toBe(false);
        });

        it('should return false for ADD_COMMENT with resolved followup-list (selected attribute)', () => {
            const action = {
                reportActionID: '123',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [{html: '<p>Message</p><followup-list selected><followup><followup-text>Question</followup-text></followup></followup-list>', text: 'Message', type: 'COMMENT'}],
            } as ReportAction;

            expect(containsActionableFollowUps(action)).toBe(false);
        });

        it('should return true for ADD_COMMENT with unresolved followup-list', () => {
            const action = {
                reportActionID: '123',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [{html: '<p>Message</p><followup-list><followup><followup-text>Question</followup-text></followup></followup-list>', text: 'Message', type: 'COMMENT'}],
            } as ReportAction;

            expect(containsActionableFollowUps(action)).toBe(true);
        });
    });
});
