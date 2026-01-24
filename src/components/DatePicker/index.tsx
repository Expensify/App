import {format, setYear} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import mergeRefs from '@libs/mergeRefs';
import {setDraftValues} from '@userActions/FormActions';
import CONST, {DATE_TIME_FORMAT_OPTIONS} from '@src/CONST';
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
    forwardedFSClass,
    ref,
}: DateInputWithPickerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Calendar']);
    const styles = useThemeStyles();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {preferredLocale} = useLocalize();
    const [isModalVisible, setIsModalVisible] = useState(false);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
    const textInputRef = useRef<BaseTextInputRef>(null);
    const anchorRef = useRef<View>(null);
    const [isInverted, setIsInverted] = useState(false);
    const isAutoFocused = useRef(false);

    const formattedValue = useMemo(() => {
        if (!selectedDate) {
            return '';
        }
        const date = new Date(selectedDate);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return Intl.DateTimeFormat(preferredLocale, DATE_TIME_FORMAT_OPTIONS[CONST.DATE.FNS_FORMAT_STRING]).format(date);
    }, [selectedDate, preferredLocale]);

    const computedPlaceholder = useMemo(() => {
        if (placeholder) {
            return placeholder;
        }
        return Intl.DateTimeFormat(preferredLocale, DATE_TIME_FORMAT_OPTIONS[CONST.DATE.FNS_FORMAT_STRING])
            .formatToParts()
            .map((part) => {
                switch (part.type) {
                    case 'day':
                        return 'DD';
                    case 'month':
                        return 'MM';
                    case 'year':
                        return 'YYYY';
                    default:
                        return part.value;
                }
            })
            .join('');
    }, [placeholder, preferredLocale]);

    useEffect(() => {
        if (shouldSaveDraft && formID) {
            setDraftValues(formID, {[inputID]: selectedDate});
        }
        if (selectedDate === value || !value) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    const calculatePopoverPosition = useCallback(() => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const wouldExceedBottom = y + CONST.POPOVER_DATE_MAX_HEIGHT + PADDING_MODAL_DATE_PICKER > windowHeight;
            setIsInverted(wouldExceedBottom);

            setPopoverPosition({
                horizontal: x + width,
                vertical: y + (wouldExceedBottom ? 0 : height + PADDING_MODAL_DATE_PICKER),
            });
        });
    }, [windowHeight]);

    const handlePress = useCallback(() => {
        calculatePopoverPosition();
        setIsModalVisible(true);
    }, [calculatePopoverPosition]);

    const closeDatePicker = useCallback(() => {
        textInputRef.current?.blur();
        setIsModalVisible(false);
    }, []);

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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            calculatePopoverPosition();
        });
    }, [calculatePopoverPosition, windowWidth]);

    useEffect(() => {
        if (!autoFocus || isAutoFocused.current) {
            return;
        }
        isAutoFocused.current = true;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            handlePress();
        });
    }, [handlePress, autoFocus]);

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
                    ref={mergeRefs(ref, textInputRef)}
                    inputID={inputID}
                    forceActiveLabel
                    icon={selectedDate ? null : icons.Calendar}
                    iconContainerStyle={styles.pr0}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={formattedValue}
                    placeholder={computedPlaceholder}
                    errorText={errorText}
                    inputStyle={styles.pointerEventsNone}
                    disabled={disabled}
                    readOnly
                    onPress={handlePress}
                    textInputContainerStyles={isModalVisible ? styles.borderColorFocus : {}}
                    shouldHideClearButton={shouldHideClearButton}
                    onClearInput={handleClear}
                    forwardedFSClass={forwardedFSClass}
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
            />
        </>
    );
}

export default DatePicker;
