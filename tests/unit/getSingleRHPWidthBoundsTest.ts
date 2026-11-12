import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import CONST from '@src/CONST';

// jest-expo resolves bare specifiers to index.native.ts, where the wide RHP has no width, so the web module is loaded explicitly.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);

/** What the window leaves for the card once the floating card's gutter, its borders, the Side Panel and the content reserve are taken. */
function getWidthLeftForCard(windowWidth: number, sidePanelWidth: number) {
    return windowWidth - variables.rhpFloatingCardMargin - 2 * variables.rhpFloatingCardBorderWidth - sidePanelWidth - CONST.RHP_RESIZE.CONTENT_RESERVE_WIDTH;
}

describe('getSingleRHPWidthBounds', () => {
    it('stops a wide window short of the wide RHP', () => {
        // Given a wide window with the Side Panel closed, where the wide RHP is the tighter limit
        const windowWidth = 1920;
        expect(calculateWideRHPWidth(windowWidth) - CONST.RHP_RESIZE.WIDE_RHP_INSET).toBeLessThan(getWidthLeftForCard(windowWidth, 0));

        // When the bounds are computed
        const bounds = getSingleRHPWidthBounds(windowWidth, 0);

        // Then the single RHP can't grow past the inset below the wide RHP, so a single RHP stacked on a wide one never covers it
        expect(bounds).toEqual({min: CONST.RHP_RESIZE.MIN_WIDTH, max: calculateWideRHPWidth(windowWidth) - CONST.RHP_RESIZE.WIDE_RHP_INSET});
    });

    it('leaves the content beside the card its reserve when the Side Panel is open', () => {
        // Given a window where the open Side Panel makes the content reserve the tighter limit
        const windowWidth = 1400;
        const sidePanelWidth = variables.sidePanelWidth;
        expect(getWidthLeftForCard(windowWidth, sidePanelWidth)).toBeLessThan(calculateWideRHPWidth(windowWidth) - CONST.RHP_RESIZE.WIDE_RHP_INSET);

        // When the bounds are computed
        const {max} = getSingleRHPWidthBounds(windowWidth, sidePanelWidth);

        // Then the card stops where the content to its left would drop below the reserve
        expect(max).toBe(getWidthLeftForCard(windowWidth, sidePanelWidth));
    });

    it('never lets the max drop below the min', () => {
        // Given a window so narrow that the reserve leaves less than the narrowest card
        const windowWidth = 900;

        // When the bounds are computed
        const {min, max} = getSingleRHPWidthBounds(windowWidth, variables.sidePanelWidth);

        // Then the range collapses onto the min, so a drag can't push the card narrower than it may ever be
        expect(max).toBe(min);
        expect(min).toBe(CONST.RHP_RESIZE.MIN_WIDTH);
    });
});
