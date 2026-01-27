import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import variables from '@styles/variables';

/**
 * Calculates the optimal width for the super wide RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated super wide RHP width with constraints applied
 */
function calculateSuperWideRHPWidth(windowWidth: number) {
    const superWideRHPWidth = windowWidth - variables.navigationTabBarSize - variables.sideBarWithLHBWidth;
    const wideRHPWidth = calculateReceiptPaneRHPWidth(windowWidth) + variables.sideBarWidth;

    return Math.max(Math.min(superWideRHPWidth, variables.superWideRHPMaxWidth), wideRHPWidth);
}

export default calculateSuperWideRHPWidth;
