import {renderHook} from '@testing-library/react-native';

import ScreenWrapperTopInsetHeaderContext from '@components/ScreenWrapper/ScreenWrapperTopInsetHeaderContext';
import type {ScreenWrapperTopInsetHeaderContextType} from '@components/ScreenWrapper/ScreenWrapperTopInsetHeaderContext';

import type StatusRingHeaderLayout from '@hooks/useStatusRingHeaderLayout/types';
import useTopInsetHeaderStyle from '@hooks/useTopInsetHeaderStyle';

import type {ReactNode} from 'react';

import React from 'react';

let mockStatusRingHeaderLayout: StatusRingHeaderLayout | undefined;

jest.mock('@hooks/useStatusRingHeaderLayout', () => () => mockStatusRingHeaderLayout);

function renderInScreen(context: ScreenWrapperTopInsetHeaderContextType, headerStyle: Parameters<typeof useTopInsetHeaderStyle>[0]) {
    return renderHook(() => useTopInsetHeaderStyle(headerStyle), {
        wrapper: ({children}: {children: ReactNode}) => <ScreenWrapperTopInsetHeaderContext.Provider value={context}>{children}</ScreenWrapperTopInsetHeaderContext.Provider>,
    });
}

describe('useTopInsetHeaderStyle', () => {
    it('moves the header into the top inset and adds the room for the status ring to its own padding', () => {
        // Given the iPhone Duo open in portrait, and a screen that leaves the top inset to its header
        mockStatusRingHeaderLayout = {topOffset: 14, bottomOffset: 4, left: 0, right: 128, height: 82};
        const unregister = jest.fn();
        const context = {isHeaderInTopInset: true, registerTopInsetHeader: jest.fn(() => unregister)};

        // When a header with its own side padding renders on that screen and later goes away
        const {result, unmount} = renderInScreen(context, {paddingLeft: 20, paddingRight: 12});
        const style = result.current;
        unmount();

        // Then the header asks the screen for the inset once, keeps its left padding, gets the ring's room on top of its
        // right padding, and gives the inset back when it goes away
        expect(context.registerTopInsetHeader).toHaveBeenCalledTimes(1);
        expect(style).toEqual({paddingTop: 14, paddingBottom: 4, minHeight: 82, paddingRight: 140});
        expect(unregister).toHaveBeenCalledTimes(1);
    });

    it('leaves the header below the top inset on devices without a status ring', () => {
        // Given a device whose status bar takes the whole top inset
        mockStatusRingHeaderLayout = undefined;
        const context = {isHeaderInTopInset: false, registerTopInsetHeader: jest.fn(() => () => {})};

        // When a header renders on a screen
        const {result} = renderInScreen(context, {paddingLeft: 20});

        // Then the screen keeps its top padding and the header keeps its own style
        expect(context.registerTopInsetHeader).not.toHaveBeenCalled();
        expect(result.current).toBeUndefined();
    });
});
