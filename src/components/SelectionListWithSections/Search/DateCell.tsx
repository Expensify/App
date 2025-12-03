import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type DateCellProps = {
    created: string;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
};

function DateCell({created, showTooltip, isLargeScreenWidth}: DateCellProps) {
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();

    const date = DateUtils.formatWithUTCTimeZone(
        created,
        DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
        preferredLocale,
    );

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
