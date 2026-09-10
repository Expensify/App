import {renderHook} from '@testing-library/react-native';

import useSelectionListShortcuts from '@components/SelectionList/hooks/useSelectionListShortcuts';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import CONST from '@src/CONST';

jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());

const mockUseKeyboardShortcut = jest.mocked(useKeyboardShortcut);

type Registration = {isActive?: boolean};

/** Returns the config of the most recent registration for the given shortcut, so tests can assert whether it is armed. */
function getRegistration(shortcut: (typeof CONST.KEYBOARD_SHORTCUTS)['ENTER'] | (typeof CONST.KEYBOARD_SHORTCUTS)['CTRL_ENTER']): Registration | undefined {
    return mockUseKeyboardShortcut.mock.calls.findLast(([registeredShortcut]) => registeredShortcut === shortcut)?.[2] as Registration | undefined;
}

type ShortcutParams = Parameters<typeof useSelectionListShortcuts<ListItem>>[0];

function renderShortcuts(overrides: Partial<ShortcutParams> = {}) {
    const params: ShortcutParams = {
        selectFocusedItem: jest.fn(),
        getFocusedOption: () => undefined,
        confirmButtonOptions: undefined,
        isActive: true,
        focusedIndex: 0,
        disableKeyboardShortcuts: false,
        shouldStopPropagation: false,
        shouldBubble: false,
        ...overrides,
    };
    return renderHook(() => useSelectionListShortcuts(params));
}

describe('useSelectionListShortcuts', () => {
    beforeEach(() => {
        mockUseKeyboardShortcut.mockClear();
    });

    it('arms the plain Enter shortcut when a real focused index is passed', () => {
        renderShortcuts({focusedIndex: 0});

        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.ENTER)?.isActive).toBe(true);
    });

    it('disarms the plain Enter shortcut when the focused index is gated to -1', () => {
        renderShortcuts({focusedIndex: -1});

        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.ENTER)?.isActive).toBe(false);
    });

    it('leaves Ctrl+Enter armed when the focused index is gated to -1', () => {
        const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {onConfirm: jest.fn()};
        renderShortcuts({focusedIndex: -1, confirmButtonOptions});

        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER)?.isActive).toBe(true);
    });

    it('still passes the real focused option to onConfirm when the focused index is gated to -1', () => {
        const onConfirm = jest.fn();
        const focusedOption: ListItem = {text: 'Item 0', keyForList: '0'};
        renderShortcuts({focusedIndex: -1, confirmButtonOptions: {onConfirm}, getFocusedOption: () => focusedOption});

        const ctrlEnterCallback = mockUseKeyboardShortcut.mock.calls.findLast(([shortcut]) => shortcut === CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER)?.[1];
        ctrlEnterCallback?.();

        expect(onConfirm).toHaveBeenCalledWith(undefined, focusedOption);
    });

    it('disarms both shortcuts when keyboard shortcuts are disabled', () => {
        renderShortcuts({disableKeyboardShortcuts: true});

        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.ENTER)?.isActive).toBe(false);
        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER)?.isActive).toBe(false);
    });

    it('disarms both shortcuts when the list is not active', () => {
        renderShortcuts({isActive: false});

        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.ENTER)?.isActive).toBe(false);
        expect(getRegistration(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER)?.isActive).toBe(false);
    });
});
