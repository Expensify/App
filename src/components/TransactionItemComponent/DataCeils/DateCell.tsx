import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getCreated as getTransactionCreated} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

function DateCell({transactionItem, showTooltip, isLargeScreenWidth}: TransactionDataCellProps) {
    const styles = useThemeStyles();

    const created = getTransactionCreated(transactionItem);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? {color: colors.green800} : styles.textLabelSupporting]}
        />
    );
}

DateCell.displayName = 'DateCell';
export default DateCell;
