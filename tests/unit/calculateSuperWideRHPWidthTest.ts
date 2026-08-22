import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';

// jest-expo resolves `.native` files by default (defaultPlatform 'ios'), but the super wide RHP is a
// web/desktop-only layout whose native stubs are intentional no-ops. Force the web `index.ts` (and the
// receipt pane width it depends on) so these tests exercise the real width math (same pattern as
// resetOnboardingStackToRootTest).
jest.mock('@libs/Navigation/helpers/calculateSuperWideRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateSuperWideRHPWidth/index.ts'),
);
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);

// The expected widths below are pinned to concrete pixels rather than recomputed from variables, so any
// change to superWideRHPLeftMargin (147), sideBarWidth (375), receiptPaneRHPMaxWidth (465) or
// sidePanelWidth (375) forces a deliberate, visible update here instead of silently tracking the value.
describe('calculateSuperWideRHPWidth', () => {
    it('leaves the configured 147px left margin on a wide window', () => {
        // 1440 - 147 (superWideRHPLeftMargin) = 1293.
        expect(calculateSuperWideRHPWidth(1440)).toBe(1293);
        // The sheet is anchored to the right edge, so its left edge sits at windowWidth - width = 147.
        expect(1440 - calculateSuperWideRHPWidth(1440)).toBe(147);
    });

    it('never shrinks below the wide RHP width', () => {
        // At 900px the raw super wide width (900 - 147 = 753) would fall under the wide RHP floor
        // (sideBarWidth 375 + receiptPaneRHPMaxWidth 465 = 840), so the floor wins.
        expect(calculateSuperWideRHPWidth(900)).toBe(840);
    });

    it('pins the exact window width where the wide RHP floor takes over', () => {
        // The floor (840) equals the raw super wide width when windowWidth - 147 = 840, i.e. at 987.
        expect(calculateSuperWideRHPWidth(986)).toBe(840); // 986 - 147 = 839, floored to 840
        expect(calculateSuperWideRHPWidth(987)).toBe(840); // 987 - 147 = 840, boundary
        expect(calculateSuperWideRHPWidth(988)).toBe(841); // 988 - 147 = 841, super wide wins
    });

    describe('regression: Concierge/Help Side Panel open (https://github.com/Expensify/App/issues/99035)', () => {
        it('shrinks by the Side Panel width so the sheet left edge stays at 147px', () => {
            // The Side Panel (375px) shifts the whole RHP left by its width, so the super wide sheet is
            // shrunk by the same amount to keep its right-anchored left edge on-screen.
            const windowWidth = 1440;
            const sidePanelWidth = 375;
            const shrunkWidth = calculateSuperWideRHPWidth(windowWidth) - sidePanelWidth;

            // 1293 - 375 = 918, still wider than the 840 wide RHP floor.
            expect(shrunkWidth).toBe(918);
            // Right-anchored inside (windowWidth - sidePanelWidth): left edge = 1440 - 375 - 918 = 147.
            expect(windowWidth - sidePanelWidth - shrunkWidth).toBe(147);
        });
    });
});
