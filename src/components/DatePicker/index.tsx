import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDateSegmentInput from '@hooks/useDateSegmentInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useRemeasureOnScroll from '@hooks/useRemeasureOnScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import ComposerFocusManager from '@libs/ComposerFocusManager';
import isTypedDateInputSupported from '@libs/isTypedDateInputSupported';
import {isNumeric} from '@libs/ValidationUtils';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';

import type {TextInputKeyPressEvent} from 'react-native';

import {format, setYear} from 'date-fns';
import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';

import type {DateInputWithPickerProps} from './types';

import DatePickerModal from './DatePickerModal';

const PADDING_MODAL_DATE_PICKER = 8;

function DatePicker({
    defaultValue,
    disabled,
    errorText,
    inputID,
    label,
    minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    onInputChange,
    onTouched = () => {},
    placeholder,
    value,
    shouldSaveDraft = false,
    formID,
    autoFocus = false,
    shouldHideClearButton = false,
    autoComplete = 'off',
    forwardedFSClass,
    shouldDeferShowUntilPositioned = false,
    shouldDismissKeyboardBeforeShow = false,
    rightHandSideComponent,
    onPickerVisibilityChange,
    shouldHideCalendarIcon = false,
}: DateInputWithPickerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Calendar']);
    const styles = useThemeStyles();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const announcementMessage = label ? `${label}, ${translate('common.calendarOpened')}` : translate('common.calendarOpened');
    useAccessibilityAnnouncement(announcementMessage, isModalVisible, {shouldAnnounceOnNative: true, shouldAnnounceOnWeb: true});
    const [selectedDate, setSelectedDate] = useState(() => value ?? defaultValue ?? '');
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
    const textInputRef = useRef<BaseTextInputRef | null>(null);
    const anchorRef = useRef<View>(null);
    const [isInverted, setIsInverted] = useState(false);
    // Whether the user currently intends the picker to be open. Lets a deferred measurement skip opening if the
    // picker was dismissed before it resolved.
    const openIntentRef = useRef(false);

    const shouldAllowTyping = isTypedDateInputSupported();
    const dateMask = translate('common.dateFormat');

    // Updates the field without ending the selection, so the calendar stays open for whatever the user does next
    const commitDate = (newDate: string) => {
        setSelectedDate(newDate);
        onTouched?.();
        onInputChange?.(newDate);
    };

    // The hook is the single gate on typing. When the platform does not allow it, the handlers it returns are no-ops
    // and the value passes straight through, so the call sites below do not have to check again.
    const segmentInput = useDateSegmentInput({value: selectedDate, isEnabled: shouldAllowTyping, minDate, maxDate, onCommit: commitDate});

    const {inputCallbackRef: autoFocusCallbackRef, cancelAutoFocus} = useAutoFocusInput();
    const autoFocusCallbackRefRef = useRef(autoFocusCallbackRef);
    autoFocusCallbackRefRef.current = autoFocusCallbackRef;

    useEffect(() => {
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: selectedDate});
        }
        if (selectedDate === value) {
            return;
        }
        if (value === undefined) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    const calculatePopoverPosition = useCallback(
        (onMeasured?: () => void) => {
            anchorRef.current?.measureInWindow((x, y, width, height) => {
                const wouldExceedBottom = y + CONST.POPOVER_DATE_MAX_HEIGHT + PADDING_MODAL_DATE_PICKER > windowHeight;
                setIsInverted(wouldExceedBottom);

                setPopoverPosition({
                    horizontal: x + width,
                    vertical: y + (wouldExceedBottom ? 0 : height + PADDING_MODAL_DATE_PICKER),
                });

                onMeasured?.();
            });
        },
        [windowHeight],
    );

    const setPickerVisibility = useCallback(
        (isVisible: boolean) => {
            setIsModalVisible(isVisible);
            onPickerVisibilityChange?.(isVisible);
        },
        [onPickerVisibilityChange],
    );

    const showDatePickerModal = useCallback(() => {
        // Re-opening would remeasure and re-announce a calendar that is already showing. Both a press and a focus can
        // ask for it, and while typing both arrive for a single click.
        if (isModalVisible) {
            return;
        }

        cancelAutoFocus();

        // While typing is allowed the calendar sits under an input the user is still writing in, so the caret has to
        // stay put. Otherwise blur first so focus is not returned once the modal closes.
        if (!shouldAllowTyping) {
            textInputRef.current?.blur();
        }

        if (shouldDismissKeyboardBeforeShow && !shouldAllowTyping) {
            // Blur whichever input is focused (e.g. a preceding text field) so closing the picker does not briefly restore its keyboard.
            ComposerFocusManager.blurActiveInput();
            // Dismiss in parallel with opening — do not await the hide animation or the open feels sluggish.
            Keyboard.dismiss();
        }

        const openPicker = () => {
            if (!shouldDeferShowUntilPositioned) {
                calculatePopoverPosition();
                setPickerVisibility(true);
                return;
            }

            openIntentRef.current = true;
            calculatePopoverPosition(() => {
                if (!openIntentRef.current) {
                    return;
                }
                setPickerVisibility(true);
            });
        };

        openPicker();
    }, [isModalVisible, shouldDeferShowUntilPositioned, shouldDismissKeyboardBeforeShow, shouldAllowTyping, calculatePopoverPosition, cancelAutoFocus, setPickerVisibility]);

    const closeDatePicker = useCallback(() => {
        openIntentRef.current = false;
        setPickerVisibility(false);

        if (!shouldDismissKeyboardBeforeShow || shouldAllowTyping) {
            return;
        }

        textInputRef.current?.blur();
        ComposerFocusManager.blurActiveInput();
        Keyboard.dismiss();
    }, [shouldDismissKeyboardBeforeShow, shouldAllowTyping, setPickerVisibility]);

    const handlePress = useCallback<NonNullable<BaseTextInputProps['onPress']>>(
        (event) => {
            // The field focuses its own input on any press it is not told to leave alone, which would be the year
            // whichever segment was actually pressed. The segments are focused by the press itself instead.
            if ('preventDefault' in event) {
                event.preventDefault();
            }

            showDatePickerModal();
        },
        [showDatePickerModal],
    );

    // Reaching the field by keyboard never fires a press, so focus is what opens the calendar once typing is allowed.
    // The segments report their own focus to the hook, so there is nothing to seed here.
    const handleFocus = () => {
        showDatePickerModal();
    };

    const handleInputKeyPress = useCallback(
        (event: TextInputKeyPressEvent) => {
            if (!isNumeric(event.nativeEvent.key)) {
                return;
            }
            event.preventDefault();
            showDatePickerModal();
        },
        [showDatePickerModal],
    );

    const handleDateSelected = (newDate: string) => {
        onTouched?.();
        setSelectedDate(newDate);
        closeDatePicker();
        // Defer until after the popover close is committed so consumers are not suppressed by modal state.
        requestAnimationFrame(() => onInputChange?.(newDate));
    };

    // Only the typing calendar stays open while the page scrolls. Every other one is dismissed instead, so it never
    // has to follow the field, and following it keeps an edit in progress from being interrupted.
    useRemeasureOnScroll({isActive: shouldAllowTyping && isModalVisible, remeasure: calculatePopoverPosition});

    // The error text renders inside the anchor, so showing or hiding it changes the height the calendar was positioned
    // from. Remeasuring on the anchor's own layout covers that without having to name each thing that can resize it.
    const handleAnchorLayout = () => {
        if (!isModalVisible) {
            return;
        }

        calculatePopoverPosition();
    };

    const handleClear = () => {
        onTouched?.();
        onInputChange?.('');
        setSelectedDate('');
    };

    useEffect(() => {
        // Debounce so rapid resize/orientation changes collapse into a single measurement instead of
        // recalculating the popover position on every intermediate dimension tick.
        const debouncedCalculatePopoverPosition = debounce(calculatePopoverPosition, CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        debouncedCalculatePopoverPosition();

        return () => debouncedCalculatePopoverPosition.cancel();
    }, [calculatePopoverPosition, windowWidth]);

    // Combined ref: updates textInputRef (needed for blur() in showDatePickerModal) and connects
    // autoFocusCallbackRef only when autoFocus=true so useAutoFocusInput's useFocusEffect cleanup
    // can cancel any pending focus task when the screen starts closing.
    const combinedTextInputRef = useCallback(
        (ref: BaseTextInputRef | null) => {
            textInputRef.current = ref;
            if (autoFocus) {
                (autoFocusCallbackRefRef.current as unknown as (ref: BaseTextInputRef | null) => void)(ref);
            }
        },
        // autoFocusCallbackRefRef is a stable ref — its identity never changes, so it's not a dep

        [autoFocus],
    );

    const getValidDateForCalendar = useMemo(() => {
        if (!selectedDate) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return defaultValue || format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
        }
        return selectedDate;
    }, [selectedDate, defaultValue]);

    return (
        <>
            <View
                ref={anchorRef}
                style={styles.mv2}
                onLayout={handleAnchorLayout}
            >
                <TextInput
                    ref={combinedTextInputRef}
                    inputID={inputID}
                    forceActiveLabel
                    icon={selectedDate || segmentInput.hasTypedDigits || shouldHideCalendarIcon ? null : icons.Calendar}
                    iconContainerStyle={styles.pr0}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.COMBOBOX}
                    accessibilityState={{expanded: isModalVisible}}
                    type={shouldAllowTyping ? 'dateSegments' : 'default'}
                    dateSegmentsConfig={
                        shouldAllowTyping
                            ? {
                                  mask: dateMask,
                                  getSegmentProps: segmentInput.getSegmentProps,
                                  focusRequest: segmentInput.focusRequest,
                                  onFieldBlur: segmentInput.onFieldBlur,
                              }
                            : undefined
                    }
                    value={segmentInput.displayValue}
                    placeholder={placeholder ?? dateMask}
                    errorText={errorText}
                    inputStyle={shouldAllowTyping ? undefined : styles.pointerEventsNone}
                    disabled={disabled}
                    hideFocusedState={shouldDismissKeyboardBeforeShow && !shouldAllowTyping}
                    onPress={shouldDismissKeyboardBeforeShow || shouldAllowTyping ? handlePress : () => showDatePickerModal()}
                    onSubmitEditing={shouldAllowTyping ? undefined : () => showDatePickerModal()}
                    onFocus={shouldAllowTyping ? handleFocus : undefined}
                    onKeyPress={shouldAllowTyping ? undefined : handleInputKeyPress}
                    textInputContainerStyles={isModalVisible ? styles.borderColorFocus : {}}
                    shouldHideClearButton={shouldHideClearButton}
                    onClearInput={handleClear}
                    forwardedFSClass={forwardedFSClass}
                    autoComplete={autoComplete}
                    disableKeyboard={!shouldAllowTyping}
                    rightHandSideComponent={rightHandSideComponent}
                />
            </View>

            <DatePickerModal
                inputID={inputID}
                minDate={minDate}
                maxDate={maxDate}
                value={getValidDateForCalendar}
                onSelected={handleDateSelected}
                isVisible={isModalVisible}
                onClose={closeDatePicker}
                anchorPosition={popoverPosition}
                shouldPositionFromTop={!isInverted}
                forwardedFSClass={forwardedFSClass}
                shouldCloseWhenBrowserNavigationChanged
                anchorRef={anchorRef}
                withoutOverlay={shouldAllowTyping}
                shouldAllowWithoutOverlayInNarrowPane={shouldAllowTyping}
                shouldCloseOnWheel={!shouldAllowTyping}
                viewDate={segmentInput.viewDate}
                viewDateVersion={segmentInput.viewDateVersion}
                onMonthOrYearSelected={commitDate}
            />
        </>
    );
}

export default DatePicker;
