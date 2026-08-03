import {fireEvent, render, screen} from '@testing-library/react-native';

import {resolvePopoverLauncherElement, setActivePopoverLauncher} from '@libs/LauncherStack';

import FloatingActionButtonAndPopover from '@pages/inbox/sidebar/FloatingActionButtonAndPopover';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

let mockIsFocused = true;
let mockShouldUseNarrowLayout = false;

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    useIsFocused: () => mockIsFocused,
    useFocusEffect: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({
    shouldUseNarrowLayout: mockShouldUseNarrowLayout,
    isSmallScreenWidth: mockShouldUseNarrowLayout,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    isMediumScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isLargeScreenWidth: !mockShouldUseNarrowLayout,
    isSmallScreen: mockShouldUseNarrowLayout,
}));

jest.mock('@libs/LauncherStack', () => ({
    resolvePopoverLauncherElement: jest.fn(),
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
    pickLauncher: jest.fn(() => null),
    consumeLauncher: jest.fn(),
    resetLauncherStackForTests: jest.fn(),
}));

const FAB_TEST_ID = 'mock-fab';

// The real FAB pulls in reanimated and Svg; a bare Pressable is enough to drive toggleCreateMenu.
jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABButtons', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module
    const {Pressable} = jest.requireActual('react-native');
    return ({onPress}: {onPress: () => void}) => (
        <Pressable
            testID={FAB_TEST_ID}
            accessibilityRole="button"
            onPress={onPress}
        />
    );
});

const latestMenuProps: {current: {isVisible?: boolean} | null} = {current: null};

jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABPopoverMenu', () => (props: {isVisible?: boolean}) => {
    latestMenuProps.current = props;
    return null;
});

const mockAnchor = document.createElement('div');

describe('FloatingActionButtonAndPopover launcher registration', () => {
    beforeEach(() => {
        mockIsFocused = true;
        mockShouldUseNarrowLayout = false;
        latestMenuProps.current = null;
        jest.clearAllMocks();
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(mockAnchor);
    });

    it('registers the FAB as the launcher when the menu opens', () => {
        render(<FloatingActionButtonAndPopover />);

        fireEvent.press(screen.getByTestId(FAB_TEST_ID));

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(mockAnchor);
        expect(latestMenuProps.current?.isVisible).toBe(true);
    });

    it('does not register a launcher when the press closes an already-open menu', () => {
        render(<FloatingActionButtonAndPopover />);

        fireEvent.press(screen.getByTestId(FAB_TEST_ID));
        jest.mocked(setActivePopoverLauncher).mockClear();

        fireEvent.press(screen.getByTestId(FAB_TEST_ID));

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(latestMenuProps.current?.isVisible).toBe(false);
    });

    it('does not register a launcher when showCreateMenu bails out on an unfocused narrow layout', () => {
        // The menu never opens here, so no onModalHide would ever fire to deactivate a registered entry —
        // registering anyway would leave the FAB lingering as an active launcher.
        mockIsFocused = false;
        mockShouldUseNarrowLayout = true;
        render(<FloatingActionButtonAndPopover />);

        fireEvent.press(screen.getByTestId(FAB_TEST_ID));

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(latestMenuProps.current?.isVisible).toBe(false);
    });

    it('does not register anything when the anchor has no host node (native)', () => {
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(null);
        render(<FloatingActionButtonAndPopover />);

        fireEvent.press(screen.getByTestId(FAB_TEST_ID));

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(latestMenuProps.current?.isVisible).toBe(true);
    });
});
