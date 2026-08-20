import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';

import variables from '@styles/variables';

// jest-expo resolves `.native` files by default (defaultPlatform 'ios'), but the super wide RHP is a
// web/desktop-only layout whose native stubs are intentional no-ops. Force the web `index.ts` so these
// tests exercise the real width math (same pattern as resetOnboardingStackToRootTest).
jest.mock('@libs/Navigation/helpers/calculateSuperWideRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateSuperWideRHPWidth/index.ts'),
);
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);

describe('calculateSuperWideRHPWidth', () => {
    it('leaves the configured left margin on a wide window', () => {
        const windowWidth = 1440;

        // The sheet is anchored to the right edge, so its left edge sits at windowWidth - width.
        const leftEdge = windowWidth - calculateSuperWideRHPWidth(windowWidth);

        expect(calculateSuperWideRHPWidth(windowWidth)).toBe(windowWidth - variables.superWideRHPLeftMargin);
        expect(leftEdge).toBe(variables.superWideRHPLeftMargin);
    });

    it('never shrinks below the wide RHP width', () => {
        // A window narrow enough that (windowWidth - leftMargin) would fall under the wide RHP floor.
        const windowWidth = 900;
        const wideRHPWidth = calculateReceiptPaneRHPWidth(windowWidth) + variables.sideBarWidth;

        expect(windowWidth - variables.superWideRHPLeftMargin).toBeLessThan(wideRHPWidth);
        expect(calculateSuperWideRHPWidth(windowWidth)).toBe(wideRHPWidth);
    });

    describe('regression: Concierge/Help Side Panel open (https://github.com/Expensify/App/issues/99035)', () => {
        it('keeps the sheet left edge fixed when shrunk by the Side Panel offset', () => {
            const windowWidth = 1440;
            const sidePanelOffset = variables.sidePanelWidth;

            // When the Side Panel is open it shifts the whole RHP left by its width (paddingRight),
            // so the fix shrinks the super wide sheet by the same amount.
            const shrunkWidth = calculateSuperWideRHPWidth(windowWidth) - sidePanelOffset;

            // The shrunk, right-anchored sheet now sits inside the window minus the Side Panel.
            const leftEdgeWithSidePanel = windowWidth - sidePanelOffset - shrunkWidth;
            const leftEdgeWithoutSidePanel = windowWidth - calculateSuperWideRHPWidth(windowWidth);

            // Left edge must be the same with and without the Side Panel — never pushed off-screen.
            expect(leftEdgeWithSidePanel).toBe(leftEdgeWithoutSidePanel);
            expect(leftEdgeWithSidePanel).toBe(variables.superWideRHPLeftMargin);
            expect(leftEdgeWithSidePanel).toBeGreaterThanOrEqual(0);
        });
    });
});
