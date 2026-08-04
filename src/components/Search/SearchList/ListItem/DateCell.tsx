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
    const {getLocalDateFromDatetime} = useLocalize();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: date,
        onSave,
    });

    let formattedDate: string;
    if (shouldUseLocalTimeZone && date) {
        const localDate = getLocalDateFromDatetime(date);
        const isPastYear = localDate.getFullYear() !== getLocalDateFromDatetime().getFullYear();
        formattedDate = format(localDate, isPastYear ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    } else {
        formattedDate = DateUtils.formatWithUTCTimeZone(date, DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
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
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    shouldPositionFromTop={!isInverted}
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
