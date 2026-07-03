import useSelectionListShortcuts from '@components/SelectionList/hooks/useSelectionListShortcuts';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';

import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import CONST from '@src/CONST';

import {renderHook} from '@testing-library/react-native';

jest.mock('@hooks/useKeyboardShortcut');
jest.mock('@hooks/useActiveElementRole');

const mockUseKeyboardShortcut = jest.mocked(useKeyboardShortcut);
const mockUseActiveElementRole = jest.mocked(useActiveElementRole);

const focusedOption: ListItem = {keyForList: 'focused', text: 'Focused'};

type ShortcutsTestParams = {
    confirmButtonOptions?: ConfirmButtonOptions<ListItem>;
    isActive: boolean;
    focusedIndex: number;
    disableKeyboardShortcuts: boolean;
    shouldStopPropagation: boolean;
    shouldBubble: boolean;
};

function renderShortcuts(overrides: Partial<ShortcutsTestParams> = {}) {
    const selectFocusedItem = jest.fn();
    const getFocusedOption = jest.fn<ListItem | undefined, []>(() => focusedOption);
    renderHook(() =>
        useSelectionListShortcuts({
            selectFocusedItem,
            getFocusedOption,
            confirmButtonOptions: undefined,
            isActive: true,
            focusedIndex: 0,
            disableKeyboardShortcuts: false,
            shouldStopPropagation: false,
            shouldBubble: false,
            ...overrides,
        }),
    );
    return {selectFocusedItem, getFocusedOption};
}

function getShortcut(shortcut: typeof CONST.KEYBOARD_SHORTCUTS.ENTER | typeof CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER) {
    const call = mockUseKeyboardShortcut.mock.calls.find((registered) => registered[0] === shortcut);
    return {callback: call?.[1], config: call?.[2]};
}

describe('useSelectionListShortcuts', () => {
    beforeEach(() => {
        mockUseKeyboardShortcut.mockClear();
        mockUseActiveElementRole.mockReturnValue(null);
    });

    describe('Enter', () => {
        it('is active when the list is focused and a row is focused', () => {
            renderShortcuts({isActive: true, focusedIndex: 0});
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER).config?.isActive).toBe(true);
        });

        it('is disabled when no row is focused (focusedIndex < 0)', () => {
            renderShortcuts({focusedIndex: -1});
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER).config?.isActive).toBe(false);
        });

        it('is disabled when the list screen is not active', () => {
            renderShortcuts({isActive: false});
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER).config?.isActive).toBe(false);
        });

        it('is disabled when keyboard shortcuts are disabled', () => {
            renderShortcuts({disableKeyboardShortcuts: true});
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER).config?.isActive).toBe(false);
        });

        it('is disabled while an interactive element (button/checkbox/switch) is focused', () => {
            mockUseActiveElementRole.mockReturnValue(CONST.ROLE.BUTTON);
            renderShortcuts();
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER).config?.isActive).toBe(false);
        });

        it('stays active for a non-interactive active element role', () => {
            mockUseActiveElementRole.mockReturnValue(CONST.ROLE.PRESENTATION);
            renderShortcuts();
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER).config?.isActive).toBe(true);
        });

        it('activates the focused row and forwards shouldBubble / shouldStopPropagation', () => {
            const {selectFocusedItem} = renderShortcuts({shouldBubble: true, shouldStopPropagation: true});
            const {callback, config} = getShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER);
            expect(config?.shouldBubble).toBe(true);
            expect(config?.shouldStopPropagation).toBe(true);
            callback?.(undefined);
            expect(selectFocusedItem).toHaveBeenCalledTimes(1);
        });
    });

    describe('Ctrl+Enter', () => {
        it('delegates to confirmButtonOptions.onConfirm with the focused option', () => {
            const onConfirm = jest.fn();
            const {selectFocusedItem} = renderShortcuts({confirmButtonOptions: {onConfirm}});
            const {callback} = getShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER);
            const event = new KeyboardEvent('keydown');

            callback?.(event);

            expect(onConfirm).toHaveBeenCalledWith(event, focusedOption);
            expect(selectFocusedItem).not.toHaveBeenCalled();
        });

        it('falls back to activating the focused row when there is no confirm handler', () => {
            const {selectFocusedItem} = renderShortcuts({confirmButtonOptions: undefined});
            const {callback} = getShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER);

            callback?.(undefined);

            expect(selectFocusedItem).toHaveBeenCalledTimes(1);
        });

        it('is disabled when the confirm button is disabled', () => {
            renderShortcuts({confirmButtonOptions: {isDisabled: true}});
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER).config?.isActive).toBe(false);
        });

        it('is not gated by focusedIndex (unlike Enter)', () => {
            renderShortcuts({focusedIndex: -1});
            expect(getShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER).config?.isActive).toBe(true);
        });
    });
});
