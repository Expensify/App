import RNDatePicker from '@react-native-community/datetimepicker';
import {format, parseISO} from 'date-fns';
import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import TextInput from '@components/TextInput';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './datepickerPropTypes';

const DatePicker = forwardRef(({value, defaultValue, label, placeholder, errorText, containerStyles, disabled, onBlur, onInputChange, maxDate, minDate}, outerRef) => {
    const styles = useThemeStyles();
    const ref = useRef();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    /**
     * @param {Event} event
     * @param {Date} selectedDate
     */
    const setDate = (event, selectedDate) => {
        setIsPickerVisible(false);

        if (event.type === 'set') {
            onInputChange(format(selectedDate, CONST.DATE.FNS_FORMAT_STRING));
        }
    };

    const showPicker = useCallback(() => {
        Keyboard.dismiss();
        setIsPickerVisible(true);
    }, []);

    useImperativeHandle(
        outerRef,
        () => ({
            ...ref.current,
            focus: showPicker,
        }),
        [showPicker],
    );

    const date = value || defaultValue;
    const dateAsText = date ? format(parseISO(date), CONST.DATE.FNS_FORMAT_STRING) : '';

    return (
        <>
            <TextInput
                label={label}
                accessibilityLabel={label}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                value={dateAsText}
                forceActiveLabel
                placeholder={placeholder}
                errorText={errorText}
                containerStyles={containerStyles}
                textInputContainerStyles={isPickerVisible ? [styles.borderColorFocus] : []}
                onPress={showPicker}
                readOnly
                disabled={disabled}
                onBlur={onBlur}
                ref={ref}
            />
            {isPickerVisible && (
                <RNDatePicker
                    value={date ? parseISO(date) : new Date()}
                    mode="date"
                    onChange={setDate}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                />
            )}
        </>
    );
});

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;
DatePicker.displayName = 'DatePicker';

export default DatePicker;
