import {fireEvent, render, screen} from '@testing-library/react-native';

import {useWideRHPState} from '@components/WideRHPContextProvider';
import type * as WideRHPContextProvider from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import RightModalNavigator from '@libs/Navigation/AppNavigator/Navigators/RightModalNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type * as ReactNavigationStack from '@react-navigation/stack';

import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import createMock from '../utils/createMock';

type RightModalProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useWindowDimensions', () => jest.fn());
jest.mock('@hooks/useSafeAreaInsets', () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
}));
jest.mock('@react-navigation/stack', () => ({
    ...jest.requireActual<typeof ReactNavigationStack>('@react-navigation/stack'),
    useCardAnimation: jest.fn(),
}));
jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<typeof WideRHPContextProvider>('@components/WideRHPContextProvider'),
    useWideRHPState: jest.fn(),
}));
// Keep the production navigator's overlays and geometry, without mounting unrelated modal screens.
jest.mock('@libs/Navigation/AppNavigator/ModalStackNavigators', () => ({}));
jest.mock('@navigation/AppNavigator/createRightModalNavigator', () => () => ({Navigator: () => null, Screen: () => null}));

describe('Native stacked RHP dismissal', () => {
    beforeEach(() => {
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: false, shouldUseNarrowLayout: false});
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1440, windowHeight: 820});
        jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right: 0, bottom: 0, left: 0});
        jest.mocked(useCardAnimation).mockReturnValue(
            createMock<ReactNavigationStack.StackCardInterpolationProps>({
                current: {progress: new Animated.Value(1)},
                inverted: new Animated.Value(1),
                layouts: {screen: {width: 1440, height: 820}},
            }),
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        [true, 925],
        [false, 440],
    ])('keeps full-height dismissal outside the focused card, wide transaction: %s', (isWideRHPFocused, width) => {
        // Given a super-wide report underneath either its transaction or an ordinary detail panel
        jest.mocked(useWideRHPState).mockReturnValue({
            ...defaultWideRHPStateContextValue,
            superWideRHPRouteKeys: ['report'],
            wideRHPRouteKeys: ['transaction'],
            shouldRenderTertiaryOverlay: true,
            isWideRHPFocused,
        });
        const dismissToPreviousRHP = jest.spyOn(Navigation, 'dismissToPreviousRHP').mockImplementation(() => {});

        // When the real right-modal navigator positions its production dismissal overlays
        render(
            <RightModalNavigator
                navigation={createMock<RightModalProps['navigation']>({})}
                route={{key: 'right-modal', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, params: {screen: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: '1'}}}}
            />,
        );
        const [rootDismissal, stackedDismissal] = screen.getAllByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        // Then the exposed report dismisses one level, but the hit target cannot cover the focused card's receipt
        expect(rootDismissal).toHaveStyle({right: 1080});
        expect(stackedDismissal).toHaveStyle({left: 0, right: width, top: 0, bottom: 0});
        fireEvent.press(stackedDismissal);
        expect(dismissToPreviousRHP).toHaveBeenCalledTimes(1);
    });
});
