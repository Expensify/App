import variables from '@styles/variables';

const rightPaneWidth = variables.wideRHPRightPaneWidth;
const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + rightPaneWidth;

// The floating card sits its margin away from the right window edge, and the frame adds its border on top of the pane widths.
const floatingCardInset = variables.rhpFloatingCardMargin + 2 * variables.rhpFloatingCardBorderWidth;

/**
 * Calculates the optimal width for the receipt pane RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated RHP width with constraints applied
 */
function calculateReceiptPaneRHPWidth(windowWidth: number) {
    // Both the shrinking width and the floor give up the inset, or the card's left edge slides off-screen on narrow wide layouts.
    const availableWidth = windowWidth - floatingCardInset;
    const calculatedWidth = availableWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - availableWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - floatingCardInset - rightPaneWidth);
}

export default calculateReceiptPaneRHPWidth;
