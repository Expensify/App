import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';

import variables from '@styles/variables';

/**
 * Calculates the optimal width for the super wide RHP based on window width.
 * Ensures the RHP doesn't exceed maximum width and maintains minimum responsive width.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated super wide RHP width with constraints applied
 */
function calculateSuperWideRHPWidth(windowWidth: number) {
    const superWideRHPWidth = windowWidth - variables.superWideRHPLeftMargin;
    const wideRHPWidth = calculateWideRHPWidth(windowWidth);

    return Math.max(superWideRHPWidth, wideRHPWidth);
}

export default calculateSuperWideRHPWidth;
