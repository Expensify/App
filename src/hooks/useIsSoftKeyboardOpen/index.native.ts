import useKeyboardState from '@hooks/useKeyboardState';

/** Native gets the keyboard state straight from the OS, so the web focus heuristic isn't needed here. */
function useIsSoftKeyboardOpen(): boolean {
    const {isKeyboardShown} = useKeyboardState();

    return isKeyboardShown;
}

export default useIsSoftKeyboardOpen;
