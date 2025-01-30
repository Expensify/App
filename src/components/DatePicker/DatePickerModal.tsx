import {setYear} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {PopoverWithMeasuredContentProps} from '@components/PopoverWithMeasuredContent';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import CalendarPicker from './CalendarPicker';

type DatePickerProps = {
    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value?: string;

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue?: string;

    inputID: string;

    /** A minimum date of calendar to select */
    minDate?: Date;

    /** A maximum date of calendar to select */
    maxDate?: Date;

    /** A function that is passed by FormWrapper */
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** ID of the wrapping form */
    formID?: keyof OnyxFormValuesMapping;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Callback to close the modal */
    onClose: () => void;

    /** Callback when date is selected */
    onSelected?: (value: string) => void;

    /** Whether to close the modal when browser navigation changes */
    shouldCloseWhenBrowserNavigationChanged?: boolean;
} & Omit<BaseTextInputProps & PopoverWithMeasuredContentProps, 'anchorRef' | 'children'>;

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
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
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState(value ?? defaultValue ?? undefined);
    const anchorRef = useRef<View>(null);
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        if (shouldSaveDraft && formID) {
            FormActions.setDraftValues(formID, {[inputID]: selectedDate});
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

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={popoverDimensions}
            shouldCloseWhenBrowserNavigationChanged={shouldCloseWhenBrowserNavigationChanged}
            innerContainerStyle={isSmallScreenWidth ? styles.w100 : {width: CONST.POPOVER_DATE_WIDTH}}
            anchorAlignment={DEFAULT_ANCHOR_ORIGIN}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shoudSwitchPositionIfOverflow
            hideModalContentWhileAnimating
            shouldEnableNewFocusManagement
        >
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDate}
                onSelected={handleDateSelection}
            />
        </PopoverWithMeasuredContent>
    );
}

DatePickerModal.displayName = 'DatePickerModal';

export default DatePickerModal;
