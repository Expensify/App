import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type DateCellProps = {
    date: string;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
    suffixText?: string;
    /** Optional text to display instead of the formatted date (e.g., 'Scanning') */
    displayText?: string;
};

function DateCell({date, showTooltip, isLargeScreenWidth, suffixText, displayText: displayTextOverride}: DateCellProps) {
    const styles = useThemeStyles();

    const formattedDate = DateUtils.formatWithUTCTimeZone(date, DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    const displayText = displayTextOverride ?? (suffixText ? `${formattedDate} • ${suffixText}` : formattedDate);

    return (
        <TextWithTooltip
            text={displayText}
            shouldShowTooltip={showTooltip}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.mutedNormalTextLabel, !!suffixText && styles.flexShrink1]}
        />
    );
}

export default DateCell;
