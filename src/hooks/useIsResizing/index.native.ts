/**
 * It's impossible to resize on native, so we can always return false.
 */
function useIsResizing(): {isResizing: boolean; windowWidth: number} {
    return {isResizing: false, windowWidth: 0};
}

export default useIsResizing;
