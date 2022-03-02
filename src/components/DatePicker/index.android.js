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

        this.showPicker = this.showPicker.bind(this);
        this.raiseDateChange = this.raiseDateChange.bind(this);
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
        if (event.type === 'set') {
            this.props.onChange(selectedDate);
        }

        this.setState({isPickerVisible: false});
    }

    render() {
        const currentDate = moment(this.props.value ? this.props.value : this.props.defaultValue);
        console.log(currentDate);
        console.log(currentDate.format(CONST.DATE.MOMENT_FORMAT_STRING));
        console.log(currentDate.toDate());
        return (
            <>
                <TextInput
                    label={this.props.label}
                    ref={this.props.forwardedRef}
                    placeholder={this.props.placeholder}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    onPress={this.showPicker}
                    editable={false}
                    disabled={this.props.disabled}
                    defaultValue={currentDate.format(CONST.DATE.MOMENT_FORMAT_STRING)}
                    onBlur={this.props.onBlur}
                    shouldSaveDraft={this.props.shouldSaveDraft}
                    isFormInput={this.props.isFormInput}
                    inputID={this.props.inputID}
                />
                {this.state.isPickerVisible && (
                    <RNDatePicker
                        value={currentDate.toDate()}
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
