import {renderHook} from '@testing-library/react-native';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import useSyncFocus from '@hooks/useSyncFocus';

describe('useSyncFocus', () => {
    it('useSyncFocus should only focus when isFocused changes from false to true', () => {
        const refMock = {current: {focus: jest.fn()}};

        // When useSyncFocus is rendered initially with isFocused true
        const {rerender} = renderHook(
            ({
                ref = refMock,
                isFocused = true,
            }: {
                isFocused?: boolean;
                ref?: {
                    current: {
                        focus: jest.Mock;
                    };
                };
            }) => useSyncFocus(ref as unknown as RefObject<View>, isFocused),
            {initialProps: {}},
        );
        // Then the ref focus will not be called.
        expect(refMock.current.focus).not.toHaveBeenCalled();

        // When isFocused changes from false to true
        rerender({isFocused: false});
        rerender({isFocused: true});
        // Then the ref focus will be called.
        expect(refMock.current.focus).toHaveBeenCalled();
    });
});
