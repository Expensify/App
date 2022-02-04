import React from 'react';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';
        this.state = {
            isPickerVisible: false,
        };

        this.showPicker = this.showPicker.bind(this);
        this.raiseDateChange = this.raiseDateChange.bind(this);
    }

    /**
     * @param {Event} event
     */
    showPicker(event) {
        this.setState({isPickerVisible: true});
        event.preventDefault();
    }

    /**
     * @param {Event} event
     * @param {Date} selectedDate
     */
    raiseDateChange(event, selectedDate) {
        if (event.type === 'set') {
            this.props.onChange(selectedDate);
        }

        this.setState({isPickerVisible: false});
    }

    render() {
        const dateAsText = this.props.value ? moment(this.props.value).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';

        return (
            <>
                <TextInput
                    label={this.props.label}
                    value={dateAsText}
                    ref={input => this.inputRef = input}
                    placeholder={this.props.placeholder}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={this.props.disabled}
                    defaultValue={this.defaultValue}
                    onBlur={this.props.onBlur}
                />
                {this.state.isPickerVisible && (
                    <RNDatePicker
                        value={this.props.value ? moment(this.props.value).toDate() : new Date()}
                        mode="date"
                        onChange={this.raiseDateChange}
                        maximumDate={this.props.maximumDate}
                    />
                )}
            </>
        );
    }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default DatePicker;
