import {setYear} from 'date-fns';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {forwardRef, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import refPropTypes from '@components/refPropTypes';
import TextInput from '@components/TextInput';
import {propTypes as baseTextInputPropTypes, defaultProps as defaultBaseTextInputPropTypes} from '@components/TextInput/BaseTextInput/baseTextInputPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import CalendarPicker from './CalendarPicker';

const propTypes = {
    /** React ref being forwarded to the DatePicker input */
    forwardedRef: refPropTypes,

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

    /** A function that is passed by FormWrapper */
    onInputChange: PropTypes.func.isRequired,

    /** A function that is passed by FormWrapper */
    onTouched: PropTypes.func.isRequired,

    ...baseTextInputPropTypes,
};

const datePickerDefaultProps = {
    ...defaultBaseTextInputPropTypes,
    minDate: setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    maxDate: setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    value: undefined,
};

function DatePicker({forwardedRef, containerStyles, defaultValue, disabled, errorText, inputID, isSmallScreenWidth, label, maxDate, minDate, onInputChange, onTouched, placeholder, value}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);

    const onSelected = (newValue) => {
        if (_.isFunction(onTouched)) {
            onTouched();
        }
        if (_.isFunction(onInputChange)) {
            onInputChange(newValue);
        }
        setSelectedDate(newValue);
    };

    return (
        <View style={styles.datePickerRoot}>
            <View style={[isSmallScreenWidth ? styles.flex2 : {}, styles.pointerEventsNone]}>
                <TextInput
                    ref={forwardedRef}
                    inputID={inputID}
                    forceActiveLabel
                    icon={Expensicons.Calendar}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={selectedDate}
                    placeholder={placeholder || translate('common.dateFormat')}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    textInputContainerStyles={[styles.borderColorFocus]}
                    inputStyle={[styles.pointerEventsNone]}
                    disabled={disabled}
                    readOnly
                />
            </View>
            <View style={[styles.datePickerPopover, styles.border]}>
                <CalendarPicker
                    minDate={minDate}
                    maxDate={maxDate}
                    value={selectedDate}
                    onSelected={onSelected}
                />
            </View>
        </View>
    );
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = datePickerDefaultProps;
DatePicker.displayName = 'DatePicker';

const DatePickerWithRef = forwardRef((props, ref) => (
    <DatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

DatePickerWithRef.displayName = 'DatePickerWithRef';

export default DatePickerWithRef;
