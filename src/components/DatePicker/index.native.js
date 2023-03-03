import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {View, Keyboard, StatusBar} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import compose from '../../libs/compose';
import TextInput from '../TextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Popover from '../Popover';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';
import CalendarPicker from '../CalendarPicker';

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
            pickerLayout: {},
            spaceFromTop: null,
        };

        this.showPicker = this.showPicker.bind(this);
        this.reset = this.reset.bind(this);
        this.hidePicker = this.hidePicker.bind(this);
        this.updateLocalDate = this.updateLocalDate.bind(this);

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
        const asMoment = moment(this.state.selectedDate, true);
        if (asMoment.isValid()) {
            this.props.onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }

        this.hidePicker();
    }

    render() {
        const dateAsText = this.props.value || this.props.defaultValue ? moment(this.props.value || this.props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
        return (
            <View
                ref={(ref) => {
                    if (!ref || this.state.spaceFromTop) { return; }

                    ref.measureInWindow((x, y) => {
                        this.setState({spaceFromTop: y});
                    });
                }}

                onLayout={({nativeEvent}) => this.setState({pickerLayout: nativeEvent.layout})}
            >
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
                <Popover
                    isVisible={this.state.isPickerVisible}
                    onClose={this.hidePicker}
                    fromSidebarMediumScreen
                    anchorPosition={{
                        // The position of the popover needs to be calculated. 10px space is added to move it a little bit from the TextInput
                        top: this.state.pickerLayout.height + this.state.spaceFromTop + StatusBar.currentHeight + 10,
                        left: 20,
                    }}
                >
                    <View style={{width: this.state.pickerLayout.width}}>
                        <CalendarPicker
                            minDate={this.minDate}
                            maxDate={this.maxDate}
                            value={this.state.selectedDate}
                            onChange={this.updateLocalDate}
                            onMonthPressed={this.hidePicker}
                            onYearPressed={this.hidePicker}
                        />
                    </View>
                </Popover>
            </View>
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
