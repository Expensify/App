import variables from '@styles/variables';

type SearchRouterPopoverLayout = {
    /** Distance from the top of the viewport to the top of the popover */
    topOffset: number;

    /** Tallest the popover may grow before its list starts to scroll */
    maxHeight: number;
};

/**
 * Works out where the wide-layout search router sits and how tall it may grow.
 *
 * The popover keeps its full top offset while the viewport has room for it. On a short viewport it moves up until it
 * reaches the minimum offset, then stops growing, so it always leaves an equal gap above and below itself.
 */
function getSearchRouterPopoverLayout(windowHeight: number): SearchRouterPopoverLayout {
    const evenGap = (windowHeight - variables.searchRouterPopoverMaxHeight) / 2;
    const topOffset = Math.min(variables.searchRouterPopoverTopOffset, Math.max(variables.searchRouterPopoverMinTopOffset, evenGap));

    return {
        topOffset,
        maxHeight: Math.min(variables.searchRouterPopoverMaxHeight, windowHeight - topOffset * 2),
    };
}

export default getSearchRouterPopoverLayout;
