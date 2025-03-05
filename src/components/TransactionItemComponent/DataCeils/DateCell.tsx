import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCreated as getTransactionCreated} from '@libs/TransactionUtils';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import TextWithTooltip from '@components/TextWithTooltip';
import colors from '@styles/theme/colors';
import DataCellProps from '@components/TransactionItemComponent/DataCeils/DateCellProps';


function DateCell({transactionItem, showTooltip, isLargeScreenWidth} :DataCellProps) {
    const styles = useThemeStyles();

    const created = getTransactionCreated(transactionItem);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.pre, styles.justifyContentCenter,isLargeScreenWidth? {color:colors.green800} : styles.textLabelSupporting]}
        />
    );
}

DateCell.displayName = 'DateCell';
export default DateCell;
