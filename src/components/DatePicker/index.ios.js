import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Button, View, Keyboard} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import _ from 'underscore';
import compose from '../../libs/compose';
import TextInput from '../TextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Popover from '../Popover';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';

const datepickerPropTypes = {
    ...propTypes,
    ...withLocalizePropTypes,
    ...keyboardStatePropTypes,
};

class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
            selectedDate: props.value || props.defaultValue ? moment(props.value || props.defaultValue).toDate() : new Date(),
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
        // Opens the popover only after the keyboard is hidden to avoid a "blinking" effect where the keyboard was on iOS
        // See https://github.com/Expensify/App/issues/14084 for more context
        if (this.props.isKeyboardShown) {
            const listener = Keyboard.addListener('keyboardDidHide', () => {
                this.setState({isPickerVisible: true});
                listener.remove();
            });
            Keyboard.dismiss();
        } else {
            this.setState({isPickerVisible: true});
        }
        this.initialValue = this.state.selectedDate;
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
        this.setState({selectedDate});
    }

    render() {
        const dateAsText = this.props.value || this.props.defaultValue ? moment(this.props.value || this.props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
        return (
            <>
                <TextInput
                    label={this.props.label}
                    value={dateAsText}
                    placeholder={this.props.placeholder}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    textInputContainerStyles={this.state.isPickerVisible ? [styles.borderColorFocus] : []}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={this.props.disabled}
                    onBlur={this.props.onBlur}
                    ref={(el) => {
                        if (!_.isFunction(this.props.innerRef)) {
                            return;
                        }
                        this.props.innerRef(el);
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
                        themeVariant="dark"
                        onChange={this.updateLocalDate}
                        locale={this.props.preferredLocale}
                    />
                </Popover>
            </>
        );
    }
}

DatePicker.propTypes = datepickerPropTypes;
DatePicker.defaultProps = defaultProps;

/**
 * We're applying localization here because we present a modal (with buttons) ourselves
 * Furthermore we're passing the locale down so that the modal and the date spinner are in the same
 * locale. Otherwise the spinner would be present in the system locale and it would be weird if it happens
 * that the modal buttons are in one locale (app) while the (spinner) month names are another (system)
 */
export default compose(
    withLocalize,
    withKeyboardState,
)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <DatePicker {...props} innerRef={ref} />
)));
