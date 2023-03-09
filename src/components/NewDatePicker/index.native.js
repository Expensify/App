import React from 'react';
import {View, Keyboard} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './datePickerPropTypes';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import CalendarPicker from '../CalendarPicker';

const datepickerPropTypes = {
    ...propTypes,
    ...keyboardStatePropTypes,
};

const datePickerDefaultProps = {
    ...defaultProps,
};

class NewDatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
            selectedDate: moment(props.value || props.defaultValue).toDate(),
        };

        this.showPicker = this.showPicker.bind(this);
        this.reset = this.reset.bind(this);
        this.hidePicker = this.hidePicker.bind(this);
        this.setDate = this.setDate.bind(this);
    }

    /**
     * Trigger the `onInputChange` handler when the user input has a complete date or is cleared
     * @param {Date} selectedDate
     */
    setDate(selectedDate) {
        this.setState({selectedDate}, () => {
            this.props.onInputChange(moment(selectedDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
            this.hidePicker();
        });
    }

    /**
     * displays calendar picker on the screen
     */
    showPicker() {
        this.initialValue = this.state.selectedDate;

        // Opens the popover only after the keyboard is hidden to avoid a "blinking" effect where the keyboard was on iOS
        // See https://github.com/Expensify/App/issues/14084 for more context
        if (!this.props.isKeyboardShown) {
            this.setState({isPickerVisible: true});
            return;
        }
        const listener = Keyboard.addListener('keyboardDidHide', () => {
            this.setState({isPickerVisible: true});
            listener.remove();
        });
        Keyboard.dismiss();
    }

    /**
     * Hides the calendar picker from the screen.
     */
    hidePicker() {
        this.setState({isPickerVisible: false});
    }

    /**
     * Reset the date picker to the initial value.
     */
    reset() {
        this.setState({selectedDate: this.initialValue});
    }

    render() {
        const dateAsText = this.props.value || this.props.defaultValue ? moment(this.props.value || this.props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
        return (
            <View style={styles.flex2}>
                <TextInput
                    forceActiveLabel
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
                        if (el && el.focus && typeof el.focus === 'function') {
                            let inputRef = {...el};
                            inputRef = {...inputRef, focus: this.showPicker};
                            this.props.innerRef(inputRef);
                            return;
                        }

                        this.props.innerRef(el);
                    }}
                />
                {this.state.isPickerVisible && (
                <View style={[styles.datePickerPopover, styles.border]}>
                    <CalendarPicker
                        minDate={this.props.minDate}
                        maxDate={this.props.maxDate}
                        value={this.state.selectedDate}
                        onSelected={this.setDate}
                        defaultYear={this.props.defaultYear}
                    />
                </View>
                )}
            </View>
        );
    }
}

NewDatePicker.propTypes = datepickerPropTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

/**
 * We're applying localization here because we present a modal (with buttons) ourselves
 * Furthermore we're passing the locale down so that the modal and the date spinner are in the same
 * locale. Otherwise the spinner would be present in the system locale and it would be weird if it happens
 * that the modal buttons are in one locale (app) while the (spinner) month names are another (system)
 */
export default withKeyboardState(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <NewDatePicker {...props} innerRef={ref} />
)));
