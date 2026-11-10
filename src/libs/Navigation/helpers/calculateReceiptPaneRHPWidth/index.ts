import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';

import variables from '@styles/variables';

const rightPaneWidth = variables.wideRHPRightPaneWidth;
const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + rightPaneWidth;

/**
 * Calculates the optimal width for the receipt pane RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated RHP width with constraints applied
 */
function calculateReceiptPaneRHPWidth(windowWidth: number) {
    // Both the shrinking width and the floor give up the inset, or the card's left edge slides off-screen on narrow wide layouts.
    const availableWidth = windowWidth - RHP_FLOATING_CARD_INSET;
    const calculatedWidth = availableWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - availableWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - RHP_FLOATING_CARD_INSET - rightPaneWidth);
}

export default calculateReceiptPaneRHPWidth;
