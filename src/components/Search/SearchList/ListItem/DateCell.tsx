import DatePickerModal from '@components/DatePicker/DatePickerModal';
import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell/types';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import {format} from 'date-fns';
import React from 'react';

type DateCellProps = {
    date: string;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
    suffixText?: string;

    /**
     * When true, `date` is a full UTC datetime representing a real instant (e.g. submitted/approved/exported) and is rendered
     * in the user's selected timezone, so the day shown matches report history. When false (default), `date` is treated as a
     * calendar value (e.g. transaction date/posted) and rendered with UTC formatting so the displayed day never shifts.
     */
    shouldUseLocalTimeZone?: boolean;
} & EditableProps<string>;

function DateCell({date, showTooltip, isLargeScreenWidth, suffixText, shouldUseLocalTimeZone = false, canEdit, onSave}: DateCellProps) {
    const styles = useThemeStyles();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, anchorAlignment, shouldOpenAbove, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: date,
        popoverHeight: CONST.POPOVER_DATE_MAX_HEIGHT,
        onSave,
    });

    let formattedDate: string;
    if (shouldUseLocalTimeZone && date) {
        const localDate = getLocalDateFromDatetime(date);
        const isPastYear = localDate.getFullYear() !== getLocalDateFromDatetime().getFullYear();
        formattedDate = format(localDate, isPastYear ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT, {locale: dateFnsLocale});
    } else {
        formattedDate = DateUtils.formatWithUTCTimeZone(
            date,
            DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
            dateFnsLocale,
        );
    }
    const displayText = suffixText ? `${formattedDate} • ${suffixText}` : formattedDate;

    const displayContent = (
        <TextWithTooltip
            text={displayText}
            shouldShowTooltip={showTooltip}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.mutedNormalTextLabel, !!suffixText && styles.flexShrink1]}
            isSelectable
        />
    );

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <DatePickerModal
                    value={date}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    onSelected={handleSave}
                    anchorPosition={popoverPosition}
                    anchorAlignment={anchorAlignment}
                    shouldMeasureContentHeight
                    windowMargin={CONST.MODAL.POPOVER_MENU_PADDING}
                    shouldPositionFromTop={!shouldOpenAbove}
                    shouldSwitchPositionIfOverflow={false}
                    isDateSelectable={DateUtils.isWithinCalendarPickerRange}
                    inputID="EditableDateCell"
                    shouldEnableMonthYearBackdropInNarrowPane={isEditing && isInNarrowPaneModal}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default DateCell;
