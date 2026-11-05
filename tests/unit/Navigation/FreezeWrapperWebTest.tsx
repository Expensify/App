import {act, render, screen} from '@testing-library/react-native';

import type FreezeWrapperType from '@libs/Navigation/AppNavigator/FreezeWrapper';

import type {ComponentProps, PropsWithChildren} from 'react';

import React, {createElement as mockCreateElement} from 'react';
import {View, View as MockView} from 'react-native';

// Jest resolves the native variant (a pass-through) for the plain module path, so the web implementation is loaded by its file path.
const FreezeWrapper = jest.requireActual<{default: typeof FreezeWrapperType}>('@libs/Navigation/AppNavigator/FreezeWrapper/index.tsx').default;

// The latest 'state' listener the wrapper subscribed, so a test can deliver a navigation state change.
let mockStateListener: ((event: {data: {state: Record<string, unknown>}}) => void) | undefined;
let mockIsScreenBlurred = false;

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        addListener: (_event: string, listener: (event: {data: {state: Record<string, unknown>}}) => void) => {
            mockStateListener = listener;
            return jest.fn();
        },
        getState: () => ({}),
    }),
    useRoute: () => ({key: 'search-tab-key'}),
}));

jest.mock('@libs/Navigation/AppNavigator/FreezeWrapper/getIsScreenBlurred', () => () => mockIsScreenBlurred);

jest.mock('@hooks/useOnyx', () => () => [false]);

// Renders whether the subtree is frozen instead of suspending it, so the test can read the wrapper's decision.
jest.mock('react-freeze', () => ({
    Freeze: ({freeze}: PropsWithChildren<{freeze: boolean}>) => mockCreateElement(MockView, {testID: 'freeze', accessibilityLabel: String(freeze)}),
}));

function renderWrapper(props: Omit<ComponentProps<typeof FreezeWrapperType>, 'children'>) {
    return render(
        <FreezeWrapper {...props}>
            <View testID="content" />
        </FreezeWrapper>,
    );
}

function blurScreen() {
    mockIsScreenBlurred = true;
    act(() => mockStateListener?.({data: {state: {}}}));
}

function isFrozen() {
    return screen.getByTestId('freeze').props.accessibilityLabel === 'true';
}

describe('FreezeWrapper (web)', () => {
    beforeEach(() => {
        mockStateListener = undefined;
        mockIsScreenBlurred = false;
    });

    it.each([
        ['freezes a blurred tab', false, true],
        // A tab preloaded at idle sits blurred behind the open one, and has to keep rendering so its mount finishes before the reveal.
        ['keeps a blurred tab rendering while it should stay unfrozen', true, false],
    ])('%s', (_description: string, shouldStayUnfrozen: boolean, expectedFrozen: boolean) => {
        // Given a wrapped tab that is or is not asked to stay unfrozen
        renderWrapper({shouldStayUnfrozen});

        // When the navigation state changes and the tab is now in the background
        blurScreen();

        // Then it only freezes when nothing asks it to keep rendering
        expect(isFrozen()).toBe(expectedFrozen);
    });

    it('freezes a background tab that stops staying unfrozen with no navigation event', () => {
        // Given a preloaded tab kept rendering in the background while its first content builds, and it is in the background
        mockIsScreenBlurred = true;
        const {rerender} = renderWrapper({shouldStayUnfrozen: true});
        expect(isFrozen()).toBe(false);

        // When its content is on screen and it may freeze, while the user stays on the same tab so no navigation event follows
        rerender(
            <FreezeWrapper shouldStayUnfrozen={false}>
                <View testID="content" />
            </FreezeWrapper>,
        );

        // Then it still freezes, instead of staying live until the next navigation happens to arrive
        expect(isFrozen()).toBe(true);
    });
});
