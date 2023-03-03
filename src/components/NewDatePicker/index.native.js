import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {
    View, Keyboard,
} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import compose from '../../libs/compose';
import TextInput from '../TextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import CalendarPicker from '../CalendarPicker';
import withNavigation from '../withNavigation';

const datepickerPropTypes = {
    ...propTypes,
    ...withLocalizePropTypes,
    ...keyboardStatePropTypes,
};

class NewDatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
            selectedDate: props.value || props.defaultValue ? moment(props.value || props.defaultValue).toDate() : new Date(),
        };

        this.showPicker = this.showPicker.bind(this);
        this.reset = this.reset.bind(this);
        this.hidePicker = this.hidePicker.bind(this);
        this.updateLocalDate = this.updateLocalDate.bind(this);
        this.onClickedOutside = this.onC;

        this.wrapperRef = React.createRef();

        this.minDate = props.minDate ? moment(props.minDate).toDate() : null;
        this.maxDate = props.maxDate ? moment(props.maxDate).toDate() : null;
    }

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

    hidePicker() {
        this.setState({isPickerVisible: false});
    }

    /**
     * Reset the date spinner to the initial value
     */
    reset() {
        this.setState({selectedDate: this.initialValue});
    }

    /**
     * @param {Date} selectedDate
     */
    updateLocalDate(selectedDate) {
        this.setState({selectedDate});
        this.props.onInputChange(selectedDate);

        this.hidePicker();
    }

    render() {
        const dateAsText = this.props.value || this.props.defaultValue ? moment(this.props.value || this.props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
        return (
            <View ref={ref => this.wrapperRef = ref} style={[styles.flex2]}>
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
                        minDate={this.minDate}
                        maxDate={this.maxDate}
                        value={this.state.selectedDate}
                        onSelected={this.updateLocalDate}
                        onChanged={this.props.onDateChanged}
                        defaultMonth={this.props.defaultMonth}
                        defaultYear={this.props.defaultYear}
                        onClosePressed={this.hidePicker}
                    />
                </View>
                )}
            </View>
        );
    }
}

NewDatePicker.propTypes = datepickerPropTypes;
NewDatePicker.defaultProps = defaultProps;

/**
 * We're applying localization here because we present a modal (with buttons) ourselves
 * Furthermore we're passing the locale down so that the modal and the date spinner are in the same
 * locale. Otherwise the spinner would be present in the system locale and it would be weird if it happens
 * that the modal buttons are in one locale (app) while the (spinner) month names are another (system)
 */
export default compose(
    withLocalize,
    withNavigation,
    withKeyboardState,
)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <NewDatePicker {...props} innerRef={ref} />
)));
