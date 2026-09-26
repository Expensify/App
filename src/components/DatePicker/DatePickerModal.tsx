import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {setYear} from 'date-fns';
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
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState(value ?? defaultValue ?? undefined);
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

    const handleDateSelection = (newValue: string) => {
        onSelected?.(newValue);
        applySelection(newValue);
    };

    const handleMonthOrYearSelection = (newValue: string) => {
        onMonthOrYearSelected?.(newValue);
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
            popoverDimensions={popoverDimensions}
            shouldCloseWhenBrowserNavigationChanged={shouldCloseWhenBrowserNavigationChanged}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DATE_WIDTH}}
            anchorAlignment={anchorAlignment}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
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
                value={selectedDate}
                onSelected={handleDateSelection}
                onMonthOrYearSelected={onMonthOrYearSelected ? handleMonthOrYearSelection : undefined}
                containerStyle={bottomSafeAreaPaddingStyle}
                shouldEnableMonthYearBackdropInNarrowPane={shouldEnableMonthYearBackdropInNarrowPane}
                viewDate={viewDate}
                viewDateVersion={viewDateVersion}
            />
        </PopoverWithMeasuredContent>
    );
}

export default DatePickerModal;
