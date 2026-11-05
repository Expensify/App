import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';
import getSidePanelWidthBounds from '@libs/Navigation/helpers/sidePanelWidth/getSidePanelWidthBounds';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

// jest-expo resolves bare specifiers to index.native.ts, where the wide RHP has no width, so the web module is loaded explicitly.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () => jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'));

describe('getSidePanelWidthBounds', () => {
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

    it('only caps the panel while a wide RHP is beside it', () => {
        // Given a window where a wide RHP leaves the panel less room than it can otherwise be dragged to
        const windowWidth = 1440;
        const {max: maxBesideWideRHP} = getSidePanelWidthBounds(windowWidth, true);

        // When the bounds are read without a wide RHP
        const {max} = getSidePanelWidthBounds(windowWidth, false);

        // Then the panel can grow past the cap again, so closing the wide RHP brings back the width it was clamped from
        expect(max).toBeGreaterThan(maxBesideWideRHP);
    });

    it('keeps the default width beside a wide RHP that leaves less room than that', () => {
        // Given the narrowest docking window, where a wide RHP leaves less room than the panel's default width
        const windowWidth = variables.sidePanelResponsiveWidthBreakpoint + 1;

        // When the side panel's bounds are read beside the wide RHP
        const {min, max} = getSidePanelWidthBounds(windowWidth, true);

        // Then the panel stays at its default instead of shrinking or inverting the range, so a drag still has somewhere to land
        expect(min).toBe(variables.sidePanelWidth);
        expect(max).toBe(min);
    });
});
