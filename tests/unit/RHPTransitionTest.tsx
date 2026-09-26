import {renderHook} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useStyleUtils from '@hooks/useStyleUtils';

import {useRHPFrameStyle, useRootRHPCardStyleInterpolator} from '@libs/Navigation/AppNavigator/useRHPTransition';
import getRHPLayoutValue from '@libs/Navigation/helpers/getRHPLayoutValue';

import CONST from '@src/CONST';

import type * as ReactNavigationStack from '@react-navigation/stack';

import {useCardAnimation} from '@react-navigation/stack';
// eslint-disable-next-line no-restricted-imports
import {Animated, Platform} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useSidePanelState', () => jest.fn());
jest.mock('@hooks/useStyleUtils', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getRHPLayoutValue', () => jest.fn());
jest.mock('@react-navigation/stack', () => ({...jest.requireActual<typeof ReactNavigationStack>('@react-navigation/stack'), useCardAnimation: jest.fn()}));

describe.each(['ios', 'android', 'web'] as const)('RHP transition ownership on %s', (platform) => {
    let animation: ReactNavigationStack.StackCardInterpolationProps;
    let sidePanelOffset: Animated.Value;

    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', platform);
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: false, shouldUseNarrowLayout: false});
        jest.mocked(getRHPLayoutValue).mockImplementation((value, animatedValue) => (platform === 'web' ? animatedValue : value));
        jest.mocked(useStyleUtils).mockReturnValue(
            createMock<ReturnType<typeof useStyleUtils>>({getCardStyles: (width) => (platform === 'web' ? {position: 'fixed', width, height: '100%'} : {})}),
        );
        sidePanelOffset = new Animated.Value(320);
        jest.mocked(useSidePanelState).mockReturnValue(createMock<ReturnType<typeof useSidePanelState>>({sidePanelOffset: {current: sidePanelOffset}, isSidePanelTransitionEnded: true}));
        animation = createMock<ReactNavigationStack.StackCardInterpolationProps>({
            current: {progress: new Animated.Value(0.25)},
            inverted: new Animated.Value(1),
            layouts: {screen: {width: 1440, height: 1000}},
        });
        jest.mocked(useCardAnimation).mockReturnValue(animation);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('keeps root geometry stationary and applies only motion and the Concierge offset to the frame', () => {
        const {result} = renderHook(() => ({root: useRootRHPCardStyleInterpolator(), frame: useRHPFrameStyle()}));
        const host = result.current.root(animation).cardStyle;

        expect(host).not.toHaveProperty('transform');
        expect(host).not.toHaveProperty('opacity');
        expect(host).not.toHaveProperty('paddingRight');
        expect(result.current.frame?.opacity).toBe(animation.current.progress);
        expect(result.current.frame?.transform).toHaveLength(1);
        expect(result.current.frame?.right).toBe(platform === 'web' ? sidePanelOffset : 0);
        expect(result.current.frame).not.toHaveProperty('width');
        expect(result.current.frame).not.toHaveProperty('height');
        expect(result.current.frame).not.toHaveProperty('position');
    });

    it('keeps the narrow-screen slide and offset on the root without another frame transform', () => {
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, isSmallScreenWidth: true, shouldUseNarrowLayout: true});
        const {result} = renderHook(() => ({root: useRootRHPCardStyleInterpolator(), frame: useRHPFrameStyle()}));
        const host = result.current.root(animation).cardStyle;

        expect(result.current.frame).toBeUndefined();
        expect(host).toHaveProperty('transform');
        expect(host).not.toHaveProperty('opacity');
        expect(host).toHaveProperty('paddingRight', platform === 'web' ? sidePanelOffset : 0);
    });
});
