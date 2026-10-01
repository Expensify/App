/**
 * Compacting the report chrome is a mobile web only treatment. Native keeps the full-size header and compose row in
 * landscape, where it isn't competing with the browser's URL bar for vertical space.
 */
function useShouldUseCompactChatChrome(): boolean {
    return false;
}

export default useShouldUseCompactChatChrome;
