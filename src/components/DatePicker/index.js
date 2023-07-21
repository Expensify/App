import moment from 'moment';
import React, {forwardRef, useEffect, useRef} from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import * as Browser from '../../libs/Browser';
import TextInput from '../TextInput';
import {defaultProps, propTypes} from './datepickerPropTypes';
import './styles.css';

const datePickerPropTypes = {
    ...propTypes,
};

function DatePicker({defaultValue, maxDate, minDate, onInputChange, innerRef, label, value, placeholder, errorText, containerStyles, disabled, onBlur}) {
    const inputRef = useRef(null);
    const defaultDateValue = defaultValue ? moment(defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';

    useEffect(() => {
        inputRef.current.setAttribute('type', 'date');
        inputRef.current.setAttribute('max', moment(maxDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        inputRef.current.setAttribute('min', moment(minDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        inputRef.current.classList.add('expensify-datepicker');
    }, [maxDate, minDate]);

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    const setDate = (text) => {
        if (!text) {
            onInputChange('');
            return;
        }

        const asMoment = moment(text, true);
        if (asMoment.isValid()) {
            onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
    };

    /**
     * Pops the datepicker up when we focus this field. This only works on mWeb chrome
     * On mWeb chrome the user needs to tap on the field again in order to bring the datepicker. But our current styles
     * don't make this very obvious. To avoid confusion we open the datepicker when the user focuses the field
     */
    const showDatepicker = () => {
        if (!inputRef.current || !Browser.isMobileChrome()) {
            return;
        }

        inputRef.current.click();
    };

    return (
        <TextInput
            forceActiveLabel
            ref={(el) => {
                inputRef.current = el;

                if (_.isFunction(innerRef)) {
                    innerRef(el);
                }
            }}
            onFocus={showDatepicker}
            label={label}
            accessibilityLabel={label}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            onInputChange={setDate}
            value={value}
            defaultValue={defaultDateValue}
            placeholder={placeholder}
            errorText={errorText}
            containerStyles={containerStyles}
            disabled={disabled}
            onBlur={onBlur}
        />
    );
}

DatePicker.propTypes = datePickerPropTypes;
DatePicker.defaultProps = defaultProps;
DatePicker.displayName = 'DatePicker';

export default forwardRef((props, ref) => (
    <DatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
