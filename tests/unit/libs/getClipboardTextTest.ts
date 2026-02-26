import getClipboardText from '@libs/Clipboard/getClipboardText';
import Parser from '@libs/Parser';

jest.mock('@libs/Parser', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        htmlToText: jest.fn(),
        htmlToMarkdown: jest.fn(),
    },
}));

const mockedParser = Parser as unknown as {
    htmlToText: jest.Mock;
    htmlToMarkdown: jest.Mock;
};

describe('getClipboardText', () => {
    const selection = '<a href="https://expensify.com">Expensify</a>';

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
        expect(mockedParser.htmlToMarkdown).toHaveBeenCalledWith(selection);
    });

    it('returns the parser output without modification', () => {
        const expected = 'some parsed text';
        mockedParser.htmlToMarkdown.mockReturnValue(expected);

        const result = getClipboardText('<b>test</b>');

        expect(result).toBe(expected);
        expect(mockedParser.htmlToMarkdown).toHaveBeenCalledWith('<b>test</b>');
    });
});
