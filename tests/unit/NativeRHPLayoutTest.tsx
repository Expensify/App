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
        // Given a wide native window where the root card must not slide the whole split layout
        // When the root host and its panel read the same navigation progress
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), frame: useRHPFrameStyle()}));
        const host = result.current.root.rightModalNavigator.web?.cardStyleInterpolator?.(animation).cardStyle;

        // Then only the panel moves and fades, leaving the underlying layout stationary
        expect(host).not.toHaveProperty('transform');
        expect(host).not.toHaveProperty('opacity');
        expect(result.current.frame).toHaveProperty('opacity', animation.current.progress);
        expect(result.current.frame?.transform[0]).toHaveProperty('translateX');
    });

    it('keeps narrow motion on the root card without applying a second panel transform', () => {
        // Given a phone layout whose root card already supplies the full-width slide
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});
        // When the root host and panel calculate their animation styles
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), frame: useRHPFrameStyle()}));

        // Then the panel avoids a second transform that would double the slide distance
        expect(result.current.frame).toBeUndefined();
        expect(result.current.root.rightModalNavigator.web?.cardStyleInterpolator?.(animation).cardStyle).toHaveProperty('transform');
    });

    it('preserves the shared interpolator used by the independent MFA navigator', () => {
        // Given the shared interpolator also serves navigators outside the RHP frame
        const {result} = renderHook(() => useModalCardStyleInterpolator());
        // When an independent navigator requests its own slide
        const style = result.current({props: animation, enter: {kind: 'slide-from-width'}}).cardStyle;

        // Then the shared interpolator retains motion without imposing the RHP fade
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
        expect(StyleSheet.flatten(expense.native?.contentStyle)).toMatchObject({width: 1080, maxWidth: '100%'});
        expect(StyleSheet.flatten(transaction.native?.contentStyle)).toMatchObject({width: 925, maxWidth: '100%'});
        expect(StyleSheet.flatten(detail.native?.contentStyle)).toMatchObject({width: 440, maxWidth: '100%'});
    });

    it('fills an ordinary native panel even without a wide report underneath', () => {
        // Given a standalone form whose 440-point frame must not inherit the unrelated sidebar width
        jest.mocked(useWideRHPState).mockReturnValue(defaultWideRHPStateContextValue);

        // When the nested native stack sizes its form content
        const {result} = renderHook(() => useModalStackScreenOptions());
        const detail = result.current({route: {key: 'detail', name: 'detail'}});

        // Then the form fills the panel instead of leaving a 65-point blank strip
        expect(StyleSheet.flatten(detail.native?.contentStyle)).toMatchObject({width: 440, maxWidth: '100%'});
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
        // Given the native RHP now uses the shared JS renderer over the existing root scene
        // When root and inner screen options are converted for that renderer
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), inner: useRHPScreenOptions()}));
        // Then both layers preserve the background and their horizontal navigation gestures
        expect(convertToJSStackNavigationOptions(result.current.root.rightModalNavigator)).toMatchObject({presentation: 'transparentModal', animation: 'slide_from_right'});
        expect(convertToJSStackNavigationOptions(result.current.inner)).toMatchObject({presentation: 'transparentModal', animation: 'slide_from_right', gestureDirection: 'horizontal'});
    });

    it('lets narrow screens fill the stack without CSS-only safe-area values', () => {
        // Given a narrow device where native content must fill the available stack
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});
        // When a transaction receives its nested stack options
        const {result} = renderHook(() => ({options: useModalStackScreenOptions(), inner: useRHPScreenOptions()}));
        const transaction = result.current.options({route: {key: 'transaction', name: 'transaction'}});

        // Then no fixed tablet width constrains native content and the narrow slide remains available
        expect(StyleSheet.flatten(transaction.native?.contentStyle)).not.toHaveProperty('width');
        expect(StyleSheet.flatten(transaction.web?.cardStyle)).toEqual({height: '100%'});
        expect(convertToJSStackNavigationOptions(result.current.inner)).toMatchObject({animation: 'slide_from_right', gestureDirection: 'horizontal'});
    });

    it.each([
        ['slide_from_right', 'horizontal'],
        ['slide_from_left', 'horizontal-inverted'],
        ['slide_from_bottom', 'vertical'],
    ] as const)('converts %s for the JS renderer, independently of native-stack mappings', (animationName, gestureDirection) => {
        // Given a shared animation with conflicting native-stack-only overrides
        // When the JS renderer converts the shared options
        // Then it uses the matching JS gesture without leaking native-stack presentation options
        expect(convertToJSStackNavigationOptions({animation: animationName, native: {animation: 'simple_push', presentation: 'containedTransparentModal'}})).toEqual({
            animation: animationName,
            gestureDirection,
        });
    });

    it('preserves no-animation and explicit JS-stack overrides', () => {
        // Given screens can disable animation or explicitly opt out of the JS back gesture
        // When their options are converted for the shared renderer
        // Then neither the default gesture nor native-stack conversion overrides those choices
        expect(convertToJSStackNavigationOptions({animation: 'none'})).toEqual({animation: 'none', gestureEnabled: false});
        expect(convertToJSStackNavigationOptions({animation: 'slide_from_right', web: {gestureEnabled: false}})).toMatchObject({animation: 'slide_from_right', gestureEnabled: false});
    });
});
