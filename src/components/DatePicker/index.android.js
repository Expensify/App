import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import styles from '../../styles/styles';

function DatePicker({value, defaultValue, label, placeholder, errorText, containerStyles, disabled, onBlur, onInputChange, maxDate, minDate}, outerRef) {
    const ref = useRef();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    /**
     * @param {Event} event
     * @param {Date} selectedDate
     */
    const setDate = (event, selectedDate) => {
        setIsPickerVisible(false);

        if (event.type === 'set') {
            const asMoment = moment(selectedDate, true);
            onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
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

    const dateAsText = value || defaultValue ? moment(value || defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';

    return (
        <>
            <TextInput
                label={label}
                accessibilityLabel={label}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                value={dateAsText}
                forceActiveLabel
                placeholder={placeholder}
                errorText={errorText}
                containerStyles={containerStyles}
                textInputContainerStyles={isPickerVisible ? [styles.borderColorFocus] : []}
                onPress={showPicker}
                editable={false}
                disabled={disabled}
                onBlur={onBlur}
                ref={ref}
            />
            {isPickerVisible && (
                <RNDatePicker
                    value={value || defaultValue ? moment(value || defaultValue).toDate() : new Date()}
                    mode="date"
                    onChange={setDate}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                />
            )}
        </>
    );
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;
DatePicker.displayName = 'DatePicker';

export default forwardRef(DatePicker);
