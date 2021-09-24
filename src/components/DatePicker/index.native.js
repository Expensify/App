import React from 'react';
import {Button, View} from 'react-native';
import PropTypes from 'prop-types';
import DatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Popover from '../Popover';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import colors from '../../styles/colors';

const propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    placeholder: PropTypes.string,
    errorText: PropTypes.string,
    translateX: PropTypes.number,
    containerStyles: PropTypes.arrayOf(PropTypes.object),
    ...withLocalizePropTypes,
};

const defaultProps = {
    value: undefined,
    placeholder: 'Select Date',
    errorText: '',
    translateX: undefined,
    containerStyles: [],
};

class DatepickerNative extends React.Component {
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
                <Popover
                    isVisible={this.state.isPickerVisible}
                    onClose={this.selectDate}
                >
                    <View style={[
                        styles.flexRow,
                        styles.justifyContentBetween,
                        styles.borderBottom,
                        styles.pb1,
                        styles.ph4,
                    ]}
                    >
                        <Button
                            title={this.props.translate('common.cancel')}
                            color={colors.red}
                            onPress={this.discard}
                        />
                        <Button
                            title={this.props.translate('common.save')}
                            color={colors.blue}
                            onPress={this.selectDate}
                        />
                    </View>
                    <DatePicker
                        value={this.state.selectedDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={this.updateLocalDate}
                    />
                </Popover>
            </>
        );
    }
}

DatepickerNative.propTypes = propTypes;
DatepickerNative.defaultProps = defaultProps;

export default withLocalize(DatepickerNative);
