import React from 'react';
import {Animated, View} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import TextInput from '../TextInput';

// import Popover from '../Popover';
import CalendarPicker from '../CalendarPicker';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withNavigation from '../withNavigation';
import compose from '../../libs/compose';
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
        };

        this.setDate = this.setDate.bind(this);
        this.togglePicker = this.togglePicker.bind(this);
        this.removeClickListener = this.removeClickListener.bind(this);
        this.onClickedOutside = this.onClickedOutside.bind(this);

        this.opacity = new Animated.Value(0);
        this.wrapperRef = React.createRef();

        /* We're using uncontrolled input otherwise it wont be possible to
        * raise change events with a date value - each change will produce a date
        * and make us reset the text input */
        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';

        this.minDate = props.minDate ? moment(props.minDate).toDate() : null;
        this.maxDate = props.maxDate ? moment(props.maxDate).toDate() : null;
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onClickedOutside);
        // eslint-disable-next-line rulesdir/prefer-early-return
        this.opacity.addListener(({value}) => {
            if (value === 0 || value === 1) {
                this.setState(prev => ({...prev, isPickerVisible: !!value}));
            }
        });
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    componentDidUpdate(prevProps) {
        if (prevProps.maxDate !== this.props.maxDate) {
            document.addEventListener('mousedown', this.onClickedOutside);
        }
    }

    componentWillUnmount() {
        this.removeClickListener();
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    onClickedOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target) && this.wrapperRef !== event.target) {
            this.togglePicker();
        }
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

    removeClickListener() {
        document.removeEventListener('mousedown', this.onClickedOutside);
    }

    togglePicker() {
        Animated.timing(this.opacity, {
            toValue: this.state.isPickerVisible ? 0 : 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    render() {
        return (
            <View ref={ref => this.wrapperRef = ref} style={[styles.flex1]}>
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
                    value={this.props.value}
                    defaultValue={this.defaultValue}
                    placeholder={this.props.placeholder || CONST.DATE.MOMENT_FORMAT_STRING}
                    errorText={this.props.errorText}
                    containerStyles={this.props.containerStyles}
                    disabled={this.props.disabled}
                    onBlur={this.props.onBlur}
                    readOnly
                />
                <Animated.View style={[styles.datePickerPopover, styles.border, {opacity: this.opacity}, this.state.isPickerVisible ? styles.pointerEventsAuto : styles.pointerEventsNone]}>
                    <CalendarPicker
                        minDate={this.minDate}
                        maxDate={this.maxDate}
                        value={this.state.selectedDate}
                        onSelected={this.setDate}
                        onChanged={this.props.onDateChanged}

                        onYearPressed={this.removeClickListener}
                        defaultMonth={this.props.defaultMonth}
                        defaultYear={this.props.defaultYear}
                    />
                </Animated.View>
            </View>
        );
    }
}

DatePicker.propTypes = datePickerPropTypes;
DatePicker.defaultProps = defaultProps;

export default compose(withNavigation,
    withWindowDimensions)(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
        <DatePicker {...props} innerRef={ref} />
)));
