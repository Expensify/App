import {setYear} from 'date-fns';
import React, {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {DatePopoverAnchor} from '@libs/actions/DatePickerAction';
import type {AnchorOrigin} from '@libs/actions/EmojiPickerAction';
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
} & BaseTextInputProps;

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};
function DatePickerModal({
    defaultValue,
    inputID,
    maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    onInputChange,
    onTouched,
    value,
    shouldSaveDraft = false,
    formID,
    //
    isVisible,
    onClose,
    anchorPosition = {horizontal: 0, vertical: 0},
    onSelected,
}: DatePickerProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);

    const onHandleSelected = (newValue: string) => {
        onSelected?.(newValue);
        onTouched?.();
        onInputChange?.(newValue);
        setSelectedDate(newValue);
    };

    const [datePopoverAnchorOrigin, setDatePopoverAnchorOrigin] = useState<AnchorOrigin>(DEFAULT_ANCHOR_ORIGIN);
    // const [activeID, setActiveID] = useState<string | null>();
    const datePopoverAnchorRef = useRef<DatePopoverAnchor | null>(null);
    const dateAnchorDimension = useRef({
        width: 0,
        height: 0,
    });

    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();

    /**
     * Get the popover anchor ref
     *
     * datePopoverAnchorRef contains either null or the ref object of the anchor element.
     * { current: { current: anchorElement } }
     *
     * Don't directly get the ref from datePopoverAnchorRef, instead use getDatePopoverAnchor()
     */
    const getDatePopoverAnchor = useCallback(() => datePopoverAnchorRef.current ?? (datePopoverAnchorRef as DatePopoverAnchor), []);

    useEffect(() => {
        // Value is provided to input via props and onChange never fires. We have to save draft manually.
        if (shouldSaveDraft && !!formID) {
            FormActions.setDraftValues(formID, {[inputID]: selectedDate});
        }

        if (selectedDate === value || !value) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);
    console.log('shouldUseNarrowLayout_1', shouldUseNarrowLayout);
    return (
        <PopoverWithMeasuredContent
            // shouldHandleNavigationBack={BrowserDetect.isMobileChrome()}
            isVisible={isVisible}
            onClose={onClose}
            // onModalShow={focusDateSearchInput}
            // onModalHide={onModalHide.current}
            onModalHide={() => {
                console.log('onModalHide');
            }}
            hideModalContentWhileAnimating
            // shouldSetModalVisibility={false}
            animationInTiming={1}
            animationOutTiming={1}
            anchorPosition={{
                // vertical: datePopoverAnchorPosition.vertical,
                // horizontal: datePopoverAnchorPosition.horizontal,
                vertical: anchorPosition.vertical,
                // vertical: 50,
                horizontal: anchorPosition.horizontal,
                // horizontal: 50,
            }}
            anchorRef={getDatePopoverAnchor() as RefObject<View | HTMLDivElement>}
            withoutOverlay
            popoverDimensions={{
                // width: CONST.EMOJI_PICKER_SIZE.WIDTH,
                // height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
                width: 335,
                height: 516,
            }}
            anchorAlignment={datePopoverAnchorOrigin}
            // outerStyle={StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)}
            innerContainerStyle={styles.popoverInnerContainer}
            anchorDimensions={dateAnchorDimension.current}
            // avoidKeyboard
            shoudSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            //
            // type={CONST.MODAL.MODAL_TYPE.POPOVER}
            shouldCloseWhenBrowserNavigationChanged={false}
            innerContainerStyle={{width: isSmallScreenWidth ? '100%' : 335}}
        >
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDate}
                onSelected={onHandleSelected}
            />
        </PopoverWithMeasuredContent>
    );
}

DatePickerModal.displayName = 'DatePickerModal';

export default DatePickerModal;
