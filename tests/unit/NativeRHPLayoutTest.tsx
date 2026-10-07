import {renderHook} from '@testing-library/react-native';

import WideRHPProvider, {animatedReceiptPaneRHPWidth, animatedSuperWideRHPWidth, animatedWideRHPWidth, useWideRHPState} from '@components/WideRHPContextProvider';
import type * as WideRHPContextProvider from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRHPWindowDimensions from '@hooks/useRHPWindowDimensions';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import {useRHPFrameStyle} from '@libs/Navigation/AppNavigator/useRHPTransition';
import useRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useRootNavigatorScreenOptions';
import convertToJSStackNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToJSStackNavigationOptions';

import CONST from '@src/CONST';

import type * as ReactNavigationStack from '@react-navigation/stack';

import {useCardAnimation} from '@react-navigation/stack';
// eslint-disable-next-line no-restricted-imports
import {Animated, StyleSheet} from 'react-native';

import createMock from '../utils/createMock';

type StackCardInterpolationProps = ReactNavigationStack.StackCardInterpolationProps;

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useSafeAreaInsets', () => jest.fn());
jest.mock('@hooks/useWindowDimensions', () => jest.fn());
jest.mock('@react-navigation/stack', () => ({
    ...jest.requireActual<typeof ReactNavigationStack>('@react-navigation/stack'),
    useCardAnimation: jest.fn(),
}));
jest.mock('@components/WideRHPContextProvider', () => ({
    __esModule: true,
    ...jest.requireActual<typeof WideRHPContextProvider>('@components/WideRHPContextProvider'),
    useWideRHPState: jest.fn(),
}));

describe('Native RHP layout', () => {
    let animation: StackCardInterpolationProps;

    beforeEach(() => {
        jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right: 0, bottom: 0, left: 0});
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1180, windowHeight: 820});
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: false, shouldUseNarrowLayout: false});
        jest.mocked(useWideRHPState).mockReturnValue({...defaultWideRHPStateContextValue, superWideRHPRouteKeys: ['expense'], wideRHPRouteKeys: ['transaction']});
        animation = createMock<StackCardInterpolationProps>({current: {progress: new Animated.Value(0.25)}, inverted: new Animated.Value(1), layouts: {screen: {width: 1180, height: 820}}});
        jest.mocked(useCardAnimation).mockReturnValue(animation);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('keeps the wide host stationary and applies the same root progress only to the panel', () => {
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), frame: useRHPFrameStyle()}));
        const host = result.current.root.rightModalNavigator.web?.cardStyleInterpolator?.(animation).cardStyle;

        expect(host).not.toHaveProperty('transform');
        expect(host).not.toHaveProperty('opacity');
        expect(result.current.frame).toHaveProperty('opacity', animation.current.progress);
        expect(result.current.frame?.transform[0]).toHaveProperty('translateX');
    });

    it('keeps narrow motion on the root card without applying a second panel transform', () => {
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), frame: useRHPFrameStyle()}));

        expect(result.current.frame).toBeUndefined();
        expect(result.current.root.rightModalNavigator.web?.cardStyleInterpolator?.(animation).cardStyle).toHaveProperty('transform');
    });

    it('preserves the shared interpolator used by the independent MFA navigator', () => {
        const {result} = renderHook(() => useModalCardStyleInterpolator());
        const style = result.current({props: animation, enter: {kind: 'slide-from-width'}}).cardStyle;

        expect(style).toHaveProperty('transform');
        expect(style).not.toHaveProperty('opacity');
    });

    it('keeps the transaction narrower than its underlying expense report', () => {
        // Given a tablet wide enough for the report to exceed the receipt and transaction pane width
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1440, windowHeight: 820});

        // When the report, transaction and detail cards calculate their native layout widths
        const {result} = renderHook(() => useModalStackScreenOptions());
        const expense = result.current({route: {key: 'expense', name: 'expense'}});
        const transaction = result.current({route: {key: 'transaction', name: 'transaction'}});
        const detail = result.current({route: {key: 'detail', name: 'detail'}});
        const interpolationProps = createMock<StackCardInterpolationProps>({
            current: {progress: new Animated.Value(1)},
            inverted: new Animated.Value(1),
            layouts: {screen: {width: 1440, height: 820}},
        });

        // Then widths stay numeric and each card stays full-height without the web floating-card inset
        expect(expense.web?.cardStyleInterpolator?.(interpolationProps).cardStyle).toMatchObject({width: 1080, right: 0, top: 0, bottom: 0, height: '100%'});
        expect(transaction.web?.cardStyleInterpolator?.(interpolationProps).cardStyle).toMatchObject({width: 925, right: 0, top: 0, bottom: 0, height: '100%'});
        expect(detail.web?.cardStyleInterpolator?.(interpolationProps).cardStyle).toMatchObject({width: 440, right: 0});
    });

    it.each([
        [0, 84],
        [84, 0],
        [42, 42],
    ])('keeps the report on-screen with horizontal safe-area insets of %i and %i', (left, right) => {
        // Given a 951px native window whose navigator has only 867px after SafeArea applies its horizontal insets
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 951, windowHeight: 669});
        jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right, bottom: 34, left});
        const availableWidth = 951 - left - right;
        const interpolationProps = createMock<StackCardInterpolationProps>({
            current: {progress: new Animated.Value(1)},
            inverted: new Animated.Value(1),
            layouts: {screen: {width: availableWidth, height: 669}},
        });

        // When the report card is sized inside that navigator rather than the full safe-area provider frame
        const {result} = renderHook(() => useModalStackScreenOptions());
        const expense = result.current({route: {key: 'expense', name: 'expense'}});
        const cardStyle = StyleSheet.flatten(expense.web?.cardStyleInterpolator?.(interpolationProps).cardStyle);

        // Then its left edge stays visible instead of starting at -58px and clipping the report's controls
        expect(cardStyle).toMatchObject({width: 853, right: 0});
    });

    it('updates all pane widths when only the safe-area insets change', () => {
        // Given a report sized to the full 951px window before the device reports its horizontal insets
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 951, windowHeight: 669});
        const setReportWidth = jest.spyOn(animatedSuperWideRHPWidth, 'setValue');
        const setTransactionWidth = jest.spyOn(animatedWideRHPWidth, 'setValue');
        const setReceiptWidth = jest.spyOn(animatedReceiptPaneRHPWidth, 'setValue');
        const {result, rerender} = renderHook(() => useRHPWindowDimensions(), {wrapper: WideRHPProvider});
        expect(setReportWidth).toHaveBeenLastCalledWith(925);

        // When the right inset changes without a window Dimensions event
        jest.mocked(useSafeAreaInsets).mockReturnValue({top: 0, right: 84, bottom: 34, left: 0});
        rerender({});

        // Then the frame and receipt pane share the same usable width, without removing vertical insets a second time
        expect(result.current).toEqual({windowWidth: 867, windowHeight: 669});
        expect(setReportWidth).toHaveBeenLastCalledWith(853);
        expect(setTransactionWidth).toHaveBeenLastCalledWith(853);
        expect(setReceiptWidth).toHaveBeenLastCalledWith(393);
    });

    it('retains the base scene and uses JS-stack horizontal transitions on native', () => {
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), inner: useRHPScreenOptions()}));
        expect(convertToJSStackNavigationOptions(result.current.root.rightModalNavigator)).toMatchObject({presentation: 'transparentModal', animation: 'slide_from_right'});
        expect(convertToJSStackNavigationOptions(result.current.inner)).toMatchObject({presentation: 'transparentModal', animation: 'slide_from_right', gestureDirection: 'horizontal'});
    });

    it('lets narrow screens fill the stack without CSS-only safe-area values', () => {
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});
        const {result} = renderHook(() => ({options: useModalStackScreenOptions(), inner: useRHPScreenOptions()}));
        const transaction = result.current.options({route: {key: 'transaction', name: 'transaction'}});

        expect(StyleSheet.flatten(transaction.web?.cardStyle)).toEqual({height: '100%'});
        expect(convertToJSStackNavigationOptions(result.current.inner)).toMatchObject({animation: 'slide_from_right', gestureDirection: 'horizontal'});
    });

    it.each([
        ['slide_from_right', 'horizontal'],
        ['slide_from_left', 'horizontal-inverted'],
        ['slide_from_bottom', 'vertical'],
    ] as const)('converts %s for the JS renderer, independently of native-stack mappings', (animationName, gestureDirection) => {
        expect(convertToJSStackNavigationOptions({animation: animationName, native: {animation: 'simple_push', presentation: 'containedTransparentModal'}})).toEqual({
            animation: animationName,
            gestureDirection,
        });
    });

    it('preserves no-animation and explicit JS-stack overrides', () => {
        expect(convertToJSStackNavigationOptions({animation: 'none'})).toEqual({animation: 'none', gestureEnabled: false});
        expect(convertToJSStackNavigationOptions({animation: 'slide_from_right', web: {gestureEnabled: false}})).toMatchObject({animation: 'slide_from_right', gestureEnabled: false});
    });
});
