/**
 * Compacting the header bar is a mobile web only treatment. Native keeps the full-size header in landscape, where it
 * isn't competing with the browser's URL bar for vertical space.
 */
function useShouldUseCompactHeaderBar(): boolean {
    return false;
}

export default useShouldUseCompactHeaderBar;
