import variables from '@styles/variables';

const singleRHPWidth = variables.sideBarWidth;
const wideRHPMaxWidth = variables.receiptPaneRHPMaxWidth + singleRHPWidth;

/**
 * Calculates the optimal width for the receipt pane RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated RHP width with constraints applied
 */
function calculateReceiptPaneRHPWidth(windowWidth: number) {
    const calculatedWidth = windowWidth < wideRHPMaxWidth ? variables.receiptPaneRHPMaxWidth - (wideRHPMaxWidth - windowWidth) : variables.receiptPaneRHPMaxWidth;

    return Math.max(calculatedWidth, variables.mobileResponsiveWidthBreakpoint - singleRHPWidth);
}

export default calculateReceiptPaneRHPWidth;
