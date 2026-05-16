import React from 'react';
import DatePickerModal from '@components/DatePicker/DatePickerModal';
import TextWithTooltip from '@components/TextWithTooltip';
import {EditableCell, usePopoverEditState} from '@components/TransactionItemRow/EditableCell';
import type {EditableProps} from '@components/TransactionItemRow/EditableCell/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type DateCellProps = {
    date: string;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
    suffixText?: string;
} & EditableProps<string>;

function DateCell({date, showTooltip, isLargeScreenWidth, suffixText, canEdit, onSave}: DateCellProps) {
    const styles = useThemeStyles();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing} = usePopoverEditState({canEdit});

    const formattedDate = DateUtils.formatWithUTCTimeZone(date, DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    const displayText = suffixText ? `${formattedDate} • ${suffixText}` : formattedDate;

    const handleDateSelected = (newDate: string) => {
        onSave?.(newDate);
        cancelEditing();
    };

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
                    onSelected={handleDateSelected}
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
