import variables from '@styles/variables';

/**
 * Height of the narrow Search page's floating header, which the list reserves as top padding and the header animation
 * uses as the distance it may travel.
 */
function getSearchNarrowHeaderHeight(hasFilterBars: boolean): number {
    return hasFilterBars ? variables.searchListContentWithFiltersMarginTop : variables.searchListContentMarginTop;
}

export default getSearchNarrowHeaderHeight;
