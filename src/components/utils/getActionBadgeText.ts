import type {OptionData} from '@libs/ReportUtils';

import type {TranslationPaths} from '@src/languages/types';

function getActionBadgeText(actionBadge: OptionData['actionBadge'], translate: (key: TranslationPaths) => string, isMarkAsDone?: boolean): string {
    if (!actionBadge) {
        return '';
    }
    return isMarkAsDone ? translate('common.markAsDone') : translate(`common.actionBadge.${actionBadge}`);
}

export default getActionBadgeText;
