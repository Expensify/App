import {act, renderHook} from '@testing-library/react-native';

import useNumericSelection from '@components/NumericEditingController/hooks/useNumericSelection';
import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController/types';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import * as NativeNavigation from '@react-navigation/native';

// Native sets this flag only on native platforms; mock it to exercise the guards owned by this hook.
jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

const mockUseIsFocused = jest.mocked(NativeNavigation.useIsFocused);

const buildKeyPressEvent = (key: string): NumericEditingKeyPressEvent => ({nativeEvent: {key}});

const renderSelection = (displayText = '12') => renderHook((props: {displayText: string}) => useNumericSelection(props), {initialProps: {displayText}});

describe('useNumericSelection', () => {
    beforeEach(() => {
        mockUseIsFocused.mockReturnValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('starts with the caret at the end of the displayed text', () => {
        const {result} = renderSelection('123');

        expect(result.current.selection).toEqual({start: 3, end: 3});
    });

    it('collapses a highlighted range onto its end', () => {
        const {result} = renderSelection('123');

        act(() => {
            result.current.handleNativeSelectionChange(0, 3);
        });
        act(() => {
            result.current.collapse();
        });

        expect(result.current.selection).toEqual({start: 3, end: 3});
    });

    it('collapses the selection when the screen regains focus', () => {
        mockUseIsFocused.mockReturnValue(false);
        const {result, rerender} = renderSelection('123');

        act(() => {
            result.current.handleNativeSelectionChange(0, 3);
        });
        mockUseIsFocused.mockReturnValue(true);
        rerender({displayText: '123'});

        expect(result.current.selection).toEqual({start: 3, end: 3});
    });

    it('moves the caret to the start when the field is reset', () => {
        const {result} = renderSelection('123');

        act(() => {
            result.current.reset();
        });

        expect(result.current.selection).toEqual({start: 0, end: 0});
    });

    it('moves the caret to the end of the given text', () => {
        const {result} = renderSelection('12');

        act(() => {
            result.current.moveToEnd('1234');
        });

        expect(result.current.selection).toEqual({start: 4, end: 4});
    });

    describe('syncAfterEdit', () => {
        it('shifts the caret forward by the characters the edit added', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
            });

            expect(result.current.selection).toEqual({start: 3, end: 3});
        });

        it('shifts the caret back by the characters the edit removed', () => {
            const {result} = renderSelection('123');

            act(() => {
                result.current.syncAfterEdit({previousText: '123', nextText: '12'});
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
        });

        it('leaves the caret in place after a forward-delete, which removes the character after it', () => {
            const {result} = renderSelection('123');

            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });
            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Delete'));
                result.current.syncAfterEdit({previousText: '123', nextText: '12'});
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });

        it('collapses a selection to its start after a forward-delete', () => {
            const {result} = renderSelection('123');

            act(() => {
                result.current.handleNativeSelectionChange(1, 2);
            });
            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Delete'));
                result.current.syncAfterEdit({previousText: '123', nextText: '13'});
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });

        it('shifts the caret back when backspace shrinks the text', () => {
            const {result} = renderSelection('123');

            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Backspace'));
                result.current.syncAfterEdit({previousText: '123', nextText: '12'});
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
        });

        it('clamps the caret to the start when the edit strips more characters than sit before it', () => {
            const {result} = renderSelection('12.34');

            act(() => {
                result.current.handleNativeSelectionChange(0, 0);
            });
            act(() => {
                // Reducing the accepted precision rewrites the value wherever the caret happens to be.
                result.current.syncAfterEdit({previousText: '12.34', nextText: '12'});
            });

            expect(result.current.selection).toEqual({start: 0, end: 0});
        });

        it('keeps the caret before pasted text when a forward-delete key press removed nothing', () => {
            const {result} = renderSelection('12345');

            act(() => {
                result.current.handleNativeSelectionChange(1, 4);
            });
            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Delete'));
                result.current.syncAfterEdit({previousText: '12345', nextText: '195'});
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
        });

        it('shifts the caret back past a repeated character a backspace removed', () => {
            const {result} = renderSelection('111');

            act(() => {
                result.current.handleNativeSelectionChange(2, 2);
            });
            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Backspace'));
                result.current.syncAfterEdit({previousText: '111', nextText: '11'});
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });

        it('shifts the caret when a forward-delete key was pressed but the edit added characters', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Delete'));
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
            });

            expect(result.current.selection).toEqual({start: 3, end: 3});
        });
    });

    describe('syncAfterEdit with an unchanged value', () => {
        it('keeps the caret where it was when normalization resolves the edit back to the current value', () => {
            const {result} = renderSelection('1.2');

            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });
            act(() => {
                result.current.syncAfterEdit({previousText: '1.2', nextText: '1.2'});
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });

        it('drops the event native emits for the character it kept, not the user event after it', () => {
            const {result} = renderSelection('1.2');

            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });
            act(() => {
                result.current.syncAfterEdit({previousText: '1.2', nextText: '1.2'});
                result.current.handleNativeSelectionChange(2, 2);
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});

            act(() => {
                result.current.handleNativeSelectionChange(2, 2);
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
        });

        it('consumes the forward-delete key press so the next edit is not treated as one', () => {
            const {result} = renderSelection('1.2');

            act(() => {
                result.current.handleNativeSelectionChange(3, 3);
            });
            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Delete'));
                result.current.syncAfterEdit({previousText: '1.2', nextText: '1.2'});
            });
            act(() => {
                result.current.syncAfterEdit({previousText: '1.2', nextText: '1.'});
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
        });
    });

    describe('moveToEnd with the caret already at the end', () => {
        it('arms no guard, so the next selection event is applied', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.moveToEnd('12');
            });
            act(() => {
                result.current.handleNativeSelectionChange(0, 0);
            });

            expect(result.current.selection).toEqual({start: 0, end: 0});
        });
    });

    describe('guards armed before the screen was left', () => {
        it('are dropped when the screen regains focus', () => {
            const {result, rerender} = renderSelection('12');

            act(() => {
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
            });

            mockUseIsFocused.mockReturnValue(false);
            rerender({displayText: '123'});
            mockUseIsFocused.mockReturnValue(true);
            rerender({displayText: '123'});

            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });
    });

    describe('handleNativeSelectionChange', () => {
        it('keeps the selection object when the reported offsets already match, so no render is triggered', () => {
            const {result} = renderSelection('123');
            const selectionBefore = result.current.selection;

            act(() => {
                result.current.handleNativeSelectionChange(3, 3);
            });

            expect(result.current.selection).toBe(selectionBefore);
        });

        it('applies the reported offsets', () => {
            const {result} = renderSelection('123');

            act(() => {
                result.current.handleNativeSelectionChange(1, 2);
            });

            expect(result.current.selection).toEqual({start: 1, end: 2});
        });

        it('clamps offsets reported past the end of the displayed text', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.handleNativeSelectionChange(5, 7);
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
        });

        it('clamps to the pending text when the event arrives before the edit renders', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.moveToEnd('12345');
            });
            act(() => {
                result.current.handleNativeSelectionChange(9, 9);
            });

            expect(result.current.selection).toEqual({start: 5, end: 5});
        });

        it('drops the stale event emitted in the same batch as a manual update', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
                result.current.handleNativeSelectionChange(0, 0);
            });

            expect(result.current.selection).toEqual({start: 3, end: 3});
        });

        it('drops the stale event even when it arrives after the manual update committed', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
            });
            act(() => {
                result.current.handleNativeSelectionChange(0, 0);
            });

            expect(result.current.selection).toEqual({start: 3, end: 3});
        });

        it('applies the event following the dropped stale one', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
            });
            act(() => {
                result.current.handleNativeSelectionChange(0, 0);
            });
            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });
    });

    describe('rejectEdit', () => {
        it('keeps the caret at its last valid position', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });
            act(() => {
                result.current.rejectEdit();
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });

        it('drops the selection event native emits for the rejected character', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.handleNativeSelectionChange(1, 1);
            });
            act(() => {
                result.current.rejectEdit();
                result.current.handleNativeSelectionChange(2, 2);
            });

            expect(result.current.selection).toEqual({start: 1, end: 1});
        });
    });
});
