import React from 'react';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import DateUtils from '../../libs/DateUtils';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPickerVisible: false,
            selectedDate: props.value || props.defaultValue,
        };
        this.showPicker = this.showPicker.bind(this);
        this.raiseDateChange = this.raiseDateChange.bind(this);
    }

    componentDidUpdate() {
        const dateValue = DateUtils.getDateAsText(this.props.value);
        if (this.props.value === undefined || DateUtils.getDateAsText(this.state.value) === dateValue) {
            return;
        }
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({value: dateValue});
        this.textInput.setNativeProps({text: dateValue});
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
        this.setState({selectedDate});

        // Updates the value of TextInput on Date Change
        this.textInput.setNativeProps({text: DateUtils.getDateAsText(selectedDate)});
    }

    render() {
        return (
            <>
                <TextInput
                    label={this.props.label}
                    ref={(el) => {
                        this.textInput = el;
                        if (typeof this.props.forwardRef === 'function') { this.props.forwardedRef(el); }
                    }}
                    defaultValue={DateUtils.getDateAsText(this.state.selectedDate) || CONST.DATE.MOMENT_FORMAT_STRING}
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
                    value={this.state.selectedDate ? moment(this.state.selectedDate).toDate() : new Date()}
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
