import {setYear} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
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
    onSelected,
    shouldCloseWhenBrowserNavigationChanged = false,
    shouldPositionFromTop = false,
    anchorAlignment = DEFAULT_ANCHOR_ORIGIN,
    forwardedFSClass,
    showConfirmButtons = false,
}: DatePickerProps) {
    const [pendingDate, setPendingDate] = useState(value ?? defaultValue ?? undefined);
    const anchorRef = useRef<View>(null);
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Keep pending date in sync with external value changes
    useEffect(() => {
        setPendingDate(value);
    }, [value]);

    const commitDate = (newValue: string) => {
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: newValue});
        }
        onSelected?.(newValue);
        onTouched?.();
        onInputChange?.(newValue);
    };

    const handleDateSelection = (newValue: string) => {
        setPendingDate(newValue);
        if (!showConfirmButtons) {
            commitDate(newValue);
        }
    };

    const handleConfirm = () => {
        if (pendingDate) {
            commitDate(pendingDate);
        }
        onClose();
    };

    const handleCancel = () => {
        setPendingDate(value);
        onClose();
    };

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={showConfirmButtons ? handleCancel : onClose}
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
            <View>
                <CalendarPicker
                    minDate={minDate}
                    maxDate={maxDate}
                    value={pendingDate}
                    onSelected={handleDateSelection}
                />
            </View>
            {showConfirmButtons && (
                <ConfirmCancelButtonRow
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    isConfirmDisabled={!pendingDate}
                />
            )}
        </PopoverWithMeasuredContent>
    );
}

export default DatePickerModal;
