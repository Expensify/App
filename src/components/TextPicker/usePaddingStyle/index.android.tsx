import useKeyboardState from '@hooks/useKeyboardState';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';

export default function usePaddingStyle() {
    const {keyboardHeight} = useKeyboardState();
    const {paddingTop} = useStyledSafeAreaInsets();

    return {paddingTop, paddingBottom: keyboardHeight};
}
