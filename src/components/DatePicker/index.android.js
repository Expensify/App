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
            selectedDate: props.value ? moment(props.value).toDate() : null,
        };

        this.showPicker = this.showPicker.bind(this);
        this.discard = this.discard.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.updateLocalDate = this.updateLocalDate.bind(this);
    }

    showPicker() {
        this.previousValue = this.state.selectedDate;
        this.setState({isPickerVisible: true});
        this.input.blur();
    }

    /**
     * Discard the current date spinner changes and close the picker
     */
    discard() {
        this.setState({isPickerVisible: false, selectedDate: this.previousValue});
    }

    /**
     * Accept the current spinner changes, close the spinner and propagate the change
     * to the parent component (props.onChange)
     */
    selectDate() {
        this.setState({isPickerVisible: false});
        this.props.onChange(this.state.selectedDate);
    }

    updateLocalDate(event, selectedDate) {
        this.setState({selectedDate});
    }

    render() {
        const {
            label,
            placeholder,
            errorText,
            translateX,
            containerStyles,
        } = this.props;

        const dateAsText = this.state.selectedDate
            ? moment(this.state.selectedDate).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';

        return (
            <>
                <ExpensiTextInput
                    ref={input => this.input = input}
                    label={label}
                    value={dateAsText}
                    placeholder={placeholder}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    translateX={translateX}
                    onFocus={this.showPicker}
                />
                {this.state.isPickerVisible && (
                    <DatePicker
                        value={this.state.selectedDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={this.updateLocalDate}
                    />
                )}
            </>
        );
    }
}

DatepickerAndroid.propTypes = propTypes;
DatepickerAndroid.defaultProps = defaultProps;

export default DatepickerAndroid;
