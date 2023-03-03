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
            pickerLayout: {},
        };

        this.setDate = this.setDate.bind(this);
        this.togglePicker = this.togglePicker.bind(this);

        // this.onWindowResize = this.onWindowResize.bind(this);
        this.onClickedOutside = this.onClickedOutside.bind(this);

        this.opacity = new Animated.Value(0);
        this.wrapperRef = React.createRef();

        window.addEventListener('resize', this.onWindowResize);

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
        // this.props.navigation.addListener('transitionEnd', this.onWindowResize);
        // document.addEventListener('mousedown', this.onClickedOutside);
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    componentDidUpdate(prevProps) {
        if (prevProps.defaultYear !== this.props.defaultYear) {
            this.togglePicker();
        }
    }

    componentWillUnmount() {
        // window.removeEventListener('resize', this.onWindowResize);
        // this.props.navigation.removeListener('transitionEnd', this.onWindowResize);
        // document.removeEventListener('mousedown', this.onClickedOutside);
    }

    /**
     * Function called on window resize, to hide DatePicker and recalculate position of the calendar popover in the window
     */
    // onWindowResize() {
    //     if (this.wrapperRef) {
    //         const {
    //             x, y, width, height, left, top,
    //         } = this.wrapperRef.getBoundingClientRect();
    //         this.setState({
    //             pickerLayout: {
    //                 x, y, width, height, left, top,
    //             },
    //         });
    //     }

    //     if (!this.state.isPickerVisible) {
    //         return;
    //     }

    //     this.setState({isPickerVisible: false});
    // }

    // eslint-disable-next-line rulesdir/prefer-early-return
    onClickedOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
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

    togglePicker() {
        Animated.timing(this.opacity, {
            toValue: Number(JSON.stringify(this.opacity)) === 0 ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        // this.setState(prevState => ({...prevState, isPickerVisible: !prevState.isPickerVisible}));
    }

    render() {
        return (
            <View ref={ref => this.wrapperRef = ref} style={{flexGrow: 0}}>
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
                <Animated.View style={[styles.datePickerPopover, styles.border, {opacity: this.opacity}]}>
                    <CalendarPicker
                        minDate={this.minDate}
                        maxDate={this.maxDate}
                        value={this.state.selectedDate}
                        onSelected={this.setDate}
                        onChanged={this.props.onDateChanged}
                        onYearPressed={this.togglePicker}
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
