import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';
import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

// jest-expo resolves bare specifiers to index.native.ts, where the wide RHP has no width, so the web module is loaded explicitly.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);

describe('getSidePanelWidthBounds', () => {
    it('stops at the default width and at the widest single RHP', () => {
        // Given a wide window, where both panes have room to grow
        const windowWidth = 1920;

        // When the side panel's bounds are read
        const {min, max} = getSidePanelWidthBounds(windowWidth, false);

        // Then the panel can't go narrower than its default, and grows as far as a single RHP can, so the two panes resize alike
        expect(min).toBe(variables.sidePanelWidth);
        expect(max).toBe(getSingleRHPWidthBounds(windowWidth, 0).max);
        expect(max).toBeGreaterThan(min);
    });

    it.each([variables.sidePanelResponsiveWidthBreakpoint + 1, 1440, 1920, 2560])('keeps a single RHP beside the widest docked panel on screen in a %ipx window', (windowWidth) => {
        // Given a window wide enough to dock the panel, which shifts the RHP left by the panel's width
        const {max: sidePanelMaxWidth} = getSidePanelWidthBounds(windowWidth, false);

        // When the single RHP's bounds are read beside the widest panel
        const {max: singleRHPMaxWidth} = getSingleRHPWidthBounds(windowWidth, sidePanelMaxWidth);

        // Then even the widest RHP card still fits left of the panel, so the panel never pushes it off screen
        expect(sidePanelMaxWidth + RHP_FLOATING_CARD_INSET + singleRHPMaxWidth).toBeLessThanOrEqual(windowWidth);
    });

    it.each([1440, 1920, 2560])('keeps a wide RHP beside the widest docked panel on screen in a %ipx window', (windowWidth) => {
        // Given a window wide enough to dock the panel, with a wide RHP open that the panel shifts left by its width
        const isWideRHPBesidePanel = true;

        // When the side panel's bounds are read
        const {max} = getSidePanelWidthBounds(windowWidth, isWideRHPBesidePanel);

        // Then the wide card still fits left of the widest panel, so opening an expense never pushes it off screen
        expect(max + RHP_FLOATING_CARD_INSET + calculateWideRHPWidth(windowWidth)).toBeLessThanOrEqual(windowWidth);
    });

    it('gives the dragged width back once the wide RHP closes', () => {
        // Given a window where a wide RHP leaves the panel less room than it can be dragged to
        const windowWidth = 1440;
        const {max: maxBesideWideRHP} = getSidePanelWidthBounds(windowWidth, true);

        // When the wide RHP closes
        const {max} = getSidePanelWidthBounds(windowWidth, false);

        // Then the panel can grow back past the cap, so a saved width it was clamped from comes back
        expect(max).toBeGreaterThan(maxBesideWideRHP);
    });

    it('never lets the maximum fall below the minimum in a narrow window', () => {
        // Given a window narrower than the default panel plus the content it must leave room for
        const windowWidth = 600;

        // When the side panel's bounds are read
        const {min, max} = getSidePanelWidthBounds(windowWidth, false);

        // Then the range never inverts, so a drag still has somewhere to land
        expect(min).toBe(variables.sidePanelWidth);
        expect(max).toBeGreaterThanOrEqual(min);
    });
});
