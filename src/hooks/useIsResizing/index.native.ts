/**
 * It's impossible to resize on native, so we can always return false.
 */
function useIsResizing(): boolean {
    return false;
}

export default useIsResizing;
