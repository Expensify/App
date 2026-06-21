import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import useAnchoredPositionShared from './shared';
import type {UseAnchoredPositionInput, UseAnchoredPositionOutput} from './shared';

function useAnchoredPosition(input: UseAnchoredPositionInput): UseAnchoredPositionOutput {
    const styles = useThemeStyles();
    const {edgeStyle, available, isPositioned, onContentLayout} = useAnchoredPositionShared(input);
    const isCenter = input.alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER;
    // Pre-measure transform is harmless; flipping isPositioned would trick FloatingHost's maxHeight gate.
    const centerOverride = isCenter && input.anchorRect && !isPositioned ? styles.overlayCenteringTransform : {};
    return {
        style: {...styles.pFixed, ...edgeStyle, ...centerOverride},
        available,
        isPositioned,
        onContentLayout,
    };
}

export default useAnchoredPosition;
