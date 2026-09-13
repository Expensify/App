import {renderHook} from '@testing-library/react-native';

import {useWideRHPState} from '@components/WideRHPContextProvider';
import type * as WideRHPContextProvider from '@components/WideRHPContextProvider';
import {defaultWideRHPStateContextValue} from '@components/WideRHPContextProvider/default';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import {useRHPFrameStyle} from '@libs/Navigation/AppNavigator/useRHPTransition';
import useRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useRootNavigatorScreenOptions';
import convertToJSStackNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToJSStackNavigationOptions';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import {useCardAnimation} from '@react-navigation/stack';
// eslint-disable-next-line no-restricted-imports
import {Animated, StyleSheet} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useWindowDimensions', () => jest.fn());
jest.mock('@react-navigation/stack', () => ({
    ...jest.requireActual('@react-navigation/stack'),
    useCardAnimation: jest.fn(),
}));
jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<typeof WideRHPContextProvider>('@components/WideRHPContextProvider'),
    useWideRHPState: jest.fn(),
}));

describe('Native RHP layout', () => {
    let animation: StackCardInterpolationProps;

    beforeEach(() => {
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: 1180, windowHeight: 820});
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: false, shouldUseNarrowLayout: false});
        jest.mocked(useWideRHPState).mockReturnValue({...defaultWideRHPStateContextValue, superWideRHPRouteKeys: ['expense'], wideRHPRouteKeys: ['transaction']});
        animation = createMock<StackCardInterpolationProps>({current: {progress: new Animated.Value(0.25)}, inverted: new Animated.Value(1), layouts: {screen: {width: 1180, height: 820}}});
        jest.mocked(useCardAnimation).mockReturnValue(animation);
    });

    it('keeps the wide host stationary and applies the same root progress only to the panel', () => {
        const {result} = renderHook(() => ({root: useRootNavigatorScreenOptions(), frame: useRHPFrameStyle()}));
        const host = result.current.root.rightModalNavigator.web?.cardStyleInterpolator?.(animation).cardStyle;

        expect(host).not.toHaveProperty('transform');
        expect(host).not.toHaveProperty('opacity');
        expect(result.current.frame).toMatchObject({opacity: animation.current.progress, transform: [{translateX: expect.anything()}]});
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
        const {result} = renderHook(() => useModalStackScreenOptions());
        const expense = result.current({route: {key: 'expense', name: 'expense'}});
        const transaction = result.current({route: {key: 'transaction', name: 'transaction'}});
        const detail = result.current({route: {key: 'detail', name: 'detail'}});
        const interpolationProps = createMock<StackCardInterpolationProps>({
            current: {progress: new Animated.Value(1)},
            inverted: new Animated.Value(1),
            layouts: {screen: {width: 1180, height: 820}},
        });

        expect(expense.web?.cardStyleInterpolator?.(interpolationProps).cardStyle).toMatchObject({width: 1033, right: 0});
        expect(transaction.web?.cardStyleInterpolator?.(interpolationProps).cardStyle).toMatchObject({width: 840, right: 0});
        expect(detail.web?.cardStyleInterpolator?.(interpolationProps).cardStyle).toMatchObject({width: 375, right: 0});
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
    ] as const)('converts %s for the JS renderer, independently of native-stack mappings', (animation, gestureDirection) => {
        expect(convertToJSStackNavigationOptions({animation, native: {animation: 'simple_push', presentation: 'containedTransparentModal'}})).toEqual({animation, gestureDirection});
    });

    it('preserves no-animation and explicit JS-stack overrides', () => {
        expect(convertToJSStackNavigationOptions({animation: 'none'})).toEqual({animation: 'none', gestureEnabled: false});
        expect(convertToJSStackNavigationOptions({animation: 'slide_from_right', web: {gestureEnabled: false}})).toMatchObject({animation: 'slide_from_right', gestureEnabled: false});
    });
});
