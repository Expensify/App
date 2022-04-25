import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Button, View} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
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
            selectedDate: props.defaultValue ? moment(props.defaultValue).toDate() : new Date(),
        };

        this.showPicker = this.showPicker.bind(this);
        this.reset = this.reset.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.updateLocalDate = this.updateLocalDate.bind(this);
    }

    /**
     * @param {Event} event
     */
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
     * to the parent component (props.onInputChange)
     */
    selectDate() {
        this.setState({isPickerVisible: false});
        this.props.onInputChange(this.state.selectedDate);
    }

    /**
     * @param {Event} event
     * @param {Date} selectedDate
     */
    updateLocalDate(event, selectedDate) {
        this.props.onInputChange(selectedDate);
        this.setState({selectedDate});
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
                    onBlur={this.props.onBlur}
                    ref={(input) => {
                        if (!this.props.innerRef) {
                            return;
                        }

                        if (_.isFunction(this.props.innerRef)) {
                            this.props.innerRef(input);
                        }
                    }}
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
                            title={this.props.translate('common.done')}
                            color={themeColors.link}
                            onPress={this.selectDate}
                        />
                    </View>
                    <RNDatePicker
                        value={this.state.selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={this.updateLocalDate}
                        locale={this.props.preferredLocale}
                        maximumDate={this.props.maximumDate}
                    />
                </Popover>
            </>
        );
    }
}

Datepicker.propTypes = datepickerPropTypes;
Datepicker.defaultProps = defaultProps;

/**
 * We're applying localization here because we present a modal (with buttons) ourselves
 * Furthermore we're passing the locale down so that the modal and the date spinner are in the same
 * locale. Otherwise the spinner would be present in the system locale and it would be weird if it happens
 * that the modal buttons are in one locale (app) while the (spinner) month names are another (system)
 */
export default withLocalize(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Datepicker {...props} innerRef={ref} />
)));
