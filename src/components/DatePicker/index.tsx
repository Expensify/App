import FormContext from '@components/Form/FormContext';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDateSegmentInput from '@hooks/useDateSegmentInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useRemeasureOnScroll from '@hooks/useRemeasureOnScroll';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import ComposerFocusManager from '@libs/ComposerFocusManager';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getDateRangeError, isNumeric} from '@libs/ValidationUtils';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {TextInput as TextInputRN, TextInputKeyPressEvent} from 'react-native';

import {setYear} from 'date-fns';
import debounce from 'lodash/debounce';
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
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
    minDate,
    maxDate,
    onInputChange,
    onTouched = () => {},
    placeholder,
    hint,
    value,
    shouldSaveDraft = false,
    formID,
    autoFocus = false,
    shouldHideClearButton = false,
    autoComplete = 'off',
    forwardedFSClass,
    shouldDeferShowUntilPositioned = false,
    shouldDismissKeyboardBeforeShow = false,
    wrapperStyle,
    rightHandSideComponent,
    onPickerVisibilityChange,
    shouldHideCalendarIcon = false,
    onValidationErrorChange,
    icon,
    shouldEnableMonthYearBackdropInNarrowPane = false,
    textInputContainerStyles,
}: DateInputWithPickerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Calendar']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // The clear button takes the calendar icon's place once a date is picked, so it gets the same horizontal padding as the icon's
    // container instead of its own margins. Otherwise the X sits in a different spot than the icon it replaces.
    const {paddingHorizontal: iconPaddingHorizontal} = StyleUtils.getTextInputIconContainerStyles(true);
    const {windowHeight, windowWidth} = useWindowDimensions();
    // The window's own width, and not the narrow layout, which a right hand pane reports even on a wide screen. Most
    // date fields sit in one, and there is room to type beside them there.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {setInputValidationError} = useContext(FormContext);

    const [isModalVisible, setIsModalVisible] = useState(false);
    // The field is drawn as focused by its own input, which is only one of the segments, so the other two report it here
    const [isFieldFocused, setIsFieldFocused] = useState(false);
    const announcementMessage = label ? `${label}, ${translate('common.calendarOpened')}` : translate('common.calendarOpened');
    useAccessibilityAnnouncement(announcementMessage, isModalVisible, {shouldAnnounceOnNative: true, shouldAnnounceOnWeb: true});
    const [selectedDate, setSelectedDate] = useState(() => value ?? defaultValue ?? '');
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
    const textInputRef = useRef<BaseTextInputRef | null>(null);
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const [isInverted, setIsInverted] = useState(false);
    // Whether the user currently intends the picker to be open. Lets a deferred measurement skip opening if the
    // picker was dismissed before it resolved.
    const openIntentRef = useRef(false);
    // Focus moving out of the segments while the calendar is open is the user reaching for the calendar rather than
    // leaving the field, so what a blur settles waits for the calendar to close.
    const isFieldFocusedRef = useRef(false);
    const hasPendingFieldBlurRef = useRef(false);

    // Touch devices keep the calendar on its own, so the soft keyboard does not cover it. A narrow window has no room
    // to show the calendar beside the field either, so it covers what is being typed.
    const shouldAllowTyping = !canUseTouchScreen() && !isSmallScreenWidth;
    const dateMask = translate('common.dateFormat');

    // The calendar falls back to these bounds when it is given none, so validation follows the range it offers
    const rangeMinDate = minDate ?? setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR);
    const rangeMaxDate = maxDate ?? setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR);

    // A date the calendar could never have offered is one nothing downstream expects, and typing is what makes those
    // reachable. Returns an empty string when the date is fine, which is how the form reads "no error".
    const getRangeError = (date: string) => (date ? getDateRangeError(translate, date, rangeMinDate, rangeMaxDate) : '');

    // Updates the field without ending the selection, so the calendar stays open for whatever the user does next
    const commitDate = (newDate: string) => {
        setSelectedDate(newDate);
        const rangeError = getRangeError(newDate);

        // The form validates from inside onInputChange, which runs before this render's effects, so the error has to
        // be recorded here as well for it to clear in the same keystroke that fixes the date.
        setInputValidationError(inputID, rangeError);

        // A date being typed reads as empty until it is finished. Marking the field touched then would show a
        // required error over a date the user is part way through.
        if (newDate) {
            onTouched?.();
        }

        // Only typing can reach a date the calendar would never have offered, and a consumer that saves on every
        // change would have stored it before anything could object. It stays on screen under its error to be corrected.
        if (rangeError) {
            return;
        }

        onInputChange?.(newDate);
    };

    const setPickerVisibility = useCallback(
        (isVisible: boolean) => {
            setIsModalVisible(isVisible);
            onPickerVisibilityChange?.(isVisible);
        },
        [onPickerVisibilityChange],
    );

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

    // The hook is the single gate on typing. When the platform does not allow it, the handlers it returns are no-ops
    // and the value passes straight through, so the call sites below do not have to check again.
    const segmentInput = useDateSegmentInput({
        value: selectedDate,
        isEnabled: shouldAllowTyping,
        minDate: rangeMinDate,
        maxDate: rangeMaxDate,
        onCommit: commitDate,
        // Tabbing away leaves a calendar nothing has been pressed outside of, which is what otherwise dismisses it
        onLeaveByKeyboard: () => {
            if (!isModalVisible) {
                return;
            }

            closeDatePicker();
        },
    });

    const {inputCallbackRef: autoFocusCallbackRef, cancelAutoFocus} = useAutoFocusInput();
    const autoFocusCallbackRefRef = useRef(autoFocusCallbackRef);
    autoFocusCallbackRefRef.current = autoFocusCallbackRef;

    // Whether focus is being placed by autofocus rather than by the user
    const isAutoFocusingRef = useRef(false);
    const segmentInputRef = useRef(segmentInput);
    useEffect(() => {
        segmentInputRef.current = segmentInput;
    });

    // The field's own ref leads to the year, since that is where typing starts in an empty field. A text field answers
    // autofocus with the caret where typing would carry on instead, which is what this stands in to do.
    const autoFocusTargetRef = useRef({
        focus: () => {
            isAutoFocusingRef.current = true;
            segmentInputRef.current.focusFirstUnfilledSegment();
            isAutoFocusingRef.current = false;
        },
        blur: () => textInputRef.current?.blur(),
    });

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
        // A date part way through being typed reports itself as empty, so the value prop trails a render behind the
        // field. Putting it back while the user is still entering a date would undo the digit they just entered.
        if (segmentInput.isEditing) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value, segmentInput.isEditing]);

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

    const showDatePickerModal = useCallback(() => {
        // Re-opening would remeasure and re-announce a calendar that is already showing. Both a press and a focus can
        // ask for it, and while typing both arrive for a single click.
        if (isModalVisible) {
            return;
        }

        // Autofocus is the screen arriving rather than the user asking for a calendar
        if (isAutoFocusingRef.current) {
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
        segmentInput.onDateSelected(newDate);
        closeDatePicker();
        // Defer until after the popover close is committed so consumers are not suppressed by modal state.
        requestAnimationFrame(() => onInputChange?.(newDate));
    };

    // Only the typing calendar stays open while the page scrolls. Every other one is dismissed instead, so it never
    // has to follow the field, and following it keeps an edit in progress from being interrupted.
    useRemeasureOnScroll({isActive: shouldAllowTyping && isModalVisible, remeasure: calculatePopoverPosition});

    // The error text renders inside the anchor, so showing or hiding it changes the height the calendar was positioned
    // from. Remeasuring on the anchor's own layout covers that without having to name each thing that can resize it.
    const repositionOnAnchorLayout = () => {
        if (!isModalVisible) {
            return;
        }

        calculatePopoverPosition();
    };

    // Digits that do not add up to a date read as no date at all, so a form with no rule about this field would accept
    // the entry in silence.
    const ownError = segmentInput.hasInvalidEntry ? translate('common.error.dateInvalid') : getRangeError(selectedDate);
    // Nullish coalescing would keep an empty errorText, which is a form reporting no error rather than an empty one
    const dateErrorText = errorText || ownError;

    // An entry part way through is never handed over, so the field still holds the date from before it. Saving that
    // would discard an edit the user is in the middle of, and the error is not shown because they are still making it.
    const blockingError = segmentInput.hasIncompleteEntry ? translate('common.error.dateInvalid') : ownError;

    useEffect(() => {
        setInputValidationError(inputID, blockingError);
        onValidationErrorChange?.(blockingError);

        // A field that is gone has nothing left to report, so its error must not outlive it and block the form
        return () => {
            setInputValidationError(inputID, '');
            onValidationErrorChange?.('');
        };
    }, [inputID, blockingError, setInputValidationError, onValidationErrorChange]);

    const leaveField = () => {
        isFieldFocusedRef.current = false;
        setIsFieldFocused(false);

        if (isModalVisible) {
            hasPendingFieldBlurRef.current = true;
            return;
        }

        segmentInput.onFieldBlur();
    };

    useEffect(() => {
        if (isModalVisible || !hasPendingFieldBlurRef.current || isFieldFocusedRef.current) {
            return;
        }

        hasPendingFieldBlurRef.current = false;
        segmentInput.onFieldBlur();
        // The handler is rebuilt on every render, and the refs above are what decide whether it has anything to do
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalVisible]);

    const commitPickedMonthOrYear = (newDate: string) => {
        // Picking a month or year revises a date the field already holds. An empty field has no day to go with one,
        // so it waits for the day press rather than being filled with a day nobody chose.
        if (!selectedDate) {
            return;
        }

        commitDate(newDate);

        // A month or year pick can land on the date the field already holds, and a segment the user has taken a digit
        // out of reports no date at all, so the committed value never changes and nothing else tells the segments.
        segmentInput.onDateSelected(newDate);
    };

    // The pickers are modals of their own, so they take focus with them, and their focus trap holds on to it until
    // they are gone. The calendar is still open at that point, which is the field still being used.
    const returnFocusFromMonthOrYearPicker = () => {
        if (!isModalVisible) {
            return;
        }

        segmentInput.restoreFocus();
    };

    const enterField = () => {
        isFieldFocusedRef.current = true;
        setIsFieldFocused(true);
        hasPendingFieldBlurRef.current = false;
        showDatePickerModal();
    };

    // Autofocus leaves the field focused without a calendar, so editing the date is what asks for one, as typing does
    // on a field that cannot be typed into
    const showCalendarOnEdit = (event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;

        if (!isNumeric(key) && key !== CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey && key !== CONST.KEYBOARD_SHORTCUTS.DELETE.shortcutKey) {
            return;
        }

        showDatePickerModal();
    };

    const handleClear = () => {
        onTouched?.();
        setInputValidationError(inputID, '');
        onValidationErrorChange?.('');
        onInputChange?.('');
        setSelectedDate('');
        segmentInput.onClear();
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
            if (!autoFocus) {
                return;
            }

            const autoFocusTarget = ref && shouldAllowTyping ? autoFocusTargetRef.current : ref;
            autoFocusCallbackRefRef.current(autoFocusTarget as ComponentRef<typeof TextInputRN> | null);
        },
        // autoFocusCallbackRefRef is a stable ref — its identity never changes, so it's not a dep

        [autoFocus, shouldAllowTyping],
    );

    return (
        <>
            <View
                ref={anchorRef}
                onLayout={repositionOnAnchorLayout}
                style={[styles.mv2, wrapperStyle]}
            >
                <TextInput
                    ref={combinedTextInputRef}
                    inputID={inputID}
                    forceActiveLabel
                    // The icon, the clear button and any `rightHandSideComponent` share the right-hand slot. The icon
                    // gives way when the caller asks for the slot outright, or to a clear button that will actually render.
                    // A date part way through being typed reads as no date at all, so typed digits count as a value here.
                    icon={shouldHideCalendarIcon || ((selectedDate || segmentInput.hasTypedDigits) && !shouldHideClearButton) ? null : (icon ?? icons.Calendar)}
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
                                  setSegmentRef: segmentInput.setSegmentRef,
                                  focusFirstUnfilledSegment: segmentInput.focusFirstUnfilledSegment,
                                  selectLastSegment: segmentInput.selectLastSegment,
                                  selectAllSegments: segmentInput.selectAllSegments,
                                  isSegmentElement: segmentInput.isSegmentElement,
                                  isAllSelected: segmentInput.isAllSelected,
                                  onFieldBlur: leaveField,
                                  hasTypedDigits: segmentInput.hasTypedDigits,
                              }
                            : undefined
                    }
                    value={selectedDate}
                    placeholder={placeholder ?? dateMask}
                    hint={hint}
                    errorText={dateErrorText}
                    inputStyle={shouldAllowTyping ? undefined : styles.pointerEventsNone}
                    disabled={disabled}
                    hideFocusedState={shouldDismissKeyboardBeforeShow && !shouldAllowTyping}
                    onPress={shouldDismissKeyboardBeforeShow || shouldAllowTyping ? handlePress : () => showDatePickerModal()}
                    onSubmitEditing={shouldAllowTyping ? undefined : () => showDatePickerModal()}
                    // Reaching the field by keyboard never fires a press, so focus is what opens the calendar
                    onFocus={shouldAllowTyping ? enterField : undefined}
                    onKeyPress={shouldAllowTyping ? showCalendarOnEdit : handleInputKeyPress}
                    textInputContainerStyles={[textInputContainerStyles, (isModalVisible || isFieldFocused) && styles.borderColorFocus]}
                    shouldHideClearButton={shouldHideClearButton}
                    onClearInput={handleClear}
                    clearButtonStyle={[styles.mh0, {paddingHorizontal: iconPaddingHorizontal}]}
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
                value={selectedDate}
                defaultValue={defaultValue}
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
                onMonthOrYearSelected={shouldAllowTyping ? commitPickedMonthOrYear : undefined}
                onMonthOrYearPickerClose={shouldAllowTyping ? returnFocusFromMonthOrYearPicker : undefined}
                shouldEnableMonthYearBackdropInNarrowPane={shouldEnableMonthYearBackdropInNarrowPane}
            />
        </>
    );
}

export default DatePicker;
