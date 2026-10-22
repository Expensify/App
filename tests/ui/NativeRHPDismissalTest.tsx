import {fireEvent, render, screen} from '@testing-library/react-native';

import {animatedSuperWideRHPWidth, animatedWideRHPWidth, expandedRHPProgress, useWideRHPState} from '@components/WideRHPContextProvider';
import type * as WideRHPContextProvider from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSidePanelState from '@hooks/useSidePanelState';
import useWindowDimensions from '@hooks/useWindowDimensions';

import RightModalNavigator from '@libs/Navigation/AppNavigator/Navigators/RightModalNavigator';
import getRHPLayoutValue from '@libs/Navigation/helpers/getRHPLayoutValue';
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
import {Animated, Platform} from 'react-native';

import createMock from '../utils/createMock';

type RightModalProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useWindowDimensions', () => jest.fn());
jest.mock('@hooks/useSafeAreaInsets', () => jest.fn());
jest.mock('@hooks/useSidePanelState', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getRHPLayoutValue', () => jest.fn());
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

describe.each(['ios', 'android', 'web'] as const)('Floating RHP presentation on %s', (platform) => {
    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', platform);
        jest.mocked(getRHPLayoutValue).mockImplementation((value, animatedValue) => (platform === 'web' ? animatedValue : value));
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: false, shouldUseNarrowLayout: false});
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1440, windowHeight: 820});
        jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right: 0, bottom: 0, left: 0});
        jest.mocked(useSidePanelState).mockReturnValue(
            createMock<ReturnType<typeof useSidePanelState>>({sidePanelOffset: {current: new Animated.Value(0)}, isSidePanelTransitionEnded: true}),
        );
        animatedSuperWideRHPWidth.setValue(1080);
        animatedWideRHPWidth.setValue(925);
        expandedRHPProgress.setValue(2);
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
        expect(rootDismissal).toHaveStyle({right: 1092});
        expect(stackedDismissal).toHaveStyle({left: 0, right: width + 12, top: 0, bottom: 0});
        fireEvent.press(stackedDismissal);
        expect(dismissToPreviousRHP).toHaveBeenCalledTimes(1);

        // When the floating gaps above, below, and beside the card receive a press
        const [, , topGap, bottomGap, rightGap] = screen.getAllByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        // Then each gap stays outside the receipt and dismisses only the top panel
        expect(topGap).toHaveStyle({left: 1440 - width - 12, right: 0, top: 0, bottom: 808});
        expect(bottomGap).toHaveStyle({left: 1440 - width - 12, right: 0, top: 808, bottom: 0});
        expect(rightGap).toHaveStyle({left: 1428, right: 0, top: 0, bottom: 0});
        fireEvent.press(topGap);
        fireEvent.press(bottomGap);
        fireEvent.press(rightGap);
        expect(dismissToPreviousRHP).toHaveBeenCalledTimes(4);
    });

    it('floats an ordinary panel and keeps all outside gaps dismissible', () => {
        // Given an ordinary wide panel whose outer frame, rather than each inner screen, owns the border
        jest.mocked(useWideRHPState).mockReturnValue(defaultWideRHPStateContextValue);
        expandedRHPProgress.setValue(0);

        // When the right-modal host renders without a stacked report
        render(
            <RightModalNavigator
                navigation={createMock<RightModalProps['navigation']>({})}
                route={{key: 'right-modal', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, params: {screen: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: '1'}}}}
            />,
        );

        // Then its 440-point content plus border floats inside a 12-point gap without a full-screen hit target
        const frame = screen.UNSAFE_getAllByProps({role: 'dialog'}).find((node) => typeof node.type === 'string');
        expect(frame).toHaveStyle({width: 442, top: 12, bottom: 12, right: 12, borderRadius: 16, borderWidth: 1});
        const [rootDismissal, topGap, bottomGap, rightGap] = screen.getAllByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});
        expect(rootDismissal).toHaveStyle({right: 454});
        expect(topGap).toHaveStyle({left: 986, bottom: 808});
        expect(bottomGap).toHaveStyle({left: 986, top: 808});
        expect(rightGap).toHaveStyle({left: 1428});
    });

    it('keeps the card and dismissal bounds together while the web side panel shifts', () => {
        // Given a standalone card with Concierge open, which only web offsets horizontally
        jest.mocked(useWideRHPState).mockReturnValue(defaultWideRHPStateContextValue);
        expandedRHPProgress.setValue(0);
        const sidePanelOffset = new Animated.Value(0);
        jest.mocked(useSidePanelState).mockReturnValue(createMock<ReturnType<typeof useSidePanelState>>({sidePanelOffset: {current: sidePanelOffset}, isSidePanelTransitionEnded: true}));
        const renderPanel = () => (
            <RightModalNavigator
                navigation={createMock<RightModalProps['navigation']>({})}
                route={{key: 'right-modal', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, params: {screen: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: '1'}}}}
            />
        );
        const {rerender} = render(renderPanel());

        // When the side panel changes its animated offset after the card is mounted
        sidePanelOffset.setValue(320);
        rerender(renderPanel());
        const offset = platform === 'web' ? 320 : 0;
        const [rootDismissal, topGap, bottomGap, rightGap] = screen.getAllByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        // Then web's animated and native's static geometry both keep the hit targets outside the visible card
        const frame = screen.UNSAFE_getAllByProps({role: 'dialog'}).find((node) => typeof node.type === 'string');
        expect(frame).toHaveStyle({width: 442, right: 12 + offset});
        expect(rootDismissal).toHaveStyle({right: 454 + offset});
        expect(topGap).toHaveStyle({left: 986 - offset, bottom: 808});
        expect(bottomGap).toHaveStyle({left: 986 - offset, top: 808});
        expect(rightGap).toHaveStyle({left: 1428 - offset, right: offset});
    });

    it('keeps floating receipt edges inside the safe-area-adjusted window after resizing', () => {
        // Given a stacked transaction on a device whose outer SafeArea already removes horizontal insets
        jest.mocked(useWideRHPState).mockReturnValue({
            ...defaultWideRHPStateContextValue,
            superWideRHPRouteKeys: ['report'],
            wideRHPRouteKeys: ['transaction'],
            shouldRenderTertiaryOverlay: true,
            isWideRHPFocused: true,
        });
        const renderPanel = () => (
            <RightModalNavigator
                navigation={createMock<RightModalProps['navigation']>({})}
                route={{key: 'right-modal', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, params: {screen: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: '1'}}}}
            />
        );
        const {rerender} = render(renderPanel());

        // When rotating/resizing leaves 867 points after an 84-point horizontal inset
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 951, windowHeight: 669});
        jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right: 84, bottom: 34, left: 0});
        animatedSuperWideRHPWidth.setValue(841);
        animatedWideRHPWidth.setValue(841);
        rerender(renderPanel());
        const [rootDismissal, stackedDismissal, topGap, bottomGap, rightGap] = screen.getAllByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        // Then the inset is not subtracted twice, and the floating gaps stop at the new receipt bounds
        expect(rootDismissal).toHaveStyle({right: 853});
        expect(stackedDismissal).toHaveStyle({right: 853});
        expect(topGap).toHaveStyle({left: 14, bottom: 657});
        expect(bottomGap).toHaveStyle({left: 14, top: 657});
        expect(rightGap).toHaveStyle({left: 855, right: 0});
    });

    it('keeps a phone panel full-bleed without floating dismissal gaps', () => {
        // Given a phone-width window where the panel occupies the entire screen
        jest.mocked(useWideRHPState).mockReturnValue(defaultWideRHPStateContextValue);
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});

        // When the same right-modal host renders in narrow layout
        render(
            <RightModalNavigator
                navigation={createMock<RightModalProps['navigation']>({})}
                route={{key: 'right-modal', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, params: {screen: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: '1'}}}}
            />,
        );

        // Then tablet decoration and outside dismissal regions cannot leak into the full-screen phone flow
        expect(screen.UNSAFE_queryByProps({role: 'dialog'})).toBeNull();
        expect(screen.queryByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toBeNull();
    });
});
