import type GetRHPFrameStyle from '@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/types';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

// The frame width is a react-native Animated node, so the test builds one the way navigation does.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import createMock from '../utils/createMock';

// Both variants are loaded explicitly because jest-expo resolves the bare specifier to index.native.ts, which would leave the web card uncovered.
const getRHPFrameStyleWeb = jest.requireActual<{default: GetRHPFrameStyle}>('@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/index.ts').default;
const getRHPFrameStyleNative = jest.requireActual<{default: GetRHPFrameStyle}>('@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/index.native.ts').default;

// The bare specifier resolves to the native stub under jest-expo, so the web card is built against the web width helper.
jest.mock('@libs/Navigation/helpers/singleRHPWidth', () => jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/singleRHPWidth/index.ts'));

const RHP_WIDTH = 375;

const SAVED_SINGLE_RHP_WIDTH = 600;

/** The live width a drag writes to CSS, falling back to the saved width, with the card's border added. */
function getFloatingCardWidth(singleRHPWidth: number) {
    return `calc(var(--rhp-width, ${singleRHPWidth}px) + ${2 * variables.rhpFloatingCardBorderWidth}px)`;
}

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
    // The style array mixes theme objects with the width entry, so the width has to be read through a cast.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (style as Array<{width?: unknown}>).at(-1)?.width;
}

describe('getRHPFrameStyle', () => {
    it('gives a standalone web RHP a floating card at the resizable width, absorbing the border', () => {
        // Given one RHP card on web with nothing stacked on or under it, the only case where the frame itself has to look like a card
        const params = {styles, animatedWidth: buildAnimatedWidth(), singleRHPWidth: SAVED_SINGLE_RHP_WIDTH, shouldUseNarrowLayout: false, shouldUseCenteredFrame: false};

        // When the frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then it gets the floating card at the width a drag of its edge writes to CSS, falling back to the saved width when no drag is in progress,
        // plus the border, because the card is border-box and its content clips without the compensation.
        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.r0);
        expect(getWidth(style)).toBe(getFloatingCardWidth(SAVED_SINGLE_RHP_WIDTH));
    });

    it('gives the stacked report flow an invisible frame that neither clips nor compensates for a border', () => {
        // Given a report with an expense stacked on top, where every card draws its own border and shadow and the frame only has to position them
        const animatedWidth = buildAnimatedWidth();
        const params = {styles, animatedWidth, singleRHPWidth: SAVED_SINGLE_RHP_WIDTH, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true};

        // When the frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then the frame stays invisible and clips nothing, at the animated width untouched, since each card draws its own border and shadow and the frame has none to absorb.
        expect(style).toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.overflowHidden);
        expect(getWidth(style)).toBe(animatedWidth);
    });

    it('keeps the web narrow layout full-bleed', () => {
        // Given a phone-width window, where the RHP is the whole viewport and there is nothing to float or dim beside it
        const params = {styles, animatedWidth: buildAnimatedWidth(), singleRHPWidth: SAVED_SINGLE_RHP_WIDTH, shouldUseNarrowLayout: true, shouldUseCenteredFrame: true};

        // When the frame style is built on web
        const style = getRHPFrameStyleWeb(params);

        // Then it covers the viewport edge to edge, because a floating card here would leave the dimmed margins of the desktop layout hanging around a full screen sheet.
        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(getWidth(style)).toBe('100%');
    });

    it('keeps native full-bleed and leaves the width untouched', () => {
        // Given the same wide window on native, where the floating card treatment does not exist at all
        const animatedWidth = buildAnimatedWidth();
        const params = {styles, animatedWidth, singleRHPWidth: SAVED_SINGLE_RHP_WIDTH, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true};

        // When the native frame style is built for it
        const style = getRHPFrameStyleNative(params);

        // Then it stays full-bleed with the animated width passed through untouched, because native draws no card border that would need absorbing into the width.
        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(getWidth(style)).toBe(animatedWidth);
    });
});
