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
        WebClipboard.setHtml('', 'hello');

        expect(mockSetString).toHaveBeenCalledWith('hello');
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('writes plain text when the browser cannot set HTML', () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {},
        });

        WebClipboard.setHtml('<b>hello</b>', 'hello');

        expect(mockSetString).toHaveBeenCalledWith('hello');
    });

    it('writes plain text when ClipboardItem throws', () => {
        installClipboardItem(true);

        WebClipboard.setHtml('<b>hello</b>', 'hello');

        expect(mockSetString).toHaveBeenCalledWith('hello');
    });

    it('writes plain text when the async clipboard write rejects', async () => {
        mockWrite.mockImplementation(() => Promise.reject(new Error('denied')));

        WebClipboard.setHtml('<b>hello</b>', 'hello');
        await Promise.resolve();

        expect(mockSetString).toHaveBeenCalledWith('hello');
    });

    it('writes plain text when Safari execCommand refuses the copy', () => {
        mockGetBrowser.mockReturnValue(CONST.BROWSER.SAFARI);
        mockExecCommand.mockReturnValue(false);

        WebClipboard.setHtml('<b>hello</b>', 'hello');

        expect(mockExecCommand).toHaveBeenCalledWith('copy');
        expect(mockSetString).toHaveBeenCalledWith('hello');
        expect(mockWrite).not.toHaveBeenCalled();
    });
});
