import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {WorkspaceExpensifyCardTableRowData} from '.';

/**
 * Who froze the card and when, or nothing when it is not frozen. The row's accessible name and its footer both read
 * this, and the footer's absence is what keeps an unfrozen card from being counted as having an extra row.
 */
function getFrozenByText(item: WorkspaceExpensifyCardTableRowData, translate: LocaleContextProps['translate'], currentAccountID: number | undefined) {
    const formattedFrozenDate = item.frozenDate ? DateUtils.formatWithUTCTimeZone(item.frozenDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT) : '';

    if (!formattedFrozenDate) {
        return undefined;
    }

    if (item.frozenByAccountID === currentAccountID) {
        return translate('cardPage.youFroze', {date: formattedFrozenDate});
    }

    return `${translate('cardPage.frozenByAdminPrefix', {date: formattedFrozenDate})}${item.frozenByDisplayName ?? translate('common.someone')}`;
}

export default getFrozenByText;
