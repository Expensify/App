import {setYear} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import CalendarPicker from './CalendarPicker';
import type {DatePickerProps} from './types';
import useIsYearSelectorOpen from './useIsYearSelectorOpen';

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
    shouldEnableMonthYearBackdropInNarrowPane = false,
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState(value ?? defaultValue ?? undefined);
    const anchorRef = useRef<View>(null);
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const isDesktopWeb = getPlatform() === CONST.PLATFORM.WEB && !isSmallScreenWidth;
    const isYearSelectorOpen = useIsYearSelectorOpen();
    // On desktop web the date popover stays mounted while the year-selector RHP is open (so the picked year is
    // applied on return). Hide its frame and make the whole modal subtree pointer-transparent so the RHP renders
    // clean and its years are clickable — the inner CalendarPicker already self-hides the same way.
    const shouldHideForYearSelector = isDesktopWeb && isYearSelectorOpen;

    useEffect(() => {
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: selectedDate});
        }
        if (selectedDate !== value) {
            setSelectedDate(value);
        }
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    const handleDateSelection = (newValue: string) => {
        onSelected?.(newValue);
        onTouched?.();
        onInputChange?.(newValue);
        setSelectedDate(newValue);
    };

    // Pass the CalendarPicker's existing bottom padding (pb4) as the base style so the safe-area padding is
    // added on top of it instead of overriding it (containerStyle is applied after pb4 in CalendarPicker).
    // The modal doesn't render an offline indicator inside it, so disable the offline-indicator padding —
    // otherwise it reserves extra bottom space whenever the user is offline.
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false, style: styles.pb4});

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            // While the year-selector route is focused (wide-screen hide-in-place), hide the whole popover frame —
            // not just the inner CalendarPicker — so the year-selector RHP isn't painted over the date popover.
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            // Suppress the popstate close while the year selector is open; selecting a year does a goBack (history
            // change) and would otherwise tear this host down instead of returning to it with the new year applied.
            shouldCloseWhenBrowserNavigationChanged={shouldCloseWhenBrowserNavigationChanged && !isYearSelectorOpen}
            hasBackdrop={!shouldHideForYearSelector}
            shouldDisablePointerEvents={shouldHideForYearSelector}
            innerContainerStyle={{
                ...(isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DATE_WIDTH}),
                ...(shouldHideForYearSelector ? {opacity: 0, visibility: 'hidden', pointerEvents: 'none'} : {}),
            }}
            anchorAlignment={anchorAlignment}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldReturnFocus={false}
            shouldMeasureAnchorPositionFromTop={shouldPositionFromTop}
            shouldSkipRemeasurement
            forwardedFSClass={forwardedFSClass}
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDate}
                onSelected={handleDateSelection}
                containerStyle={bottomSafeAreaPaddingStyle}
                shouldEnableMonthYearBackdropInNarrowPane={shouldEnableMonthYearBackdropInNarrowPane}
                pickerContextID={`datePicker-${inputID}`}
                shouldCloseModalOnYearPickerOpen={!isDesktopWeb}
            />
        </PopoverWithMeasuredContent>
    );
}

export default DatePickerModal;
