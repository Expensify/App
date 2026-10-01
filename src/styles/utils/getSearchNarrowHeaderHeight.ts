import variables from '@styles/variables';

/**
 * Height of the narrow Search page's floating header, which the list reserves as top padding and the header animation
 * uses as the distance it may travel. Both are derived from this one function so they can never drift apart.
 *
 * Only relevant while the header floats above the list. Where the header scrolls as part of the list's content
 * instead, it takes up real space and needs no padding at all — see useShouldScrollMainHeader.
 */
function getSearchNarrowHeaderHeight(hasFilterBars: boolean): number {
    return hasFilterBars ? variables.searchListContentWithFiltersMarginTop : variables.searchListContentMarginTop;
}

export default getSearchNarrowHeaderHeight;
