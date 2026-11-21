/** Native tables don't hold pinned cells in place yet, so there is no scroll offset to share with them. */
function usePinnedScrollVariables(): () => void {
    return () => {};
}

export default usePinnedScrollVariables;
