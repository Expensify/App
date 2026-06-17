import {format, setYear} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TextInputKeyPressEvent} from 'react-native';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isNumeric} from '@libs/ValidationUtils';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import DatePickerModal from './DatePickerModal';
import type {DateInputWithPickerProps} from './types';

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
    const prevWindowWidthRef = useRef(windowWidth);
    const prevWindowHeightRef = useRef(windowHeight);
    const anchorMeasureRef = useRef({y: 0, height: 0});
    const [isInverted, setIsInverted] = useState(false);
    // Whether the user currently intends the picker to be open. Lets a deferred measurement skip opening if the
    // picker was dismissed before it resolved.
    const openIntentRef = useRef(false);

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
                anchorMeasureRef.current = {y, height};

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
        cancelAutoFocus();
        // Blur the input before showing the modal, so the focus won't be returned after the modal is closed
        textInputRef.current?.blur();

        if (!shouldDeferShowUntilPositioned) {
            calculatePopoverPosition();
            setIsModalVisible(true);
            return;
        }

        openIntentRef.current = true;
        calculatePopoverPosition(() => {
            if (!openIntentRef.current) {
                return;
            }
            setIsModalVisible(true);
        });
    }, [shouldDeferShowUntilPositioned, calculatePopoverPosition, cancelAutoFocus]);

    const closeDatePicker = useCallback(() => {
        openIntentRef.current = false;
        setIsModalVisible(false);
    }, []);

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
        onInputChange?.(newDate);
        setSelectedDate(newDate);
        closeDatePicker();
    };

    const handleClear = () => {
        onTouched?.();
        onInputChange?.('');
        setSelectedDate('');
    };

    useEffect(() => {
        calculatePopoverPosition();
    }, []);

    useEffect(() => {
        const delta = windowWidth - prevWindowWidthRef.current;
        prevWindowWidthRef.current = windowWidth;

        if (delta === 0) {
            return;
        }

        setPopoverPosition((prev) => ({
            ...prev,
            horizontal: prev.horizontal + delta,
        }));
    }, [windowWidth]);

    useEffect(() => {
        const delta = windowHeight - prevWindowHeightRef.current;
        prevWindowHeightRef.current = windowHeight;

        if (delta === 0) {
            return;
        }

        const {y, height} = anchorMeasureRef.current;
        const wouldExceedBottom = y + CONST.POPOVER_DATE_MAX_HEIGHT + PADDING_MODAL_DATE_PICKER > windowHeight;
        setIsInverted(wouldExceedBottom);

        setPopoverPosition((prev) => ({
            ...prev,
            vertical: y + (wouldExceedBottom ? 0 : height + PADDING_MODAL_DATE_PICKER),
        }));
    }, [windowHeight]);

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
            >
                <TextInput
                    ref={combinedTextInputRef}
                    inputID={inputID}
                    forceActiveLabel
                    icon={selectedDate ? null : icons.Calendar}
                    iconContainerStyle={styles.pr0}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.COMBOBOX}
                    accessibilityState={{expanded: isModalVisible}}
                    value={selectedDate}
                    placeholder={placeholder ?? translate('common.dateFormat')}
                    errorText={errorText}
                    inputStyle={styles.pointerEventsNone}
                    disabled={disabled}
                    onPress={() => showDatePickerModal()}
                    onSubmitEditing={() => showDatePickerModal()}
                    onKeyPress={handleInputKeyPress}
                    textInputContainerStyles={isModalVisible ? styles.borderColorFocus : {}}
                    shouldHideClearButton={shouldHideClearButton}
                    onClearInput={handleClear}
                    forwardedFSClass={forwardedFSClass}
                    autoComplete={autoComplete}
                    disableKeyboard
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
            />
        </>
    );
}

export default DatePicker;
