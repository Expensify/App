import React, {useEffect, useRef} from 'react';
import {format, isValid} from 'date-fns';
import _ from 'underscore';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import * as Browser from '../../libs/Browser';
import {propTypes, defaultProps} from './datepickerPropTypes';
import './styles.css';

function DatePicker({maxDate, minDate, onInputChange, innerRef, label, value, placeholder, errorText, containerStyles, disabled, onBlur}) {
    const inputRef = useRef(null);

    useEffect(() => {
        // Adds nice native datepicker on web/desktop. Not possible to set this through props
        inputRef.current.setAttribute('type', 'date');
        inputRef.current.setAttribute('max', format(new Date(maxDate), CONST.DATE.FNS_FORMAT_STRING));
        inputRef.current.setAttribute('min', format(new Date(minDate), CONST.DATE.FNS_FORMAT_STRING));
        inputRef.current.classList.add('expensify-datepicker');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    const setDate = (text) => {
        if (!text) {
            onInputChange('');
            return;
        }

        const date = new Date(text);
        if (isValid(date)) {
            onInputChange(format(date, CONST.DATE.FNS_FORMAT_STRING));
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
            placeholder={placeholder}
            errorText={errorText}
            containerStyles={containerStyles}
            disabled={disabled}
            onBlur={onBlur}
        />
    );
}

DatePicker.displayName = 'DatePicker';
DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    <DatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
