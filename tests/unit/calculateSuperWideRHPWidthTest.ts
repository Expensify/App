import calculateMaxSidePanelRHPShrink from '@libs/Navigation/helpers/calculateMaxSidePanelRHPShrink';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';

// jest-expo resolves bare specifiers to index.native.ts (defaultPlatform 'ios'), so the web index.ts is loaded explicitly, same pattern as resetOnboardingStackToRootTest.
// requireActual hands back an untyped module, which is what each no-unsafe-return below is silencing.
jest.mock('@libs/Navigation/helpers/calculateSuperWideRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateSuperWideRHPWidth/index.ts'),
);
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);
jest.mock('@libs/Navigation/helpers/calculateMaxSidePanelRHPShrink', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateMaxSidePanelRHPShrink/index.ts'),
);

// Widths are pinned to concrete pixels so a change to any of the underlying variables forces a visible update here.
describe('calculateSuperWideRHPWidth', () => {
    it('leaves the configured 360px left margin on a wide window', () => {
        // Given a 1440px desktop window, wide enough for the LHN and the widest sheet side by side
        const windowWidth = 1440;

        // When the super wide RHP width is calculated
        const superWideRHPWidth = calculateSuperWideRHPWidth(windowWidth);

        // Then the sheet takes everything right of the 360px left margin, which is what keeps the LHN readable beside it.
        expect(superWideRHPWidth).toBe(1080);
        expect(windowWidth - superWideRHPWidth).toBe(360);
    });

    it('never shrinks below the wide RHP width', () => {
        // Given a 900px window, too narrow for windowWidth - 360 to hold a report and its receipt pane side by side
        const windowWidth = 900;

        // When the super wide RHP width is calculated
        const superWideRHPWidth = calculateSuperWideRHPWidth(windowWidth);

        // Then the wide RHP floor wins over the raw 900 - 360 = 540, so the sheet is never narrower than the layout it shows.
        // The floor is the window less the floating card's 12px inset margin, which is what keeps the card's left edge on-screen.
        expect(superWideRHPWidth).toBe(888);
    });

    it('pins the exact window width where the wide RHP floor takes over', () => {
        // Given windows around the point where windowWidth - 360 equals the 925px wide RHP floor, at 1285
        const windowWidths = [1284, 1285, 1286];

        // When the super wide RHP width is calculated for each of them
        const superWideRHPWidths = windowWidths.map((windowWidth) => calculateSuperWideRHPWidth(windowWidth));

        // Then the floor holds the two narrower windows and the raw width takes over at 1286, so a change to either side of the comparison shows up here.
        expect(superWideRHPWidths).toEqual([925, 925, 926]);
    });

    describe('regression: Concierge/Help Side Panel open (https://github.com/Expensify/App/issues/99035)', () => {
        it('shrinks by the Side Panel width down to the spare room above the wide RHP width', () => {
            // Given a 1440px window with the 375px Concierge Side Panel open, which shifts the whole RHP left by its width
            const windowWidth = 1440;
            const sidePanelWidth = 375;

            // When the sheet gives up room to the panel, capped at the spare room above the wide RHP width
            const shrink = Math.min(sidePanelWidth, calculateMaxSidePanelRHPShrink(windowWidth));

            // Then it keeps 925 rather than 1080 - 375 = 705, because a tighter box cuts the receipt pane off.
            expect(calculateSuperWideRHPWidth(windowWidth) - shrink).toBe(925);
        });

        it('leaves no spare room once the wide RHP floor takes over', () => {
            // Given a 1285px window, where the sheet is already sitting exactly on the wide RHP floor
            const windowWidth = 1285;

            // When the Side Panel asks how much of the sheet it may take
            const shrink = calculateMaxSidePanelRHPShrink(windowWidth);

            // Then nothing is left to give, and the capped shrink at 1440 lands on the wide RHP width, so the panel can never make the card too narrow for its panes.
            expect(shrink).toBe(0);
            expect(calculateSuperWideRHPWidth(1440) - calculateMaxSidePanelRHPShrink(1440)).toBe(calculateWideRHPWidth(1440));
        });
    });

    describe('regression: native platforms (https://github.com/Expensify/App/issues/99035)', () => {
        it('reports no spare room so the Side Panel shrink stays a number', () => {
            // Given native, where the super wide RHP does not exist and the web width helpers it builds on are no-ops
            const calculateMaxSidePanelRHPShrinkNative = jest.requireActual<{default: (windowWidth: number) => number}>(
                '@libs/Navigation/helpers/calculateMaxSidePanelRHPShrink/index.native.ts',
            ).default;

            // When the Side Panel asks how much of the sheet it may take
            const shrink = calculateMaxSidePanelRHPShrinkNative(1440);

            // Then it is 0 rather than NaN, because the shrink feeds an animated inputRange and NaN there takes the whole RHP down on iOS.
            expect(shrink).toBe(0);
        });
    });
});
