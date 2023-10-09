import React from 'react';
import {Keyboard} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import _ from 'underscore';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import styles from '../../styles/styles';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPickerVisible: false,
        };

        this.showPicker = this.showPicker.bind(this);
        this.setDate = this.setDate.bind(this);
    }

    /**
     * @param {Event} event
     * @param {Date} selectedDate
     */
    setDate(event, selectedDate) {
        this.setState({isPickerVisible: false});

        if (event.type === 'set') {
            this.props.onInputChange(format(selectedDate, CONST.DATE.FNS_FORMAT_STRING));
        }
    }

    showPicker() {
        Keyboard.dismiss();
        this.setState({isPickerVisible: true});
    }

    render() {
        const date = this.props.value || this.props.defaultValue;
        const dateAsText = date ? format(new Date(date), CONST.DATE.FNS_FORMAT_STRING) : '';

        return (
            <>
                <TextInput
                    label={this.props.label}
                    accessibilityLabel={this.props.label}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    value={dateAsText}
                    forceActiveLabel
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
                    <RNDatePicker
                        value={date ? new Date(date) : new Date()}
                        mode="date"
                        onChange={this.setDate}
                        maximumDate={this.props.maxDate}
                        minimumDate={this.props.minDate}
                    />
                )}
            </>
        );
    }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    <DatePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
