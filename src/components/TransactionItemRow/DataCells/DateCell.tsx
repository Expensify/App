import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getCreated as getTransactionCreated} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

function DateCell({transactionItem, shouldShowTooltip, shouldUseNarrowLayout}: TransactionDataCellProps) {
    const styles = useThemeStyles();

    const created = getTransactionCreated(transactionItem);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={date}
            style={[styles.pre, styles.justifyContentCenter, shouldUseNarrowLayout ? styles.textMicroSupporting : undefined]}
        />
    );
}

DateCell.displayName = 'DateCell';
export default DateCell;
