import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {setYear} from 'date-fns';
import PropTypes from 'prop-types';
import _ from 'lodash';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import * as Expensicons from '../Icon/Expensicons';
import {defaultProps as defaultBaseTextInputPropTypes, propTypes as baseTextInputPropTypes} from '../TextInput/baseTextInputPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import CalendarPicker from './CalendarPicker';
import InputWrapper from '../Form/InputWrapper';

const propTypes = {
    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value: PropTypes.string,

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue: PropTypes.string,

    inputID: PropTypes.string.isRequired,

    /** A minimum date of calendar to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date of calendar to select */
    maxDate: PropTypes.objectOf(Date),

    ...withLocalizePropTypes,
    ...baseTextInputPropTypes,
};

const datePickerDefaultProps = {
    ...defaultBaseTextInputPropTypes,
    minDate: setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    maxDate: setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    value: undefined,
};

function NewDatePicker({containerStyles, defaultValue, disabled, errorText, inputID, isSmallScreenWidth, label, maxDate, minDate, onInputChange, onTouched, placeholder, translate, value}) {
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);

    useEffect(() => {
        if (selectedDate === value || _.isUndefined(value)) {
            return;
        }
        setSelectedDate(value);
    }, [selectedDate, value]);

    useEffect(() => {
        if (_.isFunction(onTouched)) {
            onTouched();
        }
        if (_.isFunction(onInputChange)) {
            onInputChange(selectedDate);
        }
        // To keep behavior from class component state update callback, we want to run effect only when the selected date is changed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    return (
        <View style={styles.datePickerRoot}>
            <View style={[isSmallScreenWidth ? styles.flex2 : {}, styles.pointerEventsNone]}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={inputID}
                    forceActiveLabel
                    icon={Expensicons.Calendar}
                    label={label}
                    accessibilityLabel={label}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    value={value || selectedDate || ''}
                    placeholder={placeholder || translate('common.dateFormat')}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    textInputContainerStyles={[styles.borderColorFocus]}
                    inputStyle={[styles.pointerEventsNone]}
                    disabled={disabled}
                    editable={false}
                />
            </View>
            <View style={[styles.datePickerPopover, styles.border]}>
                <CalendarPicker
                    minDate={minDate}
                    maxDate={maxDate}
                    value={selectedDate}
                    onSelected={setSelectedDate}
                />
            </View>
        </View>
    );
}

NewDatePicker.propTypes = propTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

export default withLocalize(NewDatePicker);
