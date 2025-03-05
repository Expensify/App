import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCreated as getTransactionCreated} from '@libs/TransactionUtils';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import TextWithTooltip from '@components/TextWithTooltip';
import type Transaction from '@src/types/onyx/Transaction';


function DateCell({transactionItem, showTooltip, isLargeScreenWidth} :any) {
    const styles = useThemeStyles();

    const created = getTransactionCreated(transactionItem);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter,styles.textLabelSupporting]}
        />
    );
}

DateCell.displayName = 'DateCell';
export default DateCell;
