import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';

/**
 * How much of the Side Panel width the super wide RHP can give up before its own panes stop fitting.
 * Each stacked RHP card clips its content to its own box, so a sheet narrower than the wide RHP cuts
 * the receipt pane off. The sheet is free to reach further left instead, like it does without the Side Panel.
 */
function calculateMaxSidePanelRHPShrink(windowWidth: number) {
    return Math.max(0, calculateSuperWideRHPWidth(windowWidth) - calculateWideRHPWidth(windowWidth));
}

export default calculateMaxSidePanelRHPShrink;
