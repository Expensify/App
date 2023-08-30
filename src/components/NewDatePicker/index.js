import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import * as Expensicons from '../Icon/Expensicons';
import {propTypes as baseTextInputPropTypes, defaultProps as defaultBaseTextInputPropTypes} from '../TextInput/baseTextInputPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import CalendarPicker from './CalendarPicker';

const propTypes = {
    /**
     * The datepicker supports any value that `moment` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value: PropTypes.string,

    /**
     * The datepicker supports any defaultValue that `moment` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue: PropTypes.string,

    /** A minimum date of calendar to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date of calendar to select */
    maxDate: PropTypes.objectOf(Date),

    ...withLocalizePropTypes,
    ...baseTextInputPropTypes,
};

const datePickerDefaultProps = {
    ...defaultBaseTextInputPropTypes,
    minDate: moment().year(CONST.CALENDAR_PICKER.MIN_YEAR).toDate(),
    maxDate: moment().year(CONST.CALENDAR_PICKER.MAX_YEAR).toDate(),
    value: undefined,
};

class NewDatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedDate: props.value || props.defaultValue || undefined,
        };

        this.setDate = this.setDate.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value === this.props.value) {
            return;
        }
        this.setDate(this.props.value);
    }

    /**
     * Trigger the `onInputChange` handler when the user input has a complete date or is cleared
     * @param {string} selectedDate
     */
    setDate(selectedDate) {
        this.setState({selectedDate}, () => {
            this.props.onTouched();
            this.props.onInputChange(selectedDate);
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
                        accessibilityLabel={this.props.label}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={this.props.value || ''}
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
                    />
                </View>
            </View>
        );
    }
}

NewDatePicker.propTypes = propTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

export default withLocalize(NewDatePicker);
