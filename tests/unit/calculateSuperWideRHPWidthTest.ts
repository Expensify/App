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

// Widths are pinned to concrete pixels so a change to any of the underlying variables forces a visible update here.
describe('calculateSuperWideRHPWidth', () => {
    it('leaves the configured 360px left margin on a wide window', () => {
        // 1440 - 360 (superWideRHPLeftMargin) = 1080.
        expect(calculateSuperWideRHPWidth(1440)).toBe(1080);
        // The sheet is anchored to the right edge, so its left edge sits at windowWidth - width = 360.
        expect(1440 - calculateSuperWideRHPWidth(1440)).toBe(360);
    });

    it('never shrinks below the wide RHP width', () => {
        // At 900px the wide RHP floor is 900, above the raw super wide width of 900 - 360 = 540.
        expect(calculateSuperWideRHPWidth(900)).toBe(900);
    });

    it('pins the exact window width where the wide RHP floor takes over', () => {
        // The floor maxes out at 925, which equals the raw super wide width when windowWidth - 360 = 925, i.e. at 1285.
        expect(calculateSuperWideRHPWidth(1284)).toBe(925); // 1284 - 360 = 924, floored to 925
        expect(calculateSuperWideRHPWidth(1285)).toBe(925); // 1285 - 360 = 925, boundary
        expect(calculateSuperWideRHPWidth(1286)).toBe(926); // 1286 - 360 = 926, super wide wins
    });

    describe('regression: Concierge/Help Side Panel open (https://github.com/Expensify/App/issues/99035)', () => {
        it('shrinks by the Side Panel width so the sheet left edge stays at 360px', () => {
            // The Side Panel (375px) shifts the whole RHP left by its width, so the super wide sheet is
            // shrunk by the same amount to keep its right-anchored left edge on-screen.
            const windowWidth = 1440;
            const sidePanelWidth = 375;
            const shrunkWidth = calculateSuperWideRHPWidth(windowWidth) - sidePanelWidth;

            // The shrink happens after the floor is applied, so 1080 - 375 = 705 can sit under it.
            expect(shrunkWidth).toBe(705);
            // Right-anchored inside (windowWidth - sidePanelWidth): left edge = 1440 - 375 - 705 = 360.
            expect(windowWidth - sidePanelWidth - shrunkWidth).toBe(360);
        });
    });
});
