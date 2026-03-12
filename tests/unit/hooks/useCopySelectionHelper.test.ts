import {renderHook} from '@testing-library/react-native';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import SelectionScraper from '@libs/SelectionScraper';
import CONST from '@src/CONST';

jest.mock('@libs/Clipboard', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        canSetHtml: jest.fn(),
        setString: jest.fn(),
        setHtml: jest.fn(),
    },
}));

jest.mock('@libs/Clipboard/getClipboardText', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/KeyboardShortcut', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        subscribe: jest.fn(),
    },
}));

jest.mock('@libs/SelectionScraper', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        getCurrentSelection: jest.fn(),
    },
}));

const mockClipboard = Clipboard as {
    canSetHtml: jest.Mock;
    setString: jest.Mock;
    setHtml: jest.Mock;
};
const mockGetClipboardText = getClipboardText as jest.Mock;
const mockSubscribe = KeyboardShortcut.subscribe as jest.Mock;
const mockGetCurrentSelection = SelectionScraper.getCurrentSelection as jest.Mock;

describe('useCopySelectionHelper', () => {
    const unsubscribeCopyShortcut = jest.fn();
    const copyShortcutConfig = CONST.KEYBOARD_SHORTCUTS.COPY;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReturnValue(unsubscribeCopyShortcut);
    });

    const triggerCopyShortcut = () => {
        const calls = mockSubscribe.mock.calls as Array<[string, () => void, ...unknown[]]>;
        const copyShortcutHandler = calls.at(0)?.[1];
        expect(copyShortcutHandler).toBeDefined();
        copyShortcutHandler?.();
    };

    it('subscribes to copy shortcut and unsubscribes on unmount', () => {
        const {unmount} = renderHook(() => useCopySelectionHelper());

        expect(mockSubscribe).toHaveBeenCalledWith(copyShortcutConfig.shortcutKey, expect.any(Function), copyShortcutConfig.descriptionKey, [...copyShortcutConfig.modifiers], false);

        unmount();

        expect(unsubscribeCopyShortcut).toHaveBeenCalledTimes(1);
    });

    it('sets plain text clipboard when html clipboard is unavailable', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockGetClipboardText.mockReturnValue('Expensify');
        mockClipboard.canSetHtml.mockReturnValue(false);

        renderHook(() => useCopySelectionHelper());
        triggerCopyShortcut();

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockClipboard.setString).toHaveBeenCalledWith('Expensify');
        expect(mockClipboard.setHtml).not.toHaveBeenCalled();
    });

    it('sets html clipboard payload when html clipboard is available', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockGetCurrentSelection.mockReturnValue(selection);
        mockGetClipboardText.mockReturnValue('Expensify');
        mockClipboard.canSetHtml.mockReturnValue(true);

        renderHook(() => useCopySelectionHelper());
        triggerCopyShortcut();

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockClipboard.setHtml).toHaveBeenCalledWith(selection, 'Expensify');
        expect(mockClipboard.setString).not.toHaveBeenCalled();
    });

    it('does nothing when there is no selected content', () => {
        mockGetCurrentSelection.mockReturnValue('');

        renderHook(() => useCopySelectionHelper());
        triggerCopyShortcut();

        expect(mockGetClipboardText).not.toHaveBeenCalled();
        expect(mockClipboard.setString).not.toHaveBeenCalled();
        expect(mockClipboard.setHtml).not.toHaveBeenCalled();
    });
});
