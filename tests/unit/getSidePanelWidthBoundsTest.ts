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
        const {min, max} = getSidePanelWidthBounds(windowWidth);

        // Then the panel can't go narrower than its default, and grows as far as a single RHP can, so the two panes resize alike
        expect(min).toBe(variables.sidePanelWidth);
        expect(max).toBe(getSingleRHPWidthBounds(windowWidth, 0).max);
        expect(max).toBeGreaterThan(min);
    });

    it('never lets the maximum fall below the minimum in a narrow window', () => {
        // Given a window narrower than the default panel plus the content it must leave room for
        const windowWidth = 600;

        // When the side panel's bounds are read
        const {min, max} = getSidePanelWidthBounds(windowWidth);

        // Then the range never inverts, so a drag still has somewhere to land
        expect(min).toBe(variables.sidePanelWidth);
        expect(max).toBeGreaterThanOrEqual(min);
    });
});
