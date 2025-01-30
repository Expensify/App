import {setYear} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import DatePickerModal from './DatePickerModal';
import type {DateInputWithPickerProps} from './types';

const PADDING_MODAL_DATE_PICKER = 8;

function DateInputWithPicker({
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
}: DateInputWithPickerProps) {
    const styles = useThemeStyles();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [isModalVisible, setIsModalVisible] = useState(false);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
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

    const handlePress = () => {
        calculatePopoverPosition();
        setIsModalVisible(true);
    };

    const handleDateSelected = (newDate: string) => {
        onTouched?.();
        onInputChange?.(newDate);
        setSelectedDate(newDate);
        setIsModalVisible(false);
    };

    useEffect(() => {
        calculatePopoverPosition();
    }, [calculatePopoverPosition, windowWidth]);

    return (
        <>
            <PressableWithoutFeedback
                ref={anchorRef}
                style={styles.mv2}
                onPress={handlePress}
                accessibilityLabel={label}
                role={CONST.ROLE.BUTTON}
                accessible={false}
            >
                <View style={styles.pointerEventsNone}>
                    <TextInput
                        inputID={inputID}
                        forceActiveLabel
                        icon={Expensicons.Calendar}
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
                    />
                </View>
            </PressableWithoutFeedback>

            <DatePickerModal
                inputID={inputID}
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDate}
                onSelected={handleDateSelected}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                anchorPosition={popoverPosition}
                shouldPositionFromTop={!isInverted}
            />
        </>
    );
}

DateInputWithPicker.displayName = 'DateInputWithPicker';

export default DateInputWithPicker;
