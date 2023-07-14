import React from 'react';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import * as Browser from '../../libs/Browser';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import './styles.css';

const datePickerPropTypes = {
    ...propTypes,
    ...windowDimensionsPropTypes,
};

class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.setDate = this.setDate.bind(this);
        this.showDatepicker = this.showDatepicker.bind(this);

        this.defaultValue = props.defaultValue ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
    }

    componentDidMount() {
        // Adds nice native datepicker on web/desktop. Not possible to set this through props
        this.inputRef.setAttribute('type', 'date');
        this.inputRef.setAttribute('max', moment(this.props.maxDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        this.inputRef.setAttribute('min', moment(this.props.minDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        this.inputRef.classList.add('expensify-datepicker');
    }

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    setDate(text) {
        if (!text) {
            this.props.onInputChange('');
            return;
        }

        const asMoment = moment(text, true);
        if (asMoment.isValid()) {
            this.props.onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
    }

    /**
     * Pops the datepicker up when we focus this field. This only works on mWeb chrome
     * On mWeb chrome the user needs to tap on the field again in order to bring the datepicker. But our current styles
     * don't make this very obvious. To avoid confusion we open the datepicker when the user focuses the field
     */
    showDatepicker() {
        if (!this.inputRef || !Browser.isMobileChrome()) {
            return;
        }

        this.inputRef.click();
    }

    render() {
        return (
            <TextInput
                forceActiveLabel
                ref={(el) => {
                    this.inputRef = el;

                    if (_.isFunction(this.props.innerRef)) {
                        this.props.innerRef(el);
                    }
                }}
                onFocus={this.showDatepicker}
                label={this.props.label}
                accessibilityLabel={this.props.label}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                onInputChange={this.setDate}
                value={this.props.value}
                defaultValue={this.defaultValue}
                placeholder={this.props.placeholder}
                errorText={this.props.errorText}
                containerStyles={this.props.containerStyles}
                disabled={this.props.disabled}
                onBlur={this.props.onBlur}
            />
        );
    }
}

DatePicker.propTypes = datePickerPropTypes;
DatePicker.defaultProps = defaultProps;

export default withWindowDimensions(
    React.forwardRef((props, ref) => (
        <DatePicker
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
);
