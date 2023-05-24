import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import TextInput from '../TextInput';
import CalendarPicker from '../CalendarPicker';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import * as Expensicons from '../Icon/Expensicons';
import {propTypes as datePickerPropTypes, defaultProps as defaultDatePickerProps} from './datePickerPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
    ...datePickerPropTypes,
};

const datePickerDefaultProps = {
    ...defaultDatePickerProps,
};

class NewDatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedMonth: null,
            selectedDate: moment(props.value || props.defaultValue || undefined).toDate(),
        };

        this.setDate = this.setDate.bind(this);
        this.setCurrentSelectedMonth = this.setCurrentSelectedMonth.bind(this);

        // We're using uncontrolled input otherwise it wont be possible to
        // raise change events with a date value - each change will produce a date
        // and make us reset the text input
        this.defaultValue = props.defaultValue ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
    }

    /**
     * Updates selected month when year picker is opened.
     * This is used to keep the last visible month in the calendar when going back from year picker screen.
     * @param {Date} currentDateView
     */
    setCurrentSelectedMonth(currentDateView) {
        this.setState({selectedMonth: currentDateView.getMonth()});
    }

    /**
     * Trigger the `onInputChange` handler when the user input has a complete date or is cleared
     * @param {Date} selectedDate
     */
    setDate(selectedDate) {
        this.setState({selectedDate}, () => {
            this.props.onInputChange(moment(selectedDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        });
    }

    render() {
        return (
            <View style={styles.datePickerRoot}>
                <View style={[this.props.isSmallScreenWidth ? styles.flex2 : {}, styles.pointerEventsNone]}>
                    <TextInput
                        forceActiveLabel
                        icon={Expensicons.Calendar}
                        label={this.props.label}
                        value={this.props.value || ''}
                        defaultValue={this.defaultValue}
                        placeholder={this.props.placeholder || this.props.translate('common.dateFormat')}
                        errorText={this.props.errorText}
                        containerStyles={this.props.containerStyles}
                        textInputContainerStyles={[styles.borderColorFocus]}
                        inputStyle={[styles.pointerEventsNone]}
                        disabled={this.props.disabled}
                        editable={false}
                    />
                </View>
                <View style={[styles.datePickerPopover, styles.border]}>
                    <CalendarPicker
                        minDate={this.props.minDate}
                        maxDate={this.props.maxDate}
                        value={this.state.selectedDate}
                        onSelected={this.setDate}
                        selectedMonth={this.state.selectedMonth}
                        selectedYear={this.props.selectedYear}
                        onYearPickerOpen={this.setCurrentSelectedMonth}
                    />
                </View>
            </View>
        );
    }
}

NewDatePicker.propTypes = propTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

export default withLocalize(NewDatePicker);
