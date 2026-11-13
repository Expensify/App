/** Only iOS lays the tab bar out as a column, so elsewhere it never is. */
function useIsTabBarVertical(): boolean {
    return false;
}

export default useIsTabBarVertical;
