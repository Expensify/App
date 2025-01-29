import {setYear} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import DatePickerModal from './DatePickerModal';

type DaterInputWithPickerProps = {
    /** Currently selected date value */
    value?: string;

    /** Default date value */
    defaultValue?: string;

    /** Input identifier */
    inputID: string;

    /** Whether to save input value as a draft */
    shouldSaveDraft?: boolean;

    /** ID of the parent form */
    formID?: keyof OnyxFormValuesMapping;
} & BaseTextInputProps;

function DaterInputWithPicker({
    defaultValue,
    disabled,
    errorText,
    inputID,
    label,
    maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    onInputChange,
    onTouched,
    placeholder,
    value,
    shouldSaveDraft = false,
    formID,
}: DaterInputWithPickerProps) {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});

    const anchorRef = useRef<View>(null);
    const textInputRef = useRef(null);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    // const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        if (shouldSaveDraft && formID) {
            FormActions.setDraftValues(formID, {[inputID]: selectedDate});
        }

        if (selectedDate === value || !value) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    const handlePress = () => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            setPopoverPosition({
                horizontal: x + width,
                vertical: y + (y + 400 > windowHeight ? 0 : height),
            });
        });
        setIsModalVisible(true);
    };

    const handleDateSelected = (newDate: string) => {
        console.log('handleDateSelected', newDate);
        onTouched?.();
        onInputChange?.(newDate);
        setSelectedDate(newDate);
        setIsModalVisible(false);
    };
    console.log('popoverPosition_1', popoverPosition);

    return (
        <>
            <PressableWithoutFeedback
                ref={anchorRef}
                style={styles.datePickerRoot}
                onPress={handlePress}
                accessibilityLabel={translate('reportActionCompose.date')}
                role={CONST.ROLE.BUTTON}
            >
                <View style={styles.pointerEventsNone}>
                    <TextInput
                        ref={textInputRef}
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
                        textInputContainerStyles={[isModalVisible ? styles.borderColorFocus : {}]}
                    />
                </View>
            </PressableWithoutFeedback>

            <DatePickerModal
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDate}
                onSelected={handleDateSelected}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                anchorPosition={popoverPosition}
            />
        </>
    );
}

DaterInputWithPicker.displayName = 'DaterInputWithPicker';

export default DaterInputWithPicker;
