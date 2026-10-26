import {renderHook} from '@testing-library/react-native';

import useCopySelectionHelper from '@hooks/useCopySelectionHelper';

import type {CanSetHtml, SetHtml, SetString} from '@libs/Clipboard/types';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import SelectionScraper from '@libs/SelectionScraper';

import CONST from '@src/CONST';

jest.mock('@libs/Clipboard', () => ({
    __esModule: true,
    default: {
        canSetHtml: jest.fn<ReturnType<CanSetHtml>, Parameters<CanSetHtml>>(),
        setString: jest.fn<ReturnType<SetString>, Parameters<SetString>>(),
        setHtml: jest.fn<ReturnType<SetHtml>, Parameters<SetHtml>>(),
    },
}));

jest.mock('@libs/KeyboardShortcut', () => ({
    __esModule: true,
    default: {
        subscribe: jest.fn(),
    },
}));

jest.mock('@libs/SelectionScraper', () => ({
    __esModule: true,
    default: {
        getCurrentSelection: jest.fn(),
    },
}));

type ClipboardMock = {
    canSetHtml: jest.Mock<ReturnType<CanSetHtml>, Parameters<CanSetHtml>>;
    setString: jest.Mock<ReturnType<SetString>, Parameters<SetString>>;
    setHtml: jest.Mock<ReturnType<SetHtml>, Parameters<SetHtml>>;
};

const mockClipboard = jest.requireMock<{default: ClipboardMock}>('@libs/Clipboard').default;
const mockSubscribe = jest.mocked(KeyboardShortcut.subscribe);
const mockGetCurrentSelection = jest.mocked(SelectionScraper.getCurrentSelection);

describe('useCopySelectionHelper', () => {
    const unsubscribeCopyShortcut = jest.fn();
    const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReturnValue(unsubscribeCopyShortcut);
    });

    const triggerCopyShortcut = () => {
        const copyShortcutHandler = mockSubscribe.mock.calls.at(0)?.[1];
        expect(copyShortcutHandler).toBeDefined();
        copyShortcutHandler?.();
    };

    it('subscribes to copy shortcut and unsubscribes on unmount', () => {
        const {unmount} = renderHook(() => useCopySelectionHelper());

        expect(mockSubscribe).toHaveBeenCalledWith(
            copyShortcutConfig.shortcutKey,
            expect.any(Function),
            copyShortcutConfig.descriptionKey,
            [...copyShortcutConfig.modifiers],
            false,
            false,
            0,
            true,
            [],
            false,
        );

        unmount();

        expect(unsubscribeCopyShortcut).toHaveBeenCalledTimes(1);
    });

    it('sets plain text clipboard when html clipboard is unavailable', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockClipboard.canSetHtml.mockReturnValue(false);

        renderHook(() => useCopySelectionHelper());
        triggerCopyShortcut();

        // Jest loads the native clipboard text module, which keeps Markdown so links survive a native paste.
        expect(mockClipboard.setString).toHaveBeenCalledWith('[Expensify](https://expensify.com)');
        expect(mockClipboard.setHtml).not.toHaveBeenCalled();
    });

    it('sets html clipboard payload when html clipboard is available', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockClipboard.canSetHtml.mockReturnValue(true);

        renderHook(() => useCopySelectionHelper());
        triggerCopyShortcut();

        expect(mockClipboard.setHtml).toHaveBeenCalledWith(selection, '[Expensify](https://expensify.com)');
        expect(mockClipboard.setString).not.toHaveBeenCalled();
    });

    it('does nothing when there is no selected content', () => {
        mockGetCurrentSelection.mockReturnValue('');

        renderHook(() => useCopySelectionHelper());
        triggerCopyShortcut();

        expect(mockClipboard.setString).not.toHaveBeenCalled();
        expect(mockClipboard.setHtml).not.toHaveBeenCalled();
    });
});
