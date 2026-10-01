import variables from '@styles/variables';

type SelectionListPopoverContentHeightParams = {
    /** How many options the pop-over should be tall enough to show without scrolling */
    optionCount: number;

    /** Whether the list shows its search input, which sits above the options */
    isSearchable?: boolean;

    /** Height of a single option. Defaults to the standard selection list row */
    optionHeight?: number;
};

/**
 * Height a pop-over needs to show `optionCount` options of a selection list without scrolling.
 *
 * Estimated from the option count rather than measured, so a pop-over opens at its final size instead of
 * resizing once its list has laid out. `getSelectionListPopoverHeight` in the style utils estimates the same way
 * for the Spend filters, which carry a title, a header and an apply button this does not.
 *
 * Callers treat the result as what the list wants, and the space their anchor leaves as what it may have.
 */
function getSelectionListPopoverContentHeight({optionCount, isSearchable = true, optionHeight = variables.optionRowHeight}: SelectionListPopoverContentHeightParams): number {
    return optionCount * optionHeight + (isSearchable ? variables.popoverSearchInputHeight : 0) + variables.popoverVerticalPadding;
}

export default getSelectionListPopoverContentHeight;
