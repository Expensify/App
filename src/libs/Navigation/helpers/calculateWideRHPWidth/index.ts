import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';

import variables from '@styles/variables';

/** Single source for the wide RHP width. The frame, its card and the super wide fallback all size from it, or the frame outgrows its card and both borders show. */
function calculateWideRHPWidth(windowWidth: number) {
    return calculateReceiptPaneRHPWidth(windowWidth) + variables.wideRHPRightPaneWidth;
}

export default calculateWideRHPWidth;
