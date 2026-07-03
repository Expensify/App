import useSelectionListTextInput from '@components/SelectionList/hooks/useSelectionListTextInput';

import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';

import CONST from '@src/CONST';

import type {TextInputKeyPressEvent} from 'react-native';

import {renderHook} from '@testing-library/react-native';

jest.mock('@hooks/useSyncFocus/useSyncFocusImplementation', () => ({
    focusedItemRef: {focus: jest.fn()},
}));

const mockFocusedItemRefFocus = jest.mocked(focusedItemRef)?.focus;

function keyPressEvent(key: string): Pick<TextInputKeyPressEvent, 'nativeEvent'> {
    return {nativeEvent: {key}};
}

describe('useSelectionListTextInput', () => {
    beforeEach(() => {
        mockFocusedItemRefFocus?.mockClear();
    });

    it('focusTextInput focuses the attached input ref', () => {
        const {result} = renderHook(() => useSelectionListTextInput(jest.fn()));
        const inputElement = document.createElement('form');
        const focusSpy = jest.spyOn(inputElement, 'focus').mockImplementation(() => {});
        result.current.innerTextInputRef.current = inputElement;

        result.current.focusTextInput();

        expect(focusSpy).toHaveBeenCalledTimes(1);
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
