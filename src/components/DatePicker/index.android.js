import React from 'react';
import {Keyboard} from 'react-native';
import RNDatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
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
        if (event.type === 'set') {
            const asMoment = moment(selectedDate, true);
            this.props.onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }

        this.setState({isPickerVisible: false});
    }

    /**
     * @param {Event} event
     */
    showPicker(event) {
        Keyboard.dismiss();
        this.setState({isPickerVisible: true});
        event.preventDefault();
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
                {this.state.isPickerVisible && (
                    <RNDatePicker
                        value={this.props.value || this.props.defaultValue ? moment(this.props.value || this.props.defaultValue).toDate() : new Date()}
                        mode="date"
                        onChange={this.setDate}
                    />
                )}
            </>
        );
    }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <DatePicker {...props} innerRef={ref} />
));
