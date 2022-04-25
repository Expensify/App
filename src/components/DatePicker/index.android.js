import React from 'react';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
        };

        this.showPicker = this.showPicker.bind(this);
        this.setDate = this.setDate.bind(this);
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
    setDate(event, selectedDate) {
        if (event.type === 'set') {
            this.props.onInputChange(selectedDate);
        }

        this.setState({isPickerVisible: false});
    }

    render() {
        const dateAsText = this.props.defaultValue ? moment(this.props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';

        return (
            <>
                <TextInput
                    label={this.props.label}
                    defaultValue={dateAsText}
                    placeholder={this.props.placeholder}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={this.props.disabled}
                />
                {this.state.isPickerVisible && (
                    <RNDatePicker
                        value={this.props.defaultValue ? moment(this.props.defaultValue).toDate() : new Date()}
                        mode="date"
                        onChange={this.setDate}
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
