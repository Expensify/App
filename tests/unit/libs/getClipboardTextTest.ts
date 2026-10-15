import getClipboardText from '@libs/Clipboard/getClipboardText';
import Parser from '@libs/Parser';

jest.mock('@libs/Parser', () => ({
    __esModule: true,
    default: {
        htmlToText: jest.fn(),
        htmlToMarkdown: jest.fn(),
    },
}));

const mockedParser = jest.mocked(Parser);

describe('getClipboardText', () => {
    const selection = '<a href="https://expensify.com">Expensify</a>';
    const mentionedReportID = '1';
    const reportIDToName = {[mentionedReportID]: '#general'};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // In the jest-expo test environment, platform resolution prefers .native files,
    // so getClipboardText resolves to the native implementation (htmlToMarkdown).
    // The web implementation (htmlToText) is structurally identical and tested via
    // useCopySelectionHelper and ContextMenuActions integration tests.
    it('calls Parser.htmlToMarkdown with the selection', () => {
        mockedParser.htmlToMarkdown.mockReturnValue('[Expensify](https://expensify.com)');

        const result = getClipboardText(selection);

        expect(result).toBe('[Expensify](https://expensify.com)');
        expect(mockedParser.htmlToMarkdown.mock.calls).toContainEqual([selection, {reportIDToName: undefined}]);
    });

    it('returns the parser output without modification', () => {
        const expected = 'some parsed text';
        mockedParser.htmlToMarkdown.mockReturnValue(expected);

        const result = getClipboardText('<b>test</b>');

        expect(result).toBe(expected);
        expect(mockedParser.htmlToMarkdown.mock.calls).toContainEqual(['<b>test</b>', {reportIDToName: undefined}]);
    });

    it('forwards the report name map so a report mention resolves instead of rendering as "#Hidden"', () => {
        // Given a caller that resolved the names of the reports mentioned in the HTML
        mockedParser.htmlToMarkdown.mockReturnValue('#general');

        // When the clipboard text is produced
        getClipboardText(selection, reportIDToName);

        // Then the map reaches the parser, which is what turns `<mention-report reportID>` into the room name
        expect(mockedParser.htmlToMarkdown.mock.calls).toContainEqual([selection, {reportIDToName}]);
    });
});
