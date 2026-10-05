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
 * Height a pop-over needs to show `optionCount` options without scrolling. Estimated rather than measured, so it
 * opens at its final size instead of resizing after layout, the same way `getSelectionListPopoverHeight` does for
 * the Spend filters, which also carry a title, header and apply button this does not.
 */
function getSelectionListPopoverContentHeight({optionCount, isSearchable = true, optionHeight = variables.optionRowHeight}: SelectionListPopoverContentHeightParams): number {
    return optionCount * optionHeight + (isSearchable ? variables.popoverSearchInputHeight : 0) + variables.popoverVerticalPadding;
}

export default getSelectionListPopoverContentHeight;
