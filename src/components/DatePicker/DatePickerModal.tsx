import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {format} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';

import type {DatePickerProps} from './types';

import CalendarPicker from './CalendarPicker';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const popoverDimensions = {
    height: CONST.POPOVER_DATE_MIN_HEIGHT,
    width: CONST.POPOVER_DATE_WIDTH,
};

// A zero height makes the popover measure the calendar's rendered height.
const measuredPopoverDimensions = {
    height: 0,
    width: CONST.POPOVER_DATE_WIDTH,
};

function DatePickerModal({
    value,
    defaultValue,
    inputID,
    minDate,
    maxDate,
    isDateSelectable,
    onInputChange,
    onTouched,
    shouldSaveDraft = false,
    formID,
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment = DEFAULT_ANCHOR_ORIGIN,
    onSelected,
    onMonthOrYearSelected,
    shouldCloseWhenBrowserNavigationChanged = false,
    shouldPositionFromTop = false,
    forwardedFSClass,
    shouldEnableMonthYearBackdropInNarrowPane = false,
    anchorRef: anchorRefProp,
    withoutOverlay = false,
    shouldAllowWithoutOverlayInNarrowPane = false,
    shouldCloseOnWheel = true,
    viewDate,
    viewDateVersion,
    onMonthOrYearPickerClose,
    shouldMeasureContentHeight = false,
    windowMargin,
    shouldSwitchPositionIfOverflow = true,
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState(value);
    const fallbackAnchorRef = useRef<ComponentRef<typeof View>>(null);
    // PopoverProvider treats a click inside the anchor as "not outside", so the caller's own anchor has to be used
    // or clicking the date input while the calendar is open would dismiss it.
    const anchorRef = anchorRefProp ?? fallbackAnchorRef;
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: selectedDate});
        }
        if (selectedDate !== value) {
            setSelectedDate(value);
        }
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    const applySelection = (newValue: string) => {
        onTouched?.();
        onInputChange?.(newValue);
        setSelectedDate(newValue);
    };

    const handleDateSelection = (date: Date) => {
        const newValue = format(date, CONST.DATE.FNS_FORMAT_STRING);
        onSelected?.(newValue);
        applySelection(newValue);
    };

    const applyMonthOrYearSelection = (newValue: string) => {
        onMonthOrYearSelected?.(newValue);

        // An empty field has no day to mark as selected, so the pick only moves the calendar
        if (!value) {
            return;
        }

        applySelection(newValue);
    };

    // Pass the CalendarPicker's existing bottom padding (pb4) as the base style so the safe-area padding is
    // added on top of it instead of overriding it (containerStyle is applied after pb4 in CalendarPicker).
    // The modal doesn't render an offline indicator inside it, so disable the offline-indicator padding —
    // otherwise it reserves extra bottom space whenever the user is offline.
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false, style: styles.pb4});

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={shouldMeasureContentHeight ? measuredPopoverDimensions : popoverDimensions}
            windowMargin={windowMargin}
            shouldCloseWhenBrowserNavigationChanged={shouldCloseWhenBrowserNavigationChanged}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DATE_WIDTH}}
            anchorAlignment={anchorAlignment}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}
            shouldReturnFocus={false}
            shouldMeasureAnchorPositionFromTop={shouldPositionFromTop}
            shouldSkipRemeasurement
            forwardedFSClass={forwardedFSClass}
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
            withoutOverlay={withoutOverlay}
            shouldAllowWithoutOverlayInNarrowPane={shouldAllowWithoutOverlayInNarrowPane}
            shouldCloseOnWheel={shouldCloseOnWheel}
        >
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
                isDateSelectable={isDateSelectable}
                value={DateUtils.parseCalendarDate(selectedDate)}
                defaultMonth={DateUtils.parseCalendarDate(defaultValue)}
                onSelected={handleDateSelection}
                onMonthOrYearSelected={onMonthOrYearSelected ? applyMonthOrYearSelection : undefined}
                containerStyle={bottomSafeAreaPaddingStyle}
                shouldEnableMonthYearBackdropInNarrowPane={shouldEnableMonthYearBackdropInNarrowPane}
                viewDate={viewDate}
                viewDateVersion={viewDateVersion}
                onMonthOrYearPickerClose={onMonthOrYearPickerClose}
            />
        </PopoverWithMeasuredContent>
    );
}

export default DatePickerModal;
