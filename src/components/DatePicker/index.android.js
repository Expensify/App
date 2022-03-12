import React from 'react';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPickerVisible: false,
        };
        this.defaultValue = this.props.defaultValue ? moment(this.props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING) : CONST.DATE.MOMENT_FORMAT_STRING;
        this.showPicker = this.showPicker.bind(this);
        this.raiseDateChange = this.raiseDateChange.bind(this);
    }

    componentDidUpdate() {
        if (this.props.value === undefined || this.value === this.props.value) {
            return;
        }
        this.textInput.setNativeProps({text: this.value});
    }

    /**
     * @param {Event} event
     */
    showPicker(event) {
        this.setState({isPickerVisible: true});
        event.preventDefault();
    }

    /**
     * @param {Event} event
     * @param {Date} selectedDate
     */
    raiseDateChange(event, selectedDate) {
        this.setState({isPickerVisible: false});
        if (event.type === 'set') {
            this.props.onChange(selectedDate);
        }

        // Updates the value of TextInput on Date Change
        this.textInput.setNativeProps({text: moment(selectedDate).format(CONST.DATE.MOMENT_FORMAT_STRING)});
    }

    render() {
        return (
            <>
                <TextInput
                    label={this.props.label}
                    ref={(el) => {
                        this.textInput = el;
                        if (this.props.forwardedRef) { this.props.forwardedRef(el); }
                    }}
                    defaultValue={this.defaultValue}
                    placeholder={this.props.placeholder}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={this.props.disabled}
                    onBlur={this.props.onBlur}
                    shouldSaveDraft={this.props.shouldSaveDraft}
                    isFormInput={this.props.isFormInput}
                    inputID={this.props.inputID}
                />
                {this.state.isPickerVisible && (
                <RNDatePicker
                    value={this.props.defaultValue ? moment(this.props.defaultValue).toDate() : new Date()}
                    mode="date"
                    onChange={this.raiseDateChange}
                    maximumDate={this.props.maximumDate}
                />
                )}
            </>
        );
    }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default (React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <DatePicker {...props} forwardedRef={ref} />
)));
