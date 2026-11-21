import useInitialDimensions from '@hooks/useInitialWindowDimensions';

/** The screen height with the soft keyboard closed. */
function useHeightWithoutKeyboard(): number {
    const {initialHeight} = useInitialDimensions();
    return initialHeight;
}

export default useHeightWithoutKeyboard;
