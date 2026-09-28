import {renderHook} from '@testing-library/react-native';

import type * as BrowserModule from '@libs/Browser';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';

import variables from '@styles/variables';

import type * as ReactNavigationStack from '@react-navigation/stack';

import createMock from '../utils/createMock';

type StackCardInterpolatedStyle = ReactNavigationStack.StackCardInterpolatedStyle;
type StackCardInterpolationProps = ReactNavigationStack.StackCardInterpolationProps;

const FRAME_WIDTH = 840;

let mockWideRHPRouteKeys: string[] = [];
let mockSuperWideRHPRouteKeys: string[] = [];
let mockIsSmallScreenWidth = false;
let mockIsSafari = false;

const mockStyles = {
    navigationScreenCardStyle: {height: '100%'},
    singleRHPExtendedCardInterpolatorStyles: {position: 'absolute', height: '100%', right: 0, width: variables.sideBarWidth},
    overflowHidden: {overflow: 'hidden'},
};

const mockForHorizontalIOS = jest.fn<StackCardInterpolatedStyle, [StackCardInterpolationProps]>(() => ({cardStyle: {opacity: 1}}));
const mockCustomInterpolator = jest.fn<StackCardInterpolatedStyle, [{props: StackCardInterpolationProps}]>(() => ({cardStyle: {opacity: 0.5}, containerStyle: {overflow: 'hidden'}}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPState: () => ({wideRHPRouteKeys: mockWideRHPRouteKeys, superWideRHPRouteKeys: mockSuperWideRHPRouteKeys}),
}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: mockIsSmallScreenWidth}));
jest.mock('@hooks/useThemeStyles', () => () => mockStyles);
jest.mock('@libs/Browser', () => ({...jest.requireActual<typeof BrowserModule>('@libs/Browser'), isSafari: () => mockIsSafari}));
jest.mock('@libs/Navigation/AppNavigator/useModalCardStyleInterpolator', () => () => mockCustomInterpolator);
jest.mock('@react-navigation/stack', () => ({
    ...jest.requireActual<typeof ReactNavigationStack>('@react-navigation/stack'),
    CardStyleInterpolators: {forHorizontalIOS: (props: StackCardInterpolationProps) => mockForHorizontalIOS(props)},
}));

/** Only the frame's measurements are read, so a real card's animated nodes are left out. */
function buildInterpolationProps(): StackCardInterpolationProps {
    return createMock<StackCardInterpolationProps>({
        index: 1,
        layouts: {screen: {width: FRAME_WIDTH, height: 800}},
        insets: {top: 0, right: 0, bottom: 0, left: 0},
    });
}

/** Runs the card interpolator the RHP's own stack hands to every screen that does not override it. */
function interpolateRHPCard() {
    const {result} = renderHook(() => useRHPScreenOptions());
    return result.current.web?.cardStyleInterpolator?.(buildInterpolationProps());
}

describe('useRHPScreenOptions', () => {
    beforeEach(() => {
        mockWideRHPRouteKeys = [];
        mockSuperWideRHPRouteKeys = [];
        mockIsSmallScreenWidth = false;
        mockIsSafari = false;
        mockForHorizontalIOS.mockClear();
        mockCustomInterpolator.mockClear();
    });

    it('animates a card above a wide RHP over the single-RHP column and clips it to that column', () => {
        // Given a wide RHP on a wide layout, whose frame holds the receipt pane and the single-RHP column
        mockWideRHPRouteKeys = ['wideKey'];

        // When the RHP's stack asks for a card's animated style
        const interpolatedStyle = interpolateRHPCard();

        // Then the card travels over its column, not the frame, and is clipped to it
        expect(mockForHorizontalIOS).toHaveBeenCalledTimes(1);
        expect(mockForHorizontalIOS.mock.calls.at(0)?.at(0)?.layouts.screen.width).toBe(variables.sideBarWidth);
        expect(interpolatedStyle?.containerStyle).toEqual({position: 'absolute', height: '100%', right: 0, width: variables.sideBarWidth, overflow: 'hidden'});
    });

    it('treats a super-wide RHP below the card the same way, since it also leaves the card only the column', () => {
        // Given a super-wide RHP displayed on a wide layout
        mockSuperWideRHPRouteKeys = ['superWideKey'];

        // When the RHP's stack asks for a card's animated style
        const interpolatedStyle = interpolateRHPCard();

        // Then the card is animated and clipped over the column
        expect(mockForHorizontalIOS.mock.calls.at(0)?.at(0)?.layouts.screen.width).toBe(variables.sideBarWidth);
        expect(interpolatedStyle?.containerStyle).toEqual({position: 'absolute', height: '100%', right: 0, width: variables.sideBarWidth, overflow: 'hidden'});
    });

    it('animates over the whole frame when nothing else shares it, which is what the frame already clips to', () => {
        // Given no non-narrow RHP below, so the frame is the card
        // When the RHP's stack asks for a card's animated style
        const interpolatedStyle = interpolateRHPCard();

        // Then the card keeps the frame's width and the interpolator's own container
        expect(mockForHorizontalIOS.mock.calls.at(0)?.at(0)?.layouts.screen.width).toBe(FRAME_WIDTH);
        expect(interpolatedStyle?.containerStyle).toBeUndefined();
    });

    it('leaves a small screen alone, where the RHP covers the screen and holds no second pane', () => {
        // Given a wide RHP on a small screen, where the RHP is full width
        mockWideRHPRouteKeys = ['wideKey'];
        mockIsSmallScreenWidth = true;

        // When the RHP's stack asks for a card's animated style
        const interpolatedStyle = interpolateRHPCard();

        // Then nothing is narrowed or clipped
        expect(mockForHorizontalIOS.mock.calls.at(0)?.at(0)?.layouts.screen.width).toBe(FRAME_WIDTH);
        expect(interpolatedStyle?.containerStyle).toBeUndefined();
    });

    it('confines Safari to the column too, whose interpolator replaces the misbehaving one rather than the geometry', () => {
        // Given Safari, which uses the Expensify interpolator, above a wide RHP
        mockWideRHPRouteKeys = ['wideKey'];
        mockIsSafari = true;

        // When the RHP's stack asks for a card's animated style
        const interpolatedStyle = interpolateRHPCard();

        // Then that interpolator is handed the same column, and its container is replaced by the column's
        expect(mockForHorizontalIOS).not.toHaveBeenCalled();
        expect(mockCustomInterpolator.mock.calls.at(0)?.at(0)?.props.layouts.screen.width).toBe(variables.sideBarWidth);
        expect(interpolatedStyle?.containerStyle).toEqual({position: 'absolute', height: '100%', right: 0, width: variables.sideBarWidth, overflow: 'hidden'});
    });
});
