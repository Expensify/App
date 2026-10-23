import variables from '@styles/variables';

const rightPaneWidth = variables.wideRHPRightPaneWidth;
const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + rightPaneWidth;

// Leave a floating gutter on both sides, including when safe-area insets make a wide navigator narrower than its window.
const floatingCardInset = 2 * (variables.rhpFloatingCardMargin + variables.rhpFloatingCardBorderWidth);

/**
 * Calculates the optimal width for the receipt pane RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated RHP width with constraints applied
 */
function calculateReceiptPaneRHPWidth(windowWidth: number) {
    // The responsive floor must fit the usable navigator, not force it back to the full window's breakpoint width.
    const availableWidth = windowWidth - floatingCardInset;
    const calculatedWidth = availableWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - availableWidth) : variables.receiptPaneRHPMaxWidth;
    const minimumWidth = Math.min(windowWidth, variables.mobileResponsiveWidthBreakpoint) - floatingCardInset - rightPaneWidth;

    return Math.max(0, calculatedWidth, minimumWidth);
}

export default calculateReceiptPaneRHPWidth;
