import {renderHook} from '@testing-library/react-native';

import useSyncFocus from '@hooks/useSyncFocus/useSyncFocusImplementation';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import createMock from '../utils/createMock';

describe('useSyncFocus', () => {
    it('useSyncFocus should only focus if shouldSyncFocus is true', () => {
        const focusMock = jest.fn();
        const refMock: RefObject<View | null> = {current: createMock<View>({focus: focusMock})};

        // When useSyncFocus is rendered initially while shouldSyncFocus is false.
        const {rerender} = renderHook(
            ({ref = refMock, isFocused = true, shouldSyncFocus = false}: {isFocused?: boolean; shouldSyncFocus?: boolean; ref?: RefObject<View | null>}) =>
                useSyncFocus(ref, isFocused, shouldSyncFocus),
            {initialProps: {}},
        );
        // Then the ref focus will not be called.
        expect(focusMock).not.toHaveBeenCalled();

        rerender({isFocused: false});
        expect(focusMock).not.toHaveBeenCalled();

        // When shouldSyncFocus and isFocused are true
        rerender({isFocused: true, shouldSyncFocus: true});

        // Then the ref focus will be called.
        expect(focusMock).toHaveBeenCalled();
    });
});
