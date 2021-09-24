import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import CONST from '../../CONST';

const propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    placeholder: PropTypes.string,
    errorText: PropTypes.string,
    translateX: PropTypes.number,
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    value: undefined,
    placeholder: 'Select Date',
    errorText: '',
    translateX: undefined,
    containerStyles: [],
};

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
