import React from 'react';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import './styles.css';

const datePickerPropTypes = {
    ...propTypes,
    ...windowDimensionsPropTypes,
};

class Datepicker extends React.Component {
    constructor(props) {
        super(props);

        this.raiseDateChange = this.raiseDateChange.bind(this);
        this.showDatepicker = this.showDatepicker.bind(this);

        /* We're using uncontrolled input otherwise it wont be possible to
        * raise change events with a date value - each change will produce a date
        * and make us reset the text input */
        this.defaultValue = props.value
            ? moment(props.value).format(CONST.DATE.MOMENT_FORMAT_STRING)
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
    raiseDateChange(text) {
        if (!text) {
            this.props.onChange(null);
            return;
        }

        const asMoment = moment(text);
        if (asMoment.isValid()) {
            const asDate = asMoment.toDate();
            this.props.onChange(asDate);
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
                forceActiveLabel={!this.props.isSmallScreenWidth}
                ref={input => this.inputRef = input}
                onFocus={this.showDatepicker}
                label={this.props.label}
                onChangeText={this.raiseDateChange}
                defaultValue={this.defaultValue}
                placeholder={this.props.placeholder}
                hasError={this.props.hasError}
                errorText={this.props.errorText}
                containerStyles={this.props.containerStyles}
                disabled={this.props.disabled}
            />
        );
    }
}

Datepicker.propTypes = datePickerPropTypes;
Datepicker.defaultProps = defaultProps;

export default withWindowDimensions(Datepicker);
