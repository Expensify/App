import getRHPFrameStyle from '@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle';
import type GetRHPFrameStyle from '@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/types';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

// The frame width is a react-native Animated node, so the test builds one the way navigation does.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import createMock from '../utils/createMock';

// The resolved import exercises native resolution; the explicit web entry also covers animated widths, which only web passes to the frame.
const getRHPFrameStyleWeb = jest.requireActual<{default: GetRHPFrameStyle}>('@libs/Navigation/AppNavigator/Navigators/getRHPFrameStyle/index.ts').default;

const RHP_WIDTH = variables.rhpWidth;

const styles = createMock<ThemeStyles>({
    pAbsolute: {position: 'absolute'},
    r0: {right: 0},
    h100: {height: '100%'},
    overflowHidden: {overflow: 'hidden'},
    translateZ0: {},
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

// An animated node only exposes its current value through this internal getter, hence the cast and the underscored-name disables.
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

        // Then the frame stays invisible and clips nothing, at the animated width untouched, since each card draws its own border and shadow and the frame has none to absorb.
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

    it('gives a standalone native RHP the same floating card as web without animating its width', () => {
        // Given one wide native RHP with a numeric width, because native stacks do not consume animated frame widths
        const params = {styles, animatedWidth: RHP_WIDTH, shouldUseNarrowLayout: false, shouldUseCenteredFrame: false};

        // When the frame is built through native module resolution rather than an explicit platform file
        const style = getRHPFrameStyle(params);

        // Then native shares web's floating frame and border compensation, but the width stays numeric for its plain View.
        expect(style).toEqual(getRHPFrameStyleWeb(params));
        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).toContain(styles.overflowHidden);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.r0);
        expect(style).not.toContain(styles.h100);
        expect(getWidth(style)).toBe(RHP_WIDTH + 2 * variables.rhpFloatingCardBorderWidth);
    });

    it('gives stacked native cards the same invisible frame as web at their numeric width', () => {
        // Given a wide native report with an expense stacked on top, where each card owns its border and shadow
        const params = {styles, animatedWidth: RHP_WIDTH, shouldUseNarrowLayout: false, shouldUseCenteredFrame: true};

        // When the resolved helper positions the stack without using an Animated component
        const style = getRHPFrameStyle(params);

        // Then the frame is invisible and does not clip the cards or add a second border to their numeric width.
        expect(style).toEqual(getRHPFrameStyleWeb(params));
        expect(style).toContain(styles.RHPCenteredFrame);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.overflowHidden);
        expect(getWidth(style)).toBe(RHP_WIDTH);
    });

    it('keeps native narrow layouts full-bleed even when cards are stacked', () => {
        // Given a phone-width native stack, where floating margins must not leave gaps around a full-screen sheet
        const params = {styles, animatedWidth: RHP_WIDTH, shouldUseNarrowLayout: true, shouldUseCenteredFrame: true};

        // When native resolution builds the frame with both narrow and stacked flags
        const style = getRHPFrameStyle(params);

        // Then the narrow layout takes precedence and fills the viewport just as it does on web.
        expect(style).toEqual(getRHPFrameStyleWeb(params));
        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(getWidth(style)).toBe('100%');
    });
});

// Regression for PR #101093: the two-factor security-code panel feeds the shared RHP width through getRHPFrameStyle, so it matches a normal RHP card.
describe('getRHPFrameStyle - two-factor (MFA) security-code panel', () => {
    // The panel never animates its width, so it hands the helper a plain number, as MultifactorAuthenticationModalNavigator does.
    const mfaPanelWidth = variables.rhpWidth;
    const mfaParams = {styles, shouldUseNarrowLayout: false, shouldUseCenteredFrame: false} as const;

    it('floats the panel as a card on wide web', () => {
        // Given the two-factor security-code panel on web, which measured 65px narrower than the RHP cards beside it because it sized off the sidebar width instead of variables.rhpWidth
        const params = {...mfaParams, animatedWidth: mfaPanelWidth};

        // When the frame style is built for it
        const style = getRHPFrameStyleWeb(params);

        // Then it floats like any other RHP card, border included, so it lines up with the skinny cards behind it instead of standing out as a narrower panel.
        // The width stays a plain number, since a panel that never animates its width must not need an Animated component.
        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.r0);
        expect(style).not.toContain(styles.h100);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(getWidth(style)).toBe(variables.rhpWidth + 2 * variables.rhpFloatingCardBorderWidth);
    });

    it('floats the panel as the same numeric-width card on native', () => {
        // Given the wide native security-code panel, which uses a plain View and the same RHP width as web
        const params = {...mfaParams, animatedWidth: mfaPanelWidth};

        // When the navigator's resolved helper builds the frame without an Animated wrapper
        const style = getRHPFrameStyle(params);

        // Then it matches web's floating frame and keeps border compensation numeric so the panel remains the shared content width.
        expect(style).toEqual(getRHPFrameStyleWeb(params));
        expect(style).toContain(styles.RHPFloatingCard);
        expect(style).not.toContain(styles.r0);
        expect(style).not.toContain(styles.h100);
        expect(style).not.toContain(styles.RHPCenteredFrame);
        expect(getWidth(style)).toBe(mfaPanelWidth + 2 * variables.rhpFloatingCardBorderWidth);
    });

    it.each([
        {platform: 'native', getFrameStyle: getRHPFrameStyle},
        {platform: 'web', getFrameStyle: getRHPFrameStyleWeb},
    ])('keeps the panel full width on a narrow $platform layout', ({getFrameStyle}) => {
        // Given the panel opened on a phone-width window, where it is the only thing on screen
        const params = {...mfaParams, shouldUseNarrowLayout: true, animatedWidth: mfaPanelWidth};

        // When the platform's helper builds the panel frame at a width where it cannot float
        const style = getFrameStyle(params);

        // Then it fills the viewport, because at that width there is no card behind it to float above.
        expect(style).toContain(styles.r0);
        expect(style).toContain(styles.h100);
        expect(style).not.toContain(styles.RHPFloatingCard);
        expect(getWidth(style)).toBe('100%');
    });
});
