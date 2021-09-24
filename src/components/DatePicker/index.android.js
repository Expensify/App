import React from 'react';
import DatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';


class DatepickerAndroid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
        };

        this.showPicker = this.showPicker.bind(this);
        this.raiseDateChange = this.raiseDateChange.bind(this);
    }

    showPicker(event) {
        this.setState({isPickerVisible: true});
        event.preventDefault();
    }

    raiseDateChange(event, selectedDate) {
        this.setState({isPickerVisible: false});
        this.props.onChange(selectedDate);
    }

    render() {
        const {
            value,
            label,
            placeholder,
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
                    errorText={errorText}
                    containerStyles={containerStyles}
                    translateX={translateX}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={disabled}
                />
                {this.state.isPickerVisible && (
                    <DatePicker
                        value={moment(value || new Date()).toDate()}
                        mode="date"
                        onChange={this.raiseDateChange}
                    />
                )}
            </>
        );
    }
}

DatepickerAndroid.propTypes = propTypes;
DatepickerAndroid.defaultProps = defaultProps;

export default DatepickerAndroid;
