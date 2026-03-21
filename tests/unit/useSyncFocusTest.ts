import {renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import useSyncFocus from '@hooks/useSyncFocus/useSyncFocusImplementation';

describe('useSyncFocus', () => {
    it('useSyncFocus should only focus if shouldSyncFocus is true', () => {
        const refMock = {current: {focus: jest.fn()}};

        // When useSyncFocus is rendered initially while shouldSyncFocus is false.
        const {rerender} = renderHook(
            ({
                ref = refMock,
                isFocused = true,
                shouldSyncFocus = false,
            }: {
                isFocused?: boolean;
                shouldSyncFocus?: boolean;
                ref?: {
                    current: {
                        focus: jest.Mock;
                    };
                };
            }) => useSyncFocus(ref as unknown as RefObject<View>, isFocused, shouldSyncFocus),
            {initialProps: {}},
        );
        // Then the ref focus will not be called.
        expect(refMock.current.focus).not.toHaveBeenCalled();

        rerender({isFocused: false});
        expect(refMock.current.focus).not.toHaveBeenCalled();

        // When shouldSyncFocus and isFocused are true
        rerender({isFocused: true, shouldSyncFocus: true});

        // Then the ref focus will be called.
        expect(refMock.current.focus).toHaveBeenCalled();
    });
});
