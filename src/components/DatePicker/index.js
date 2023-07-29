import React, {useEffect, useRef} from 'react';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import * as Browser from '../../libs/Browser';
import {propTypes, defaultProps} from './datepickerPropTypes';
import './styles.css';

function DatePicker(props) {
    const inputRef = useRef(null);

    useEffect(() => {
        // Adds nice native datepicker on web/desktop. Not possible to set this through props
        inputRef.current.setAttribute('type', 'date');
        inputRef.current.setAttribute('max', moment(props.maxDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        inputRef.current.setAttribute('min', moment(props.minDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        inputRef.current.classList.add('expensify-datepicker');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    const setDate = (text) => {
        if (!text) {
            props.onInputChange('');
            return;
        }

        const asMoment = moment(text, true);
        if (asMoment.isValid()) {
            props.onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
    }

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
    }

    return (
        <TextInput
            forceActiveLabel
            ref={(el) => {
                inputRef.current = el;

                if (_.isFunction(props.innerRef)) {
                    props.innerRef(el);
                }
            }}
            onFocus={showDatepicker}
            label={props.label}
            accessibilityLabel={props.label}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            onInputChange={setDate}
            value={props.value}
            placeholder={props.placeholder}
            errorText={props.errorText}
            containerStyles={props.containerStyles}
            disabled={props.disabled}
            onBlur={props.onBlur}
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
