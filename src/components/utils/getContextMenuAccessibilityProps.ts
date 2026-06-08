import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type GetContextMenuAccessibilityPropsParams = {
    accessibilityLabel: string;
    nativeAccessibilityHint?: string;
    contextMenuHint?: string;
};

function getContextMenuAccessibilityProps({accessibilityLabel, nativeAccessibilityHint, contextMenuHint}: GetContextMenuAccessibilityPropsParams) {
    const platform = getPlatform(true);
    const shouldMergeContextMenuHintIntoLabel = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.MOBILE_WEB;
    const accessibilityHintParts = [nativeAccessibilityHint, contextMenuHint].filter(Boolean);

    return {
        accessibilityLabel: shouldMergeContextMenuHintIntoLabel && contextMenuHint ? [accessibilityLabel, contextMenuHint].filter(Boolean).join('. ') : accessibilityLabel,
        accessibilityHint: shouldMergeContextMenuHintIntoLabel ? undefined : accessibilityHintParts.join('. ') || undefined,
    };
}

export default getContextMenuAccessibilityProps;
