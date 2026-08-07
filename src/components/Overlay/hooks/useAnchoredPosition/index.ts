import useThemeStyles from '@hooks/useThemeStyles';

import type {UseAnchoredPositionInput, UseAnchoredPositionOutput} from './shared';

import useAnchoredPositionShared from './shared';

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
