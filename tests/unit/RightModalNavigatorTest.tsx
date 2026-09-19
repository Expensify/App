import {fireEvent, render, screen} from '@testing-library/react-native';

import RightModalNavigator from '@libs/Navigation/AppNavigator/Navigators/RightModalNavigator';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {AuthScreensParamList} from '@navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

// eslint-disable-next-line no-restricted-imports
import type {Animated, Pressable} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {
        ENVIRONMENT: 'DEV',
        IS_USING_LOCAL_WEB: false,
    },
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        alert: jest.fn(),
    },
}));

jest.mock('@pages/MissingPersonalDetails/PINContext', () => ({
    PINContextProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@pages/Search/SearchAdvancedFiltersProvider', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn(),
        closeRHPFlow: jest.fn(),
        dismissToPreviousRHP: jest.fn(),
    },
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@libs/actions/Transaction', () => ({
    abandonReviewDuplicateTransactions: jest.fn(),
}));

jest.mock('@libs/actions/TwoFactorAuthActions', () => ({
    clearTwoFactorAuthData: jest.fn(),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

jest.mock('@libs/Navigation/AppNavigator/ModalStackNavigators', () => {
    const mockComponent = () => null;
    return new Proxy(
        {},
        {
            get: () => mockComponent,
        },
    );
});

type CONSTModule = {default: typeof CONST};

jest.mock('@libs/Navigation/AppNavigator/Navigators/Overlay', () => {
    const {createElement} = jest.requireActual<{createElement: typeof React.createElement}>('react');
    const {Pressable: RNPressable} = jest.requireActual<{Pressable: typeof Pressable}>('react-native');
    const MockCONST = jest.requireActual<CONSTModule>('@src/CONST').default;

    return function MockOverlay({onPress}: {onPress?: () => void}) {
        return createElement(RNPressable, {
            testID: MockCONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID,
            onPress,
        });
    };
});

jest.mock('@hooks/useResponsiveLayout', () => () => ({
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
}));

jest.mock('@hooks/useSidePanelState', () => {
    const {Animated: RNAnimated} = jest.requireActual<{Animated: typeof Animated}>('react-native');
    return () => ({
        sidePanelOffset: {current: new RNAnimated.Value(0)},
    });
});

jest.mock('@components/WideRHPContextProvider', () => {
    const {Animated: RNAnimated} = jest.requireActual<{Animated: typeof Animated}>('react-native');
    return {
        useWideRHPState: () => ({
            superWideRHPRouteKeys: [],
            wideRHPRouteKeys: [],
            shouldRenderSecondaryOverlayForWideRHP: false,
            shouldRenderSecondaryOverlayForRHPOnWideRHP: false,
            shouldRenderSecondaryOverlayForRHPOnSuperWideRHP: false,
            shouldRenderTertiaryOverlay: false,
        }),
        useWideRHPActions: () => ({
            syncRHPKeys: jest.fn(),
            clearWideRHPKeys: jest.fn(),
        }),
        animatedWideRHPWidth: new RNAnimated.Value(0),
        expandedRHPProgress: new RNAnimated.Value(0),
        secondOverlayRHPOnSuperWideRHPProgress: new RNAnimated.Value(0),
        secondOverlayRHPOnWideRHPProgress: new RNAnimated.Value(0),
        secondOverlayWideRHPProgress: new RNAnimated.Value(0),
        thirdOverlayProgress: new RNAnimated.Value(0),
    };
});

type NavigationProp = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>['navigation'];
type RouteProp = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>['route'];

// The mocked navigationRef has no `this` usage in its methods, so unbinding the references is safe.
/* eslint-disable @typescript-eslint/unbound-method */
const mockGetRootState = jest.mocked(navigationRef.getRootState);
/* eslint-enable @typescript-eslint/unbound-method */

describe('RightModalNavigator overlay press', () => {
    const mockNavigation = createMock<NavigationProp>({
        navigate: jest.fn(),
        goBack: jest.fn(),
        dispatch: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
        removeListener: jest.fn(),
        reset: jest.fn(),
        isFocused: jest.fn(() => true),
        canGoBack: jest.fn(() => true),
    });

    const mockRoute = createMock<RouteProp>({
        key: 'right-modal-route-key',
        name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
        params: {screen: SCREENS.RIGHT_MODAL.SETTINGS},
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('invokes Navigation.dismissModal when clicking the overlay backdrop and RHP is active', () => {
        mockGetRootState.mockReturnValue({
            key: 'root-key',
            index: 1,
            routeNames: [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR],
            routes: [
                {key: 'tab-nav', name: NAVIGATORS.TAB_NAVIGATOR},
                {key: 'right-modal-key', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
            ],
            type: 'stack',
            stale: false,
        });

        render(
            <NavigationContainer>
                <RightModalNavigator
                    navigation={mockNavigation}
                    route={mockRoute}
                />
            </NavigationContainer>,
        );

        const overlayBottomButton = screen.getByTestId(CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID);
        fireEvent.press(overlayBottomButton);

        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });

    it('does not invoke Navigation.dismissModal when RHP is not the topmost route (e.g. closing animation edge case)', () => {
        mockGetRootState.mockReturnValue({
            key: 'root-key',
            index: 1,
            routeNames: [NAVIGATORS.RIGHT_MODAL_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR],
            routes: [
                {key: 'right-modal-key', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                {key: 'tab-nav', name: NAVIGATORS.TAB_NAVIGATOR},
            ],
            type: 'stack',
            stale: false,
        });

        render(
            <NavigationContainer>
                <RightModalNavigator
                    navigation={mockNavigation}
                    route={mockRoute}
                />
            </NavigationContainer>,
        );

        const overlayBottomButton = screen.getByTestId(CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID);
        fireEvent.press(overlayBottomButton);

        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('invokes Navigation.dismissModal when clicking overlay on a multi-step RHP stack', () => {
        mockGetRootState.mockReturnValue({
            key: 'root-key',
            index: 1,
            routeNames: [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR],
            routes: [
                {key: 'tab-nav', name: NAVIGATORS.TAB_NAVIGATOR},
                {
                    key: 'right-modal-key',
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        key: 'stack-sub-key',
                        index: 1,
                        routeNames: [SCREENS.SETTINGS.PROFILE.ROOT, SCREENS.SETTINGS.PROFILE.DISPLAY_NAME],
                        routes: [
                            {key: 'profile-root', name: SCREENS.SETTINGS.PROFILE.ROOT},
                            {key: 'profile-display-name', name: SCREENS.SETTINGS.PROFILE.DISPLAY_NAME},
                        ],
                        type: 'stack',
                        stale: false,
                    },
                },
            ],
            type: 'stack',
            stale: false,
        });

        render(
            <NavigationContainer>
                <RightModalNavigator
                    navigation={mockNavigation}
                    route={mockRoute}
                />
            </NavigationContainer>,
        );

        const overlayBottomButton = screen.getByTestId(CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID);
        fireEvent.press(overlayBottomButton);

        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });
});
