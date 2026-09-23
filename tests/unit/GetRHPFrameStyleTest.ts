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
        // Given one RHP card on web with nothing stacked on or under it, the only case where the frame itself has to look like a card
        const params = {styles, animatedWidth: buildAnimatedWidth(), shouldUseNarrowLayout: false, shouldUseCenteredFrame: false};

        // When the frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then it gets the floating card with the width absorbing the border, because the card is border-box and its fixed-width panes clip without the compensation.
        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.r0);
        expect(readAnimatedValue(getWidth(style))).toBe(RHP_WIDTH + 2 * variables.rhpFloatingCardBorderWidth);
    });

    it('gives the stacked report flow an invisible frame that neither clips nor compensates for a border', () => {
        // Given a report with an expense stacked on top, where every card draws its own border and shadow and the frame only has to position them
        const animatedWidth = buildAnimatedWidth();
        const params = {styles, animatedWidth, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true};

        // When the frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then the frame stays invisible, unclipped and at the animated width untouched, since each card draws its own border and shadow and the frame has none to absorb.
        expect(style).toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.overflowHidden);
        expect(getWidth(style)).toBe(animatedWidth);
    });

    it('keeps the web narrow layout full-bleed', () => {
        // Given a phone-width window, where the RHP is the whole viewport and there is nothing to float or dim beside it
        const params = {styles, animatedWidth: buildAnimatedWidth(), shouldUseNarrowLayout: true, shouldUseCenteredFrame: true};

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
        const params = {styles, animatedWidth, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true};

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

// Regression for PR #101093: the two-factor security-code panel feeds the shared RHP width through getRHPFrameStyle, so it matches a normal RHP card.
describe('getRHPFrameStyle - two-factor (MFA) security-code panel', () => {
    const buildMfaPanelWidth = () => Animated.subtract(new Animated.Value(variables.rhpWidth), new Animated.Value(0));
    const mfaParams = {styles, shouldUseNarrowLayout: false, shouldUseCenteredFrame: false} as const;

    it('floats the panel as a card on wide web', () => {
        // Given the two-factor security-code panel on web, which measured 65px narrower than the RHP cards beside it because it sized off the sidebar width instead of variables.rhpWidth
        const params = {...mfaParams, animatedWidth: buildMfaPanelWidth()};

        // When the frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then it floats like any other RHP card, border included, so it lines up with the skinny cards behind it instead of standing out as a narrower panel.
        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.r0);
        expect(style).not.toContain(styles.h100);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(readAnimatedValue(getWidth(style))).toBe(variables.rhpWidth + 2 * variables.rhpFloatingCardBorderWidth);
    });

    it('keeps the panel full-bleed on native', () => {
        // Given the same panel on native, where the RHP slides in over the whole screen
        const animatedWidth = buildMfaPanelWidth();
        const params = {...mfaParams, animatedWidth};

        // When the native frame style is built for it
        const style = getRHPFrameStyleNative(params);

        // Then it keeps the full-bleed panel the apps shipped with, at the width it was given, so the web floating card treatment cannot leak into native layouts.
        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(getWidth(style)).toBe(animatedWidth);
    });

    it('keeps the panel full width on a narrow layout', () => {
        // Given the panel opened on a phone-width window, where it is the only thing on screen
        const params = {...mfaParams, shouldUseNarrowLayout: true, animatedWidth: buildMfaPanelWidth()};

        // When the web frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then it fills the viewport, because at that width there is no card behind it to float above.
        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(getWidth(style)).toBe('100%');
    });
});
