import {render, screen} from '@testing-library/react-native';

import VerticalBarActionItems from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarActionItems/index.ios';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type ReactNative from 'react-native';

import React from 'react';

type BarOptions = Pick<NativeStackNavigationOptions, 'headerShown' | 'unstable_headerRightItems'>;

const mockScanButtonTestID = 'scan-button';
const mockCreateButtonTestID = 'create-button';

const mockSetOptions = jest.fn<void, [BarOptions]>();
let mockWindow = {windowWidth: 951, windowHeight: 669};

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({setOptions: mockSetOptions}),
}));
jest.mock('@hooks/useWindowDimensions', () => () => mockWindow);
// The buttons stand in for the floating ones, which need Onyx and a navigator. The items only have to hold them.
jest.mock('@components/FloatingCameraButton', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return () => MockReact.createElement(View, {testID: mockScanButtonTestID});
});
jest.mock('@pages/inbox/sidebar/NavigationTabBarFloatingActionButton', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return () => MockReact.createElement(View, {testID: mockCreateButtonTestID});
});

/** The options the screen has after every call so far, merged as React Navigation merges them. */
function getOptions(): BarOptions {
    const options: BarOptions = {};
    for (const [update] of mockSetOptions.mock.calls) {
        Object.assign(options, update);
    }
    return options;
}

/** The button each bar item of the screen holds, in the order UIKit would stack the items. */
function getBarItemButtons() {
    const items = getOptions().unstable_headerRightItems?.({canGoBack: false}) ?? [];
    return items.map((item) => {
        if (item.type !== 'custom') {
            return item.type;
        }
        const {unmount} = render(item.element);
        const button = [mockScanButtonTestID, mockCreateButtonTestID].find((testID) => !!screen.queryByTestId(testID));
        unmount();
        return button;
    });
}

describe('VerticalBarActionItems', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWindow = {windowWidth: 951, windowHeight: 669};
    });

    it.each([
        ['open in landscape, whose bar is as tall as its 669pt window', {windowWidth: 951, windowHeight: 669}],
        ['folded in portrait, whose bar is as tall as its 678pt window', {windowWidth: 466, windowHeight: 678}],
    ])('gives the screen the scan button over the create button on a phone %s, and takes both away with the header once it is gone', (_, window) => {
        // Given a vertical bar tall enough for both buttons above the tab column
        mockWindow = window;

        // When the items are set, and then the tab bar leaves the vertical bar
        const {unmount} = render(<VerticalBarActionItems />);
        const buttons = getBarItemButtons();
        const wasHeaderShown = getOptions().headerShown;
        unmount();

        // Then the items held the floating buttons themselves, scan over create as they float, in a bar UIKit shows, and
        // the screen is left with a hidden header that has no items
        expect(buttons).toEqual([mockScanButtonTestID, mockCreateButtonTestID]);
        expect(wasHeaderShown).toBe(true);
        expect(getOptions().headerShown).toBe(false);
        expect(getOptions().unstable_headerRightItems).toBeUndefined();
    });

    it('gives the screen only the create button on a phone folded in landscape', () => {
        // Given the cover panel of the iPhone Duo in landscape, whose 466pt bar has room for one item above the tab column
        mockWindow = {windowWidth: 678, windowHeight: 466};

        // When the items are set
        render(<VerticalBarActionItems />);

        // Then the create button is the only item, because UIKit would draw a second one over the tab column
        expect(getBarItemButtons()).toEqual([mockCreateButtonTestID]);
    });
});
