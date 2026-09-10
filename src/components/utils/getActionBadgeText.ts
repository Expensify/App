import type {OptionData} from '@libs/ReportUtils';

import type {TranslationPaths} from '@src/languages/types';

function getActionBadgeText(actionBadge: OptionData['actionBadge'], translate: (key: TranslationPaths) => string, shouldShowMarkAsDoneCopy?: boolean): string {
    if (!actionBadge) {
        return '';
    }
    return shouldShowMarkAsDoneCopy ? translate('common.markAsDone') : translate(`common.actionBadge.${actionBadge}`);
}

export default getActionBadgeText;
