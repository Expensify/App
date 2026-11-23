import {render} from '@testing-library/react-native';

import VerticalBarActionItems from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/VerticalBarActionItems/index.ios';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import React from 'react';

type BarOptions = Pick<NativeStackNavigationOptions, 'headerShown' | 'unstable_headerRightItems'>;
type BarButton = {label: string; onPress: () => void};

const mockSetOptions = jest.fn<void, [BarOptions]>();
const mockToggleCreateMenu = jest.fn();
const mockStartQuickScanFromCameraButton = jest.fn();
let mockWindowHeight = 669;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({setOptions: mockSetOptions}),
}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 951, windowHeight: mockWindowHeight}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility', () => () => ({
    isCreateMenuVisible: false,
    hideCreateMenu: jest.fn(),
    toggleCreateMenu: mockToggleCreateMenu,
}));
jest.mock('@pages/inbox/sidebar/FABPopoverContent/useScanActions', () => () => ({startQuickScanFromCameraButton: mockStartQuickScanFromCameraButton}));
jest.mock('@pages/inbox/sidebar/FABPopoverContent/CreateMenuPopover', () => () => null);

function getLastOptions(): BarOptions | undefined {
    return mockSetOptions.mock.calls.at(-1)?.[0];
}

/** The buttons among the bar items the screen was last given, as UIKit would get them. */
function getBarButtons(): BarButton[] {
    const items = getLastOptions()?.unstable_headerRightItems?.({canGoBack: false}) ?? [];
    return items.flatMap((item) => (item.type === 'button' ? [{label: item.label, onPress: item.onPress}] : []));
}

describe('VerticalBarActionItems', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWindowHeight = 669;
    });

    it('gives the screen a scan item over a create item, and takes both away with the header once it is gone', () => {
        // Given the iPhone Duo open in landscape, whose vertical bar is as tall as its 669pt window
        const {unmount} = render(<VerticalBarActionItems />);
        const items = getBarButtons();

        // When each item is pressed, and then the tab bar leaves the vertical bar
        items.at(0)?.onPress();
        items.at(1)?.onPress();
        unmount();

        // Then scan sits over create as the floating buttons do, each press reaches its own action, and the screen is
        // left with a hidden header that has no items
        expect(items.map((item) => item.label)).toEqual(['sidebarScreen.fabScanReceiptExplained', 'accessibilityHints.openActionsMenu']);
        expect(mockStartQuickScanFromCameraButton).toHaveBeenCalledTimes(1);
        expect(mockToggleCreateMenu).toHaveBeenCalledTimes(1);
        expect(getLastOptions()?.headerShown).toBe(false);
        expect(getLastOptions()?.unstable_headerRightItems).toBeUndefined();
    });

    it('keeps only the create item in a bar too short for two', () => {
        // Given the iPhone Duo folded in landscape, whose 466pt bar has room for one item above the tab column
        mockWindowHeight = 466;

        // When the items are set
        render(<VerticalBarActionItems />);

        // Then only create is there, because UIKit would draw a second item over the tabs and the create menu leads to a scan too
        expect(getBarButtons().map((item) => item.label)).toEqual(['accessibilityHints.openActionsMenu']);
    });
});
