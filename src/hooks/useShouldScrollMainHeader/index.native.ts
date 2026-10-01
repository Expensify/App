/**
 * Scrolling the main header away is a mobile web only treatment. Native keeps the pinned header in landscape.
 */
function useShouldScrollMainHeader(): boolean {
    return false;
}

export default useShouldScrollMainHeader;
