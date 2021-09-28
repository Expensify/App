import React from 'react';
import {Button, View} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Popover from '../Popover';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {propTypes, defaultProps} from './datepickerPropTypes';

const datepickerPropTypes = {
    ...propTypes,
    ...withLocalizePropTypes,
};

class Datepicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
            selectedDate: props.value ? moment(props.value).toDate() : new Date(),
        };

        this.showPicker = this.showPicker.bind(this);
        this.reset = this.reset.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.updateLocalDate = this.updateLocalDate.bind(this);
    }

    showPicker(event) {
        this.initialValue = this.state.selectedDate;
        this.setState({isPickerVisible: true});
        event.preventDefault();
    }

    /**
     * Reset the date spinner to the initial value
     */
    reset() {
        this.setState({selectedDate: this.initialValue});
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
                            title={this.props.translate('common.reset')}
                            color={themeColors.textError}
                            onPress={this.reset}
                        />
                        <Button
                            title={this.props.translate('common.confirm')}
                            color={themeColors.link}
                            onPress={this.selectDate}
                        />
                    </View>
                    <RNDatePicker
                        value={this.state.selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={this.updateLocalDate}
                    />
                </Popover>
            </>
        );
    }
}

Datepicker.propTypes = datepickerPropTypes;
Datepicker.defaultProps = defaultProps;

export default withLocalize(Datepicker);
