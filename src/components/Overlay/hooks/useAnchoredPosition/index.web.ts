import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import useAnchoredPositionShared from './shared';
import type {UseAnchoredPositionInput, UseAnchoredPositionOutput} from './shared';

function useAnchoredPosition(input: UseAnchoredPositionInput): UseAnchoredPositionOutput {
    const styles = useThemeStyles();
    const {edgeStyle, available, isPositioned, onContentLayout} = useAnchoredPositionShared(input);
    const isCenter = input.alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER;
    const usePreMeasureTranslate = isCenter && input.anchorRect && !isPositioned;
    const centerOverride = usePreMeasureTranslate ? {transform: 'translateX(-50%)'} : {};
    return {
        style: {...styles.pFixed, ...edgeStyle, ...centerOverride},
        available,
        isPositioned: usePreMeasureTranslate ? true : isPositioned,
        onContentLayout,
    };
}

export default useAnchoredPosition;
