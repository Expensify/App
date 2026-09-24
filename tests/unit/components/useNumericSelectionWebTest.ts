import {act, renderHook} from '@testing-library/react-native';

import useNumericSelection from '@components/NumericEditingController/hooks/useNumericSelection';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import type * as NativeNavigation from '@react-navigation/native';

// On web the flag is false: the browser does not echo a stale selection event after a controlled update,
// so selection events arriving after a manual update must be applied instead of dropped.
jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: false,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

const renderSelection = (displayText = '12') => renderHook((props: {displayText: string}) => useNumericSelection(props), {initialProps: {displayText}});

describe('useNumericSelection on web', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('applies the selection event that follows a manual update', () => {
        const {result} = renderSelection('12');

        act(() => {
            result.current.syncAfterEdit({previousText: '12', nextText: '123'});
        });
        act(() => {
            result.current.handleNativeSelectionChange(1, 1);
        });

        expect(result.current.selection).toEqual({start: 1, end: 1});
    });

    it('still drops the selection event native emits for a rejected edit', () => {
        const {result} = renderSelection('12');

        act(() => {
            result.current.handleNativeSelectionChange(1, 1);
        });
        act(() => {
            result.current.rejectEdit();
            result.current.handleNativeSelectionChange(2, 2);
        });

        // The rejected-input guard is independent of the platform flag.
        expect(result.current.selection).toEqual({start: 1, end: 1});
    });
});
