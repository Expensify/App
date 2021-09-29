import React from 'react';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);

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
        const {
            value,
            label,
            placeholder,
            hasError,
            errorText,
            translateX,
            containerStyles,
            disabled,
        } = this.props;

        const dateAsText = value ? moment(value).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';

        return (
            <>
                <ExpensiTextInput
                    label={label}
                    value={dateAsText}
                    placeholder={placeholder}
                    hasError={hasError}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    translateX={translateX}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={disabled}
                />
                {this.state.isPickerVisible && (
                    <RNDatePicker
                        value={value ? moment(value).toDate() : new Date()}
                        mode="date"
                        onChange={this.raiseDateChange}
                    />
                )}
            </>
        );
    }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default DatePicker;
