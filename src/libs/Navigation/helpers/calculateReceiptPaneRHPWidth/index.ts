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
    // The floating card is inset from the window edge by its margin, so the window cannot be spent entirely on the
    // panes. Charging that margin here is what keeps the card's left edge on-screen while it shrinks with the window.
    const availableWidth = windowWidth - variables.rhpFloatingCardMargin;
    const calculatedWidth = availableWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - availableWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - rightPaneWidth);
}

export default calculateReceiptPaneRHPWidth;
