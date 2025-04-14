import {format, setYear} from 'date-fns';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
}: DateInputWithPickerProps) {
    const styles = useThemeStyles();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [isModalVisible, setIsModalVisible] = useState(false);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
    const textInputRef = useRef<HTMLFormElement | null>(null);
    const anchorRef = useRef<View>(null);
    const [isInverted, setIsInverted] = useState(false);

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
        calculatePopoverPosition();
    }, [calculatePopoverPosition, windowWidth]);

    useEffect(() => {
        if (!autoFocus) {
            return;
        }
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
                    ref={textInputRef}
                    inputID={inputID}
                    forceActiveLabel
                    icon={selectedDate ? null : Expensicons.Calendar}
                    iconContainerStyle={styles.pr0}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={selectedDate}
                    placeholder={placeholder ?? translate('common.dateFormat')}
                    errorText={errorText}
                    inputStyle={styles.pointerEventsNone}
                    disabled={disabled}
                    readOnly
                    onPress={handlePress}
                    textInputContainerStyles={isModalVisible ? styles.borderColorFocus : {}}
                    shouldHideClearButton={shouldHideClearButton}
                    onClearInput={handleClear}
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
            />
        </>
    );
}

DatePicker.displayName = 'DatePicker';

export default forwardRef(DatePicker);
