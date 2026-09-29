type ShouldYieldFocusToSidePanelComposerParams = {
    /** Whether the composer asking is the one rendered inside the Side Panel */
    isInSidePanel: boolean;

    /** True as soon as the Side Panel starts closing, while its composer is still mounted for the exit animation */
    shouldHideSidePanel: boolean;

    /** Whether a modal was visible on the previous render, i.e. the refocus is running because one just closed */
    didModalJustClose: boolean;

    /** Whether the Side Panel composer currently holds the focus claim */
    hasSidePanelFocusClaim: boolean;
};

/**
 * Both composers run the same refocus effect, so without this the main composer's delayed focus lands first and clears
 * the claim, leaving the Side Panel's own re-check nothing to restore.
 */
function shouldYieldFocusToSidePanelComposer({isInSidePanel, shouldHideSidePanel, didModalJustClose, hasSidePanelFocusClaim}: ShouldYieldFocusToSidePanelComposerParams): boolean {
    return !isInSidePanel && !shouldHideSidePanel && didModalJustClose && hasSidePanelFocusClaim;
}

export default shouldYieldFocusToSidePanelComposer;
