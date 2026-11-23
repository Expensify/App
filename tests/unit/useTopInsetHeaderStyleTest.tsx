import {render, screen} from '@testing-library/react-native';

import ScreenWrapperTopInsetHeaderContext from '@components/ScreenWrapper/ScreenWrapperTopInsetHeaderContext';
import useTopInsetHeaderContextValue from '@components/ScreenWrapper/useTopInsetHeaderContextValue';

import type StatusRingHeaderLayout from '@hooks/useStatusRingHeaderLayout/types';
import useTopInsetHeaderStyle from '@hooks/useTopInsetHeaderStyle';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

let mockStatusRingHeaderLayout: StatusRingHeaderLayout | undefined;

jest.mock('@hooks/useStatusRingHeaderLayout', () => () => mockStatusRingHeaderLayout);

/** Shows whether the screen left the top inset to a header, so the tests can read it from the rendered output */
function TestScreen({children}: {children: ReactNode}) {
    const {isHeaderInTopInset, topInsetHeaderContextValue} = useTopInsetHeaderContextValue(true);
    return (
        <ScreenWrapperTopInsetHeaderContext.Provider value={topInsetHeaderContextValue}>
            {isHeaderInTopInset && <View testID="headerInTopInset" />}
            {children}
        </ScreenWrapperTopInsetHeaderContext.Provider>
    );
}

function TestHeader({name, headerStyle}: {name: string; headerStyle?: StyleProp<ViewStyle>}) {
    const topInsetHeaderStyle = useTopInsetHeaderStyle(headerStyle);
    return (
        <View
            testID={name}
            style={topInsetHeaderStyle}
        />
    );
}

function isScreenHeaderInTopInset() {
    return !!screen.queryByTestId('headerInTopInset');
}

function getHeaderStyle(name: string): unknown {
    return screen.getByTestId(name).props.style;
}

describe('useTopInsetHeaderStyle', () => {
    it('moves the header into the top inset and adds the room for the status ring to its own padding', () => {
        // Given the iPhone Duo open in portrait
        mockStatusRingHeaderLayout = {topOffset: 14, bottomOffset: 4, left: 0, right: 128, height: 82};

        // When a header with its own side padding renders on a screen
        const {rerender} = render(
            <TestScreen>
                <TestHeader
                    name="main"
                    headerStyle={{paddingLeft: 20, paddingRight: 12}}
                />
            </TestScreen>,
        );

        // Then the screen leaves the top inset to the header, which keeps its left padding and gets the ring's room on top
        // of its right padding
        expect(isScreenHeaderInTopInset()).toBe(true);
        expect(getHeaderStyle('main')).toEqual({paddingTop: 14, paddingBottom: 4, minHeight: 82, paddingRight: 140});

        // When the header goes away
        rerender(<TestScreen>{null}</TestScreen>);

        // Then the screen takes the top inset back into its padding
        expect(isScreenHeaderInTopInset()).toBe(false);
    });

    it('keeps a header further down the screen below the top inset', () => {
        // Given the iPhone Duo open in portrait, and a screen with its header at the top and a second header below it,
        // like the advanced filters header with the date filter's header under it
        mockStatusRingHeaderLayout = {topOffset: 14, bottomOffset: 4, left: 0, right: 128, height: 82};

        // When both headers render
        const {rerender} = render(
            <TestScreen>
                <TestHeader name="main" />
                <TestHeader name="sub" />
            </TestScreen>,
        );

        // Then only the header at the top goes into the inset, so the second one keeps its own height
        expect(getHeaderStyle('main')).toEqual({paddingTop: 14, paddingBottom: 4, minHeight: 82, paddingRight: 128});
        expect(getHeaderStyle('sub')).toBeUndefined();

        // When the header at the top goes away and the second one stays
        rerender(
            <TestScreen>
                <TestHeader name="sub" />
            </TestScreen>,
        );

        // Then the remaining header is now the top of the screen and takes the inset over
        expect(getHeaderStyle('sub')).toEqual({paddingTop: 14, paddingBottom: 4, minHeight: 82, paddingRight: 128});
        expect(isScreenHeaderInTopInset()).toBe(true);
    });

    it('leaves the header below the top inset on devices without a status ring', () => {
        // Given a device whose status bar takes the whole top inset
        mockStatusRingHeaderLayout = undefined;

        // When a header renders on a screen
        render(
            <TestScreen>
                <TestHeader
                    name="main"
                    headerStyle={{paddingLeft: 20}}
                />
            </TestScreen>,
        );

        // Then the screen keeps its top padding and the header keeps its own style
        expect(isScreenHeaderInTopInset()).toBe(false);
        expect(getHeaderStyle('main')).toBeUndefined();
    });
});
