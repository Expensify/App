import type * as ClipboardWebModule from '@libs/Clipboard/index';

import CONST from '@src/CONST';

const mockSetString = jest.fn();
const mockGetBrowser = jest.fn(() => 'chrome');
const mockWrite = jest.fn(() => Promise.resolve());
const mockExecCommand = jest.fn(() => true);

jest.mock('@react-native-clipboard/clipboard', () => ({
    __esModule: true,
    default: {
        setString: (text: string) => {
            mockSetString(text);
        },
    },
}));

jest.mock('@libs/Browser', () => ({
    getBrowser: () => mockGetBrowser(),
}));

const {default: WebClipboard} = jest.requireActual<typeof ClipboardWebModule>('@libs/Clipboard/index.ts');

describe('Clipboard.setHtml', () => {
    const originalClipboard = navigator.clipboard;

    const installClipboardItem = (shouldThrow: boolean) => {
        Object.defineProperty(global, 'ClipboardItem', {
            configurable: true,
            writable: true,
            value: function ClipboardItem() {
                if (!shouldThrow) {
                    return;
                }
                throw new Error('ClipboardItem is unsupported');
            },
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetBrowser.mockReturnValue('chrome');
        mockWrite.mockImplementation(() => Promise.resolve());
        mockExecCommand.mockReturnValue(true);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {write: mockWrite},
        });
        installClipboardItem(false);
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Safari still copies HTML through execCommand.
        document.execCommand = mockExecCommand;
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard,
        });
    });

    it('writes plain text when the HTML flavor is empty', () => {
        // Given the HTML flavor is empty and the plain text is still valid
        // When the clipboard write runs
        WebClipboard.setHtml('', 'hello');

        // Then plain text is written, because an empty HTML flavor must not drop the copy
        expect(mockSetString).toHaveBeenCalledWith('hello');
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('writes plain text when the browser cannot set HTML', () => {
        // Given the browser has no clipboard.write API
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {},
        });

        // When an HTML copy is requested
        WebClipboard.setHtml('<b>hello</b>', 'hello');

        // Then the plain text is still written instead of throwing
        expect(mockSetString).toHaveBeenCalledWith('hello');
    });

    it('writes plain text when ClipboardItem throws', () => {
        // Given constructing an HTML clipboard item is unsupported
        installClipboardItem(true);

        // When an HTML copy is requested
        WebClipboard.setHtml('<b>hello</b>', 'hello');

        // Then the failure falls back to plain text instead of losing the copy
        expect(mockSetString).toHaveBeenCalledWith('hello');
    });

    it('writes plain text when the async clipboard write rejects', async () => {
        // Given the browser accepts the HTML write call but then denies it
        mockWrite.mockImplementation(() => Promise.reject(new Error('denied')));

        // When an HTML copy is requested
        WebClipboard.setHtml('<b>hello</b>', 'hello');
        await Promise.resolve();

        // Then the rejection still leaves the plain-text flavor available
        expect(mockSetString).toHaveBeenCalledWith('hello');
    });

    it('writes plain text when Safari execCommand refuses the copy', () => {
        // Given Safari refuses the deprecated HTML copy command
        mockGetBrowser.mockReturnValue(CONST.BROWSER.SAFARI);
        mockExecCommand.mockReturnValue(false);

        // When an HTML copy is requested
        WebClipboard.setHtml('<b>hello</b>', 'hello');

        // Then plain text is written through the fallback, not the async clipboard API
        expect(mockExecCommand).toHaveBeenCalledWith('copy');
        expect(mockSetString).toHaveBeenCalledWith('hello');
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('removes the Safari copy node and keeps plain text when there is no selection', () => {
        // Given Safari has no selection to restore after the deprecated copy command
        mockGetBrowser.mockReturnValue(CONST.BROWSER.SAFARI);
        const spanCount = document.body.querySelectorAll('span').length;
        const getSelection = jest.spyOn(window, 'getSelection').mockReturnValue(null);

        // When HTML copy cannot select the temporary node
        WebClipboard.setHtml('<b>hello</b>', 'hello');

        // Then the temporary node is gone and the plain-text flavor is still written
        expect(document.body.querySelectorAll('span')).toHaveLength(spanCount);
        expect(mockSetString).toHaveBeenCalledWith('hello');
        expect(mockExecCommand).not.toHaveBeenCalled();
        getSelection.mockRestore();
    });
});
