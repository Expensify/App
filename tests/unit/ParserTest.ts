import Parser from '@libs/Parser';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('Parser', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('isHTML', () => {
        test('returns true for strings containing HTML tags', () => {
            expect(Parser.isHTML('<b>bold</b>')).toBe(true);
            expect(Parser.isHTML('<a href="https://example.com">link</a>')).toBe(true);
            expect(Parser.isHTML('<h1>heading</h1>')).toBe(true);
            expect(Parser.isHTML('text with <em>emphasis</em> inside')).toBe(true);
            expect(Parser.isHTML('<br/>')).toBe(true);
            expect(Parser.isHTML('<p>paragraph</p>')).toBe(true);
        });

        test('returns false for plain text', () => {
            expect(Parser.isHTML('just plain text')).toBe(false);
            expect(Parser.isHTML('Fix the login bug')).toBe(false);
            expect(Parser.isHTML('')).toBe(false);
            expect(Parser.isHTML('100 > 50 and 20 < 30')).toBe(false);
        });

        test('returns false for strings with angle brackets that are not HTML', () => {
            expect(Parser.isHTML('a > b')).toBe(false);
            expect(Parser.isHTML('x < y')).toBe(false);
            expect(Parser.isHTML('<>')).toBe(false);
        });
    });

    describe('htmlToMarkdown', () => {
        // These cases pin the contract relied on by DescriptionField.tsx, where the description of a saved
        // transaction is stored as HTML (because `getParsedComment()` runs ExpensiMark at save time) and must
        // be normalized back to markdown before being handed to the `shouldParseTitle` MenuItem and the
        // `type="markdown"` TextInput. Without this normalization, the Split details page renders raw `<a>`
        // tags as visible text — see https://github.com/Expensify/App/issues/87519.
        test('converts an autolinked URL anchor back to a markdown link', () => {
            expect(Parser.htmlToMarkdown('<a href="https://google.com" target="_blank" rel="noreferrer noopener">google.com</a>')).toBe('[google.com](https://google.com)');
        });

        test('converts ExpensiMark-emitted bold tags back to markdown asterisks', () => {
            expect(Parser.htmlToMarkdown('<strong>hello</strong> world')).toBe('*hello* world');
        });

        test('is a no-op for plain text descriptions used by draft transactions', () => {
            expect(Parser.htmlToMarkdown('lunch')).toBe('lunch');
            expect(Parser.htmlToMarkdown('google.com')).toBe('google.com');
        });

        test('returns an empty string for an empty input', () => {
            expect(Parser.htmlToMarkdown('')).toBe('');
        });

        test('resolves mention accountID to @name via accountIDToName map', () => {
            const accountIDToName: Record<string, string> = {};
            accountIDToName['123'] = 'alice@example.com';
            expect(Parser.htmlToMarkdown('<mention-user accountID="123" />', {accountIDToName})).toBe('@alice@example.com');
        });

        test('returns @Hidden for mention when accountID is missing from the map', () => {
            expect(Parser.htmlToMarkdown('<mention-user accountID="123" />', {accountIDToName: {}})).toBe('@Hidden');
        });

        test('resolves mention-report reportID to report name via reportIDToName map', () => {
            const reportIDToName: Record<string, string> = {};
            reportIDToName['42'] = 'Expense Report';
            expect(Parser.htmlToMarkdown('<mention-report reportID="42" />', {reportIDToName})).toBe('Expense Report');
        });

        test('returns #Hidden for mention-report when reportID is missing from the map', () => {
            expect(Parser.htmlToMarkdown('<mention-report reportID="42" />', {reportIDToName: {}})).toBe('#Hidden');
        });

        test('does not resolve mention-report from Onyx reports when no reportIDToName map is passed', async () => {
            // Given a report that exists in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}42`, {reportID: '42', reportName: 'Expense Report'});
            await waitForBatchedUpdates();

            // When converting a mention of that report without passing a reportIDToName map
            const markdown = Parser.htmlToMarkdown('<mention-report reportID="42" />');

            // Then the report name is not looked up from Onyx, because callers that can receive report mentions must pass the map themselves
            expect(markdown).toBe('#Hidden');
        });

        test('keeps the room name of a text-form report mention without a reportIDToName map', () => {
            // Given HTML produced by the frontend's reportMentions rule, which keeps the room name inline instead of a reportID
            const html = 'see <mention-report>#admins</mention-report>';

            // When converting it without a reportIDToName map, as task, rule and category hint callers do
            const markdown = Parser.htmlToMarkdown(html);

            // Then the room name is preserved because no lookup is needed
            expect(markdown).toBe('see #admins');
        });
    });

    describe('htmlToText', () => {
        test('resolves mention accountID to @name via accountIDToName map', () => {
            const accountIDToName: Record<string, string> = {};
            accountIDToName['456'] = 'bob@example.com';
            expect(Parser.htmlToText('<mention-user accountID="456" />', {accountIDToName})).toBe('@bob@example.com');
        });

        test('returns @Hidden for mention when accountID is missing from the map', () => {
            expect(Parser.htmlToText('<mention-user accountID="456" />', {accountIDToName: {}})).toBe('@Hidden');
        });

        test('resolves mention-report reportID to report name via reportIDToName map', () => {
            const reportIDToName: Record<string, string> = {};
            reportIDToName['99'] = 'Trip Report';
            expect(Parser.htmlToText('<mention-report reportID="99" />', {reportIDToName})).toBe('Trip Report');
        });

        test('returns #Hidden for mention-report when reportID is missing from the map', () => {
            expect(Parser.htmlToText('<mention-report reportID="99" />', {reportIDToName: {}})).toBe('#Hidden');
        });
    });
});
