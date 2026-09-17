import DatePickerModal from '@components/DatePicker/DatePickerModal';
import TextWithTooltip from '@components/TextWithTooltip';
import {EditableCell, usePopoverEditState} from '@components/TransactionItemRow/EditableCell';
import type {EditableProps} from '@components/TransactionItemRow/EditableCell/types';

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
        // The calendar has a fixed height, so pass its real height to pick the side to open on. It isn't shrunk —
        // the bottom-edge anchoring is what keeps it off the cell.
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
                    // The calendar's height varies by month and exceeds POPOVER_DATE_MIN_HEIGHT, so measure it: when
                    // opening above the cell (bottom-edge anchored) a too-short assumed height would clip the top.
                    shouldMeasureContentHeight
                    // The calendar can't shrink, so when it's clamped inside a short window keep the same gap from the
                    // window edge that the shrinking category/tag pickers leave, instead of sitting flush against it.
                    windowMargin={CONST.MODAL.POPOVER_MENU_PADDING}
                    shouldPositionFromTop={!shouldOpenAbove}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
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
