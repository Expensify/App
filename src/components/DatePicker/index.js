import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
import Popover from '../Popover';
import CalendarPicker from '../CalendarPicker';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import './styles.css';

const datePickerPropTypes = {
    ...propTypes,
    ...windowDimensionsPropTypes,
};

class DatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedDate: null,
            isPickerVisible: false,
            pickerLayout: {},
        };

        this.setDate = this.setDate.bind(this);
        this.togglePicker = this.togglePicker.bind(this);

        /* We're using uncontrolled input otherwise it wont be possible to
        * raise change events with a date value - each change will produce a date
        * and make us reset the text input */
        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';
    }

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    setDate(text) {
        if (!text) {
            this.props.onInputChange('');
            return;
        }

        this.setState({selectedDate: text});
        const asMoment = moment(text, true);
        if (asMoment.isValid()) {
            this.props.onInputChange(asMoment.format(CONST.DATE.MOMENT_FORMAT_STRING));
        }

        this.togglePicker();
    }

    togglePicker() {
        this.setState(prevState => ({...prevState, isPickerVisible: !prevState.isPickerVisible}));
    }

    render() {
        return (
            <View onLayout={({nativeEvent}) => this.setState({pickerLayout: nativeEvent.layout})}>
                <TextInput
                    forceActiveLabel
                    ref={(el) => {
                        this.inputRef = el;

                        if (_.isFunction(this.props.innerRef)) {
                            this.props.innerRef(el);
                        }
                    }}
                    onPress={this.togglePicker}
                    label={this.props.label}
                    onInputChange={this.setDate}
                    value={this.props.value}
                    defaultValue={this.defaultValue}
                    placeholder={this.props.placeholder || CONST.DATE.MOMENT_FORMAT_STRING}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    disabled={this.props.disabled}
                    onBlur={this.props.onBlur}
                    readOnly
                />
                <Popover
                    isVisible={this.state.isPickerVisible}
                    onClose={this.togglePicker}
                    fullscreen
                    isSmallScreenWidth={false}
                    anchorPosition={{
                        top: this.state.pickerLayout.height + this.state.pickerLayout.top + 10,
                        left: this.state.pickerLayout.left,
                    }}
                >
                    <View style={{width: this.state.pickerLayout.width}}>
                        <CalendarPicker value={this.state.selectedDate} onChange={this.setDate} />
                    </View>
                </Popover>
            </View>
        );
    }
}

DatePicker.propTypes = datePickerPropTypes;
DatePicker.defaultProps = defaultProps;

export default withWindowDimensions(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <DatePicker {...props} innerRef={ref} />
)));
