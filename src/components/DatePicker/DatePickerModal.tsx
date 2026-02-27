import {setYear} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import ConfirmCancelButtonRow from '@components/ConfirmCancelButtonRow';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import CalendarPicker from './CalendarPicker';
import type {DatePickerProps} from './types';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};
const popoverDimensions = {
    height: CONST.POPOVER_DATE_MIN_HEIGHT,
    width: CONST.POPOVER_DATE_WIDTH,
};

function DatePickerModal({
    value,
    defaultValue,
    inputID,
    minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    onInputChange,
    onTouched,
    shouldSaveDraft = false,
    formID,
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment = DEFAULT_ANCHOR_ORIGIN,
    onSelected,
    shouldCloseWhenBrowserNavigationChanged = false,
    shouldPositionFromTop = false,
    forwardedFSClass,
    shouldShowConfirmButtons = false,
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState(value ?? defaultValue ?? undefined);
    const anchorRef = useRef<View>(null);
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        // In confirm mode, selectedDate is a pending selection and should not be synced with value until the user confirms
        if (shouldShowConfirmButtons) {
            return;
        }
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: selectedDate});
        }
        if (selectedDate !== value) {
            setSelectedDate(value);
        }
    }, [formID, inputID, selectedDate, shouldSaveDraft, shouldShowConfirmButtons, value]);

    const commitDate = (date: string) => {
        onSelected?.(date);
        onTouched?.();
        onInputChange?.(date);
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: date});
        }
    };

    const handleDateSelection = (newValue: string) => {
        setSelectedDate(newValue);
        if (!shouldShowConfirmButtons) {
            commitDate(newValue);
        }
    };

    const handleConfirm = () => {
        if (selectedDate) {
            commitDate(selectedDate);
        }
        onClose();
    };

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            shouldCloseWhenBrowserNavigationChanged={shouldCloseWhenBrowserNavigationChanged}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DATE_WIDTH}}
            anchorAlignment={anchorAlignment}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldPositionFromTop}
            shouldSkipRemeasurement
            forwardedFSClass={forwardedFSClass}
            shouldDisplayBelowModals
        >
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDate}
                onSelected={handleDateSelection}
            />
            {shouldShowConfirmButtons && (
                <ConfirmCancelButtonRow
                    onConfirm={handleConfirm}
                    onCancel={onClose}
                    isConfirmDisabled={!selectedDate}
                />
            )}
        </PopoverWithMeasuredContent>
    );
}

export default DatePickerModal;
