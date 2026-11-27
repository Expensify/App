import {renderHook} from '@testing-library/react-native';

import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import type {EnterAnimation} from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

// The hook under test builds its interpolation with Animated from 'react-native', so the test must feed it the same Animated values.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

const SIDE_PANEL_OFFSET = 375;
const SCREEN_WIDTH = 800;

// Jest resolves the native card styles, which are empty. The web ones carry the position: fixed workaround for Safari that these tests guard.
jest.mock('@styles/utils/cardStyles', () => jest.requireActual<Record<string, unknown>>('@styles/utils/cardStyles/index.ts'));

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
        layouts: {screen: {width: SCREEN_WIDTH, height: 600}},
        insets: {top: 0, right: 0, bottom: 0, left: 0},
    };

    const pinnedCardStyle = {position: 'fixed', width: SCREEN_WIDTH, height: '100%'};

    const getCardStyle = (enter: EnterAnimation, {applySidePanelOffset, shouldPinCardToViewport}: {applySidePanelOffset?: boolean; shouldPinCardToViewport?: boolean} = {}) => {
        const {result} = renderHook(() => useModalCardStyleInterpolator());
        return result.current({props: mockProps, enter, applySidePanelOffset, shouldPinCardToViewport});
    };

    it('pins the card to the viewport by default', () => {
        // Given a card that does not opt out, like the RHP, onboarding or full screen cards that rely on the Safari workaround
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'none'});

        // Then the card is fixed to the viewport at the measured screen width and the container clips it, as in the narrow layout used by the test environment
        expect(style.cardStyle).toEqual(pinnedCardStyle);
        expect(style.containerStyle).toEqual({overflow: 'hidden'});
    });

    it('leaves the card unpinned when shouldPinCardToViewport is false', () => {
        // Given a card whose container eases its width, where a measured width would lag the transition
        // When the interpolator computes its styles with pinning turned off
        const style = getCardStyle({kind: 'none'}, {shouldPinCardToViewport: false});

        // Then the card gets no position or width, so it follows its container
        expect(style.cardStyle).toEqual({});
    });

    it('fades the card in', () => {
        // Given a fade entry, which only animates opacity
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'fade'});

        // Then opacity follows the transition progress on top of the pinned card
        expect(style.cardStyle).toEqual({...pinnedCardStyle, opacity: progress});
    });

    it('slides the card in from its width', () => {
        // Given a slide entry, which translates the card
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'slide-from-width'});

        // Then the pinned card is translated horizontally
        expect(style.cardStyle).toMatchObject(pinnedCardStyle);
        expect(style.cardStyle).toHaveProperty('transform.length', 1);
    });

    it('slides and fades an unpinned card in without side panel padding by default', () => {
        // Given an unpinned slide-and-fade entry without a side panel offset, so only the animation styles are expected
        // When the interpolator computes its styles
        const style = getCardStyle({kind: 'slide-and-fade', distancePx: 120}, {shouldPinCardToViewport: false});

        // Then the card is translated and faded, without padding, position or width
        expect(Object.keys(style.cardStyle ?? {}).sort()).toEqual(['opacity', 'transform']);
        expect(style.cardStyle).toHaveProperty('opacity', progress);
        expect(style.cardStyle).toHaveProperty('transform.length', 1);
    });

    it('pads the card by the side panel offset when applySidePanelOffset is true', () => {
        // Given an open, non-resizable side panel whose width must be reserved so the card does not slide under it
        // When the interpolator computes styles with applySidePanelOffset enabled
        const style = getCardStyle({kind: 'none'}, {applySidePanelOffset: true});

        // Then the pinned card is padded by exactly the side panel offset
        expect(style.cardStyle).toEqual({...pinnedCardStyle, paddingRight: SIDE_PANEL_OFFSET});
    });
});
