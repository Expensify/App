import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type DateCellProps = {
    date: string;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
};

function DateCell({date, showTooltip, isLargeScreenWidth}: DateCellProps) {
    const styles = useThemeStyles();

    const formattedDate = DateUtils.formatWithUTCTimeZone(date, DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            text={formattedDate}
            shouldShowTooltip={showTooltip}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

export default DateCell;
