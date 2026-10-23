// RHPs live inside SafeArea, which already removes the horizontal insets from their navigator's width.
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

function useRHPWindowDimensions() {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {left, right} = useSafeAreaInsets();

    return {windowWidth: Math.max(0, windowWidth - left - right), windowHeight};
}

export default useRHPWindowDimensions;
