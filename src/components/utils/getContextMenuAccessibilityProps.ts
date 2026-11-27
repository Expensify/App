import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

type GetContextMenuAccessibilityPropsParams = {
    accessibilityLabel: string;

    /** Hint for every platform. Web has no accessibility hint, so it is read at the end of the label there instead of being dropped */
    accessibilityHint?: string;

    nativeAccessibilityHint?: string;
    contextMenuHint?: string;
};

function getContextMenuAccessibilityProps({accessibilityLabel, accessibilityHint, nativeAccessibilityHint, contextMenuHint}: GetContextMenuAccessibilityPropsParams) {
    const platform = getPlatform(true);
    const shouldMergeContextMenuHintIntoLabel = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.MOBILE_WEB;
    const accessibilityHintParts = [accessibilityHint, nativeAccessibilityHint, contextMenuHint].filter(Boolean);

    return {
        accessibilityLabel: shouldMergeContextMenuHintIntoLabel ? [accessibilityLabel, accessibilityHint, contextMenuHint].filter(Boolean).join('. ') : accessibilityLabel,
        accessibilityHint: shouldMergeContextMenuHintIntoLabel ? undefined : accessibilityHintParts.join('. ') || undefined,
    };
}

export default getContextMenuAccessibilityProps;
