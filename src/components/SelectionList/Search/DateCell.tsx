import React, {useMemo} from 'react';
import type {TaskListItemType, TransactionListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {isTaskListItemType} from '@libs/SearchUIUtils';
import {getCreated as getTransactionCreated} from '@libs/TransactionUtils';
import CONST from '@src/CONST';

type DateCellProps = {
    item: TransactionListItemType | TaskListItemType;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
};

function DateCell({item, showTooltip, isLargeScreenWidth}: DateCellProps) {
    const styles = useThemeStyles();

    const created = useMemo(() => {
        if (isTaskListItemType(item)) {
            return item.created;
        }

        return getTransactionCreated(item);
    }, [item]);

    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            text={date}
            shouldShowTooltip={showTooltip}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

DateCell.displayName = 'DateCell';
export default DateCell;
