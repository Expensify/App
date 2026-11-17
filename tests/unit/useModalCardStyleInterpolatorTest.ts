import {renderHook} from '@testing-library/react-native';

import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import type {EnterAnimation} from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

// The hook under test builds its interpolation with Animated from 'react-native', so the test must feed it the same Animated values.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

const SIDE_PANEL_OFFSET = 375;

jest.mock('@hooks/useSidePanelState', () => () => ({
    sidePanelOffset: {current: SIDE_PANEL_OFFSET},
    sidePanelNVP: undefined,
    isSidePanelTransitionEnded: true,
    sidePanelWidth: SIDE_PANEL_OFFSET,
    isSidePanelResizable: false,
}));

describe('useModalCardStyleInterpolator', () => {
    // Settled transition values (fully entered, not closing or swiping); the interpolator only maps them to styles.
    const animatedValue = new Animated.Value(1);
    const progress = animatedValue.interpolate<number>({inputRange: [0, 1], outputRange: [0, 1]});
    const mockProps: StackCardInterpolationProps = {
        current: {progress},
        index: 0,
        closing: animatedValue.interpolate<0 | 1>({inputRange: [0, 1], outputRange: [0, 0]}),
        swiping: animatedValue.interpolate<0 | 1>({inputRange: [0, 1], outputRange: [0, 0]}),
        inverted: animatedValue.interpolate<1 | -1>({inputRange: [0, 1], outputRange: [1, 1]}),
        layouts: {screen: {width: 800, height: 600}},
        insets: {top: 0, right: 0, bottom: 0, left: 0},
    };

    const getCardStyle = (enter: EnterAnimation, applySidePanelOffset?: boolean) => {
        const {result} = renderHook(() => useModalCardStyleInterpolator());
        return result.current({props: mockProps, enter, applySidePanelOffset});
    };

    it('returns an empty cardStyle with clipping container when enter kind is none', () => {
        // Given a card without an entry animation, which previously got fixed positioning and a screen-wide width
        // that made header buttons jump when the navigation bar collapsed
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'none'});

        // Then the card gets no positioning or sizing of its own and the container clips it, as in the narrow layout used by the test environment
        expect(style.cardStyle).toEqual({});
        expect(Object.keys(style.containerStyle ?? {})).toEqual(['overflow']);
        expect(style.containerStyle).toHaveProperty('overflow', 'hidden');
    });

    it('fades the card in without forcing its position or width', () => {
        // Given a fade entry, which must only animate opacity so the card keeps its layout from the navigator
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'fade'});

        // Then opacity follows the transition progress and no fixed positioning or width is applied
        expect(style.cardStyle).toEqual({opacity: progress});
    });

    it('slides the card in from its width without forcing its position or width', () => {
        // Given a slide entry, which must only translate the card so the layout underneath stays stable
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'slide-from-width'});

        // Then the card is translated horizontally and no fixed positioning or width is applied
        expect(Object.keys(style.cardStyle ?? {})).toEqual(['transform']);
        expect(style.cardStyle).toHaveProperty('transform.length', 1);
    });

    it('slides and fades the card in without side panel padding by default', () => {
        // Given a slide-and-fade entry without a side panel offset, so no extra padding is expected
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'slide-and-fade', distancePx: 120});

        // Then the card is translated and faded, without padding, fixed positioning or width
        expect(Object.keys(style.cardStyle ?? {}).sort()).toEqual(['opacity', 'transform']);
        expect(style.cardStyle).toHaveProperty('opacity', progress);
        expect(style.cardStyle).toHaveProperty('transform.length', 1);
    });

    it('pads the card by the side panel offset when applySidePanelOffset is true', () => {
        // Given an open, non-resizable side panel whose width must be reserved so the card does not slide under it
        // When the interpolator computes styles with applySidePanelOffset enabled
        const style = getCardStyle({kind: 'none'}, true);

        // Then the card is padded by exactly the side panel offset
        expect(style.cardStyle).toEqual({paddingRight: SIDE_PANEL_OFFSET});
    });
});
