import React from 'react';
import {Animated, View} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';
import CalendarPicker from '../CalendarPicker';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import {propTypes as datePickerPropTypes, defaultProps as defaultDatePickerProps} from './datePickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import './styles.css';

const propTypes = {
    ...datePickerPropTypes,
    ...windowDimensionsPropTypes,
};

const datePickerDefaultProps = {
    ...defaultDatePickerProps,
};

class NewDatePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedDate: new Date(),
            isPickerVisible: false,
        };

        this.setDate = this.setDate.bind(this);
        this.togglePicker = this.togglePicker.bind(this);
        this.removeClickListener = this.removeClickListener.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);

        this.wrapperRef = React.createRef();
        this.opacity = new Animated.Value(0);

        /* We're using uncontrolled input otherwise it wont be possible to
        * raise change events with a date value - each change will produce a date
        * and make us reset the text input */
        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleOutsideClick);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.defaultYear === this.props.defaultYear) {
            return;
        }
        document.addEventListener('mousedown', this.handleOutsideClick);
    }

    componentWillUnmount() {
        this.removeClickListener();
    }

    /**
     * Trigger the `onInputChange` handler when the user input has a complete date or is cleared
     * @param {Date} selectedDate
     */
    setDate(selectedDate) {
        this.setState(() => {
            this.props.onInputChange(moment(selectedDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
            return {selectedDate};
        });
        this.togglePicker();
    }

    removeClickListener() {
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    /**
     * Function called when clicked outside of the DatePicker component on the page
     * @param {Object} event
     */
    // eslint-disable-next-line rulesdir/prefer-early-return
    handleOutsideClick(event) {
        if (this.wrapperRef && this.wrapperRef.current && !this.wrapperRef.current.contains(event.target) && this.wrapperRef.current !== event.target && this.state.isPickerVisible) {
            this.togglePicker();
        }
    }

    /**
     * Function to animate the value of opacity to display the picker component
     */
    togglePicker() {
        Animated.timing(this.opacity, {
            toValue: this.state.isPickerVisible ? 0 : 1,
            duration: 100,
            useNativeDriver: true,
        }).start((animationResult) => {
            if (!animationResult.finished) {
                return;
            }
            this.setState(prev => ({isPickerVisible: !prev.isPickerVisible}));
        });
    }

    render() {
        return (
            <View ref={this.wrapperRef} style={[this.props.isSmallScreenWidth ? styles.flex2 : {}]}>
                <TextInput
                    forceActiveLabel
                    ref={(el) => {
                        if (!_.isFunction(this.props.innerRef)) {
                            return;
                        }
                        this.props.innerRef(el);
                    }}
                    onPress={this.togglePicker}
                    label={this.props.label}
                    value={this.props.value}
                    defaultValue={this.defaultValue}
                    placeholder={this.props.placeholder || CONST.DATE.MOMENT_FORMAT_STRING}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    disabled={this.props.disabled}
                    onBlur={this.props.onBlur}
                    editable={false}
                />
                <Animated.View style={[styles.datePickerPopover, styles.border, {opacity: this.opacity}, this.state.isPickerVisible ? styles.pointerEventsAuto : styles.pointerEventsNone]}>
                    <CalendarPicker
                        minDate={this.props.minDate}
                        maxDate={this.props.maxDate}
                        value={this.state.selectedDate}
                        onSelected={this.setDate}
                        defaultYear={this.props.defaultYear}
                        onYearPressed={this.removeClickListener}
                    />
                </Animated.View>
            </View>
        );
    }
}

NewDatePicker.propTypes = propTypes;
NewDatePicker.defaultProps = datePickerDefaultProps;

export default withWindowDimensions(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <NewDatePicker {...props} innerRef={ref} />
)));
