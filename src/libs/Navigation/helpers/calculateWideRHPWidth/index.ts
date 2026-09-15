import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';

import variables from '@styles/variables';

/**
 * Calculates the total width of the wide RHP: the receipt pane on the left plus the detail pane on the right.
 *
 * Every consumer has to go through this. The frame, the card inside it and the super wide fallback are all sized from
 * this number, and when one of them computed it on its own the frame outgrew its card and both borders showed at once.
 *
 * @param windowWidth - Current window width in pixels
 * @returns Calculated wide RHP width
 */
function calculateWideRHPWidth(windowWidth: number) {
    return calculateReceiptPaneRHPWidth(windowWidth) + variables.wideRHPRightPaneWidth;
}

export default calculateWideRHPWidth;
