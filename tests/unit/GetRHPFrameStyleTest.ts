import type GetRHPFrameStyle from '@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/types';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import createMock from '../utils/createMock';

// Both variants are loaded explicitly because jest-expo resolves the bare specifier to index.native.ts, which would leave the web card uncovered.
const getRHPFrameStyleWeb = jest.requireActual<{default: GetRHPFrameStyle}>('@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/index.ts').default;
const getRHPFrameStyleNative = jest.requireActual<{default: GetRHPFrameStyle}>('@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/index.native.ts').default;

const RHP_WIDTH = 375;

const styles = createMock<ThemeStyles>({
    pAbsolute: {position: 'absolute'},
    r0: {right: 0},
    h100: {height: '100%'},
    overflowHidden: {overflow: 'hidden'},
    RHPFloatingCard: {borderWidth: variables.rhpFloatingCardBorderWidth},
    RHPCenteredFrame: {right: variables.rhpFloatingCardMargin},
});

function buildAnimatedWidth() {
    return Animated.subtract(new Animated.Value(RHP_WIDTH), new Animated.Value(0));
}

function getWidth(style: ReturnType<GetRHPFrameStyle>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (style as Array<{width?: unknown}>).at(-1)?.width;
}

/** An animated node only exposes its current value through this internal getter. */
function readAnimatedValue(width: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/naming-convention, no-underscore-dangle
    return (width as {__getValue: () => number}).__getValue();
}

describe('getRHPFrameStyle', () => {
    it('gives a standalone web RHP a floating card whose width absorbs the border', () => {
        const style = getRHPFrameStyleWeb({styles, animatedWidth: buildAnimatedWidth(), shouldUseNarrowLayout: false, shouldUseCenteredFrame: false});

        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.r0);

        // The card is border-box, so the frame has to be wider than the RHP by its border on both sides. Without this
        // the fixed-width panes inside the wide RHP are clipped.
        expect(readAnimatedValue(getWidth(style))).toBe(RHP_WIDTH + 2 * variables.rhpFloatingCardBorderWidth);
    });

    it('gives the stacked report flow an invisible frame that neither clips nor compensates for a border', () => {
        const animatedWidth = buildAnimatedWidth();

        const style = getRHPFrameStyleWeb({styles, animatedWidth, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true});

        expect(style).toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.RHPFloatingCard);
        // The cards inside draw their own border and shadow, so clipping here would cut them off at the frame edges.
        expect(style).not.toContain(styles.overflowHidden);
        // The frame has no border of its own, so the width is the RHP width untouched.
        expect(getWidth(style)).toBe(animatedWidth);
    });

    it('keeps the web narrow layout full-bleed', () => {
        const style = getRHPFrameStyleWeb({styles, animatedWidth: buildAnimatedWidth(), shouldUseNarrowLayout: true, shouldUseCenteredFrame: true});

        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(getWidth(style)).toBe('100%');
    });

    it('keeps native full-bleed and leaves the width untouched', () => {
        const animatedWidth = buildAnimatedWidth();

        const style = getRHPFrameStyleNative({styles, animatedWidth, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true});

        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        // Native gets no border, so the width must be the animated RHP width itself and not a compensated copy of it.
        expect(getWidth(style)).toBe(animatedWidth);
    });
});
