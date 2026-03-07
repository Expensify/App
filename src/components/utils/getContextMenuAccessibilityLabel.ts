import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type GetContextMenuAccessibilityLabelParams = {
    labelParts: string[];
    translate: (key: TranslationPaths) => string;
    shouldShowReviewRequired?: boolean;
    shouldShowContextMenuHint?: boolean;
};

function getContextMenuAccessibilityLabel({labelParts, translate, shouldShowReviewRequired = false, shouldShowContextMenuHint = false}: GetContextMenuAccessibilityLabelParams) {
    const shouldAnnounceContextMenu = shouldShowContextMenuHint && getPlatform(true) === CONST.PLATFORM.WEB;

    return [...labelParts, shouldShowReviewRequired ? translate('common.yourReviewIsRequired') : '', shouldAnnounceContextMenu ? translate('accessibilityHints.contextMenuAvailable') : '']
        .filter(Boolean)
        .join('. ');
}

export default getContextMenuAccessibilityLabel;
