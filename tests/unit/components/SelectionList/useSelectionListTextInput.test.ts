import {renderHook} from '@testing-library/react-native';
import type {TextInputKeyPressEvent} from 'react-native';
import useSelectionListTextInput from '@components/SelectionList/hooks/useSelectionListTextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import CONST from '@src/CONST';

jest.mock('@hooks/useSyncFocus/useSyncFocusImplementation', () => ({
    focusedItemRef: {focus: jest.fn()},
}));

const mockFocusedItemRefFocus = focusedItemRef?.focus as jest.Mock;

function keyPressEvent(key: string): TextInputKeyPressEvent {
    return {nativeEvent: {key}} as TextInputKeyPressEvent;
}

describe('useSelectionListTextInput', () => {
    beforeEach(() => {
        mockFocusedItemRefFocus.mockClear();
    });

    it('focusTextInput focuses the attached input ref', () => {
        const {result} = renderHook(() => useSelectionListTextInput(jest.fn()));
        const focus = jest.fn();
        result.current.innerTextInputRef.current = {focus} as unknown as BaseTextInputRef;

        result.current.focusTextInput();

        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('focusTextInput no-ops when no input is attached', () => {
        const {result} = renderHook(() => useSelectionListTextInput(jest.fn()));
        result.current.innerTextInputRef.current = null;

        expect(() => result.current.focusTextInput()).not.toThrow();
    });

    it('textInputKeyPress on Tab switches to keyboard-nav mode and moves focus to the focused row', () => {
        const setHasKeyBeenPressed = jest.fn();
        const {result} = renderHook(() => useSelectionListTextInput(setHasKeyBeenPressed));

        result.current.textInputKeyPress(keyPressEvent(CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey));

        expect(setHasKeyBeenPressed).toHaveBeenCalledTimes(1);
        expect(mockFocusedItemRefFocus).toHaveBeenCalledTimes(1);
    });

    it('textInputKeyPress ignores non-Tab keys', () => {
        const setHasKeyBeenPressed = jest.fn();
        const {result} = renderHook(() => useSelectionListTextInput(setHasKeyBeenPressed));

        result.current.textInputKeyPress(keyPressEvent('Enter'));

        expect(setHasKeyBeenPressed).not.toHaveBeenCalled();
        expect(mockFocusedItemRefFocus).not.toHaveBeenCalled();
    });
});
