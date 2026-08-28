import {act, renderHook} from '@testing-library/react-native';

import useNumericSelection from '@components/NumericEditingController/hooks/useNumericSelection';
import type {NumericEditingKeyPressEvent} from '@components/NumericEditingController/types';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import * as NativeNavigation from '@react-navigation/native';

// `shouldIgnoreSelectionWhenUpdatedManually` is `true` on native only, so this suite mocks it for the whole file the
// way NumericFieldSelectionGuardTest does: the guards it gates are what this hook exists to own.
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

        it('shifts the caret back when backspace shrinks the text', () => {
            const {result} = renderSelection('123');

            act(() => {
                result.current.handleKeyPress(buildKeyPressEvent('Backspace'));
                result.current.syncAfterEdit({previousText: '123', nextText: '12'});
            });

            expect(result.current.selection).toEqual({start: 2, end: 2});
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

    describe('handleNativeSelectionChange', () => {
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

        it('applies an event arriving after the manual update committed', () => {
            const {result} = renderSelection('12');

            act(() => {
                result.current.syncAfterEdit({previousText: '12', nextText: '123'});
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
