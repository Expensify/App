import {setYear} from 'date-fns';
import React from 'react';
import DatePickerModal from '@components/DatePicker/DatePickerModal';
import {EditableCell, usePopoverEditState} from '@components/Table/EditableCell';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type DateCellProps = {
    date: string;
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
    canEdit?: boolean;
    onSave?: (date: string) => void;
};

function DateCell({date, showTooltip, isLargeScreenWidth, canEdit, onSave}: DateCellProps) {
    const styles = useThemeStyles();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, closePopover} = usePopoverEditState({
        anchorEdge: 'left',
    });

    const formattedDate = DateUtils.formatWithUTCTimeZone(date, DateUtils.doesDateBelongToAPastYear(date) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    const handleDateSelected = (newDate: string) => {
        onSave?.(newDate);
        closePopover();
    };

    const displayContent = (
        <TextWithTooltip
            text={formattedDate}
            shouldShowTooltip={showTooltip}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
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
                    onClose={closePopover}
                    onSelected={handleDateSelected}
                    anchorPosition={popoverPosition}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    shouldPositionFromTop={!isInverted}
                    minDate={setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR)}
                    maxDate={setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR)}
                    inputID="EditableDateCell"
                    showConfirmButtons
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default DateCell;
