import useThemeStyles from '@hooks/useThemeStyles';
import useAnchoredPositionShared from './shared';
import type {UseAnchoredPositionInput, UseAnchoredPositionOutput} from './shared';

function useAnchoredPosition(input: UseAnchoredPositionInput): UseAnchoredPositionOutput {
    const styles = useThemeStyles();
    const {edgeStyle, available, isPositioned, onContentLayout} = useAnchoredPositionShared(input);
    return {
        style: {...styles.pAbsolute, ...edgeStyle},
        available,
        isPositioned,
        onContentLayout,
    };
}

export default useAnchoredPosition;
