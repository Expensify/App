import React from 'react';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
import CONST from '../../CONST';
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

        /* We're using uncontrolled input otherwise it wont be possible to
        * raise change events with a date value - each change will produce a date
        * and make us reset the text input */
        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';
    }

    componentDidMount() {
        // Adds nice native datepicker on web/desktop. Not possible to set this through props
        this.inputRef.setAttribute('type', 'date');
        this.inputRef.classList.add('expensify-datepicker');
        if (this.props.maximumDate) {
            this.inputRef.setAttribute('max', moment(this.props.maximumDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
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

        const asMoment = moment(text);
        if (asMoment.isValid()) {
            this.props.onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
    }

    /**
     * Pops the datepicker up when we focus this field. This only works on mWeb
     * On mWeb the user needs to tap on the field again in order to bring the datepicker. But our current styles
     * don't make this very obvious. To avoid confusion we open the datepicker when the user focuses the field
     */
    showDatepicker() {
        if (!this.inputRef) {
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

export default withWindowDimensions(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <DatePicker {...props} innerRef={ref} />
)));
