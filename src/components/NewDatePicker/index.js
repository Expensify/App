import React from 'react';
import {View, Animated} from 'react-native';
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
            isPickerVisible: false,
            selectedMonth: null,
            selectedDate: moment(props.value || props.defaultValue || undefined).toDate(),
        };

        this.setDate = this.setDate.bind(this);
        this.showPicker = this.showPicker.bind(this);
        this.setCurrentSelectedMonth = this.setCurrentSelectedMonth.bind(this);

        this.opacity = new Animated.Value(0);

        // We're using uncontrolled input otherwise it wont be possible to
        // raise change events with a date value - each change will produce a date
        // and make us reset the text input
        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';
    }

    componentDidMount() {
        if (!this.props.autoFocus) {
            return;
        }
        this.showPicker();
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

    /**
     * Function to animate showing the picker.
     */
    showPicker() {
        this.setState({isPickerVisible: true}, () => {
            Animated.timing(this.opacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        });
    }

    render() {
        return (
            <View style={styles.datePickerRoot}>
                <View style={[this.props.isSmallScreenWidth ? styles.flex2 : {}]}>
                    <TextInput
                        forceActiveLabel
                        icon={Expensicons.Calendar}
                        onPress={this.showPicker}
                        label={this.props.label}
                        value={this.props.value || ''}
                        defaultValue={this.defaultValue}
                        placeholder={this.props.placeholder || this.props.translate('common.dateFormat')}
                        errorText={this.props.errorText}
                        containerStyles={this.props.containerStyles}
                        textInputContainerStyles={this.state.isPickerVisible ? [styles.borderColorFocus] : []}
                        disabled={this.props.disabled}
                        editable={false}
                    />
                </View>
                {
                    this.state.isPickerVisible && (
                    <Animated.View
                        style={[styles.datePickerPopover, styles.border, {opacity: this.opacity}]}
                    >
                        <CalendarPicker
                            minDate={this.props.minDate}
                            maxDate={this.props.maxDate}
                            value={this.state.selectedDate}
                            onSelected={this.setDate}
                            selectedMonth={this.state.selectedMonth}
                            selectedYear={this.props.selectedYear}
                            onYearPickerOpen={this.setCurrentSelectedMonth}
                        />
                    </Animated.View>
                    )
                }
            </View>
        );
    }
}

NewDatePicker.propTypes = propTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

export default withLocalize(NewDatePicker);
