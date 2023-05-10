import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import * as ValidationUtils from '../libs/ValidationUtils';
import CONST from '../CONST';
import Text from './Text';
import TextInput from './TextInput';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Name attribute for the input */
    name: PropTypes.string,

    /** Input value */
    value: PropTypes.string,

    /** Should the input auto focus */
    autoFocus: PropTypes.bool,

    /** Whether we should wait before focusing the TextInput, useful when using transitions  */
    shouldDelayFocus: PropTypes.bool,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code']).isRequired,

    /* Should submit when the input is complete */
    shouldSubmitOnComplete: PropTypes.bool,

    /** Function to call when the input is changed  */
    onChangeText: PropTypes.func,

    /** Function to call when the input is submitted or fully complete */
    onFulfill: PropTypes.func,
};

const defaultProps = {
    value: undefined,
    name: '',
    autoFocus: true,
    shouldDelayFocus: false,
    errorText: '',
    shouldSubmitOnComplete: true,
    onChangeText: () => {},
    onFulfill: () => {},
};

class MagicCodeInput extends React.PureComponent {
    constructor(props) {
        super(props);

        this.inputPlaceholderSlots = Array.from(Array(CONST.MAGIC_CODE_LENGTH).keys());
        this.inputRefs = {};

        this.state = {
            input: '',
            focusedIndex: 0,
            editIndex: 0,
            numbers: props.value ? this.decomposeString(props.value) : Array(CONST.MAGIC_CODE_LENGTH).fill(CONST.MAGIC_CODE_EMPTY_CHAR),
        };

        this.onFocus = this.onFocus.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    componentDidMount() {
        if (!this.props.autoFocus) {
            return;
        }

        if (this.props.shouldDelayFocus) {
            this.focusTimeout = setTimeout(() => this.inputRefs[0].focus(), CONST.ANIMATED_TRANSITION);
        }

        this.inputRefs[0].focus();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value === this.props.value) {
            return;
        }

        this.setState({
            numbers: this.decomposeString(this.props.value),
        });
    }

    componentWillUnmount() {
        if (!this.focusTimeout) {
            return;
        }
        clearTimeout(this.focusTimeout);
    }

    /**
     * Focuses on the input when it is pressed.
     *
     * @param {Object} event
     * @param {Number} index
     */
    onFocus(event) {
        event.preventDefault();
        this.setState({
            input: '',
        });
    }

    /**
     * Callback for the onPress event, updates the indexes
     * of the currently focused input.
     *
     * @param {Object} event
     * @param {Number} index
     */
    onPress(event, index) {
        event.preventDefault();
        this.setState({
            input: '',
            focusedIndex: index,
            editIndex: index,
        });
    }

    /**
     * Updates the magic inputs with the contents written in the
     * input. It spreads each number into each input and updates
     * the focused input on the next empty one, if exists.
     * It handles both fast typing and only one digit at a time
     * in a specific position.
     *
     * @param {String} value
     */
    onChangeText(value) {
        if (_.isUndefined(value) || _.isEmpty(value) || !ValidationUtils.isNumeric(value)) {
            return;
        }

        this.setState(
            (prevState) => {
                const numbersArr = value
                    .trim()
                    .split('')
                    .slice(0, CONST.MAGIC_CODE_LENGTH - prevState.editIndex);
                const numbers = [
                    ...prevState.numbers.slice(0, prevState.editIndex),
                    ...numbersArr,
                    ...prevState.numbers.slice(numbersArr.length + prevState.editIndex, CONST.MAGIC_CODE_LENGTH),
                ];

                // Updates the focused input taking into consideration the last input
                // edited and the number of digits added by the user.
                const focusedIndex = Math.min(prevState.editIndex + (numbersArr.length - 1) + 1, CONST.MAGIC_CODE_LENGTH - 1);

                return {
                    numbers,
                    focusedIndex,
                    input: value,
                };
            },
            () => {
                const finalInput = this.composeToString(this.state.numbers);
                this.props.onChangeText(finalInput);

                // Blurs the input and removes focus from the last input and, if it should submit
                // on complete, it will call the onFulfill callback.
                if (this.props.shouldSubmitOnComplete && _.filter(this.state.numbers, (n) => ValidationUtils.isNumeric(n)).length === CONST.MAGIC_CODE_LENGTH) {
                    this.inputRefs[this.state.editIndex].blur();
                    this.setState({focusedIndex: undefined}, () => this.props.onFulfill(finalInput));
                }
            },
        );
    }

    /**
     * Handles logic related to certain key presses.
     *
     * NOTE: when using Android Emulator, this can only be tested using
     * hardware keyboard inputs.
     *
     * @param {Object} event
     */
    onKeyPress({nativeEvent: {key: keyValue}}) {
        if (keyValue === 'Backspace') {
            this.setState(
                ({numbers, focusedIndex}) => {
                    // If the currently focused index already has a value, it will delete
                    // that value but maintain the focus on the same input.
                    if (numbers[focusedIndex] !== CONST.MAGIC_CODE_EMPTY_CHAR) {
                        const newNumbers = [...numbers.slice(0, focusedIndex), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex + 1, CONST.MAGIC_CODE_LENGTH)];
                        return {
                            input: '',
                            numbers: newNumbers,
                            editIndex: focusedIndex,
                        };
                    }

                    const hasInputs = _.filter(numbers, (n) => ValidationUtils.isNumeric(n)).length !== 0;
                    let newNumbers = numbers;

                    // Fill the array with empty characters if there are no inputs.
                    if (focusedIndex === 0 && !hasInputs) {
                        newNumbers = Array(CONST.MAGIC_CODE_LENGTH).fill(CONST.MAGIC_CODE_EMPTY_CHAR);

                        // Deletes the value of the previous input and focuses on it.
                    } else if (focusedIndex !== 0) {
                        newNumbers = [...numbers.slice(0, Math.max(0, focusedIndex - 1)), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex, CONST.MAGIC_CODE_LENGTH)];
                    }

                    // Saves the input string so that it can compare to the change text
                    // event that will be triggered, this is a workaround for mobile that
                    // triggers the change text on the event after the key press.
                    return {
                        input: '',
                        numbers: newNumbers,
                        focusedIndex: Math.max(0, focusedIndex - 1),
                        editIndex: Math.max(0, focusedIndex - 1),
                    };
                },
                () => {
                    if (_.isUndefined(this.state.focusedIndex)) {
                        return;
                    }
                    this.inputRefs[this.state.focusedIndex].focus();
                },
            );
        } else if (keyValue === 'ArrowLeft' && !_.isUndefined(this.state.focusedIndex)) {
            this.setState(
                (prevState) => ({
                    input: '',
                    focusedIndex: Math.max(0, prevState.focusedIndex - 1),
                    editIndex: Math.max(0, prevState.focusedIndex - 1),
                }),
                () => this.inputRefs[this.state.focusedIndex].focus(),
            );
        } else if (keyValue === 'ArrowRight' && !_.isUndefined(this.state.focusedIndex)) {
            this.setState(
                (prevState) => ({
                    input: '',
                    focusedIndex: Math.min(prevState.focusedIndex + 1, CONST.MAGIC_CODE_LENGTH - 1),
                    editIndex: Math.min(prevState.focusedIndex + 1, CONST.MAGIC_CODE_LENGTH - 1),
                }),
                () => this.inputRefs[this.state.focusedIndex].focus(),
            );
        } else if (keyValue === 'Enter') {
            this.setState({input: ''});
            this.props.onFulfill(this.composeToString(this.state.numbers));
        }
    }

    focus() {
        this.setState({focusedIndex: 0});
        this.inputRefs[0].focus();
    }

    clear() {
        this.setState({
            input: '',
            focusedIndex: 0,
            editIndex: 0,
            numbers: Array(CONST.MAGIC_CODE_LENGTH).fill(CONST.MAGIC_CODE_EMPTY_CHAR),
        });
        this.inputRefs[0].focus();
    }

    /**
     * Converts a given string into an array of numbers that must have the same
     * number of elements as the number of inputs.
     *
     * @param {String} value
     * @returns {Array}
     */
    decomposeString(value) {
        let arr = _.map(value.split('').slice(0, CONST.MAGIC_CODE_LENGTH), (v) => (ValidationUtils.isNumeric(v) ? v : CONST.MAGIC_CODE_EMPTY_CHAR));
        if (arr.length < CONST.MAGIC_CODE_LENGTH) {
            arr = arr.concat(Array(CONST.MAGIC_CODE_LENGTH - arr.length).fill(CONST.MAGIC_CODE_EMPTY_CHAR));
        }
        return arr;
    }

    /**
     * Converts an array of strings into a single string. If there are undefined or
     * empty values, it will replace them with a space.
     *
     * @param {Array} value
     * @returns {String}
     */
    composeToString(value) {
        return _.map(value, (v) => (v === undefined || v === '' ? CONST.MAGIC_CODE_EMPTY_CHAR : v)).join('');
    }

    render() {
        return (
            <>
                <View style={[styles.magicCodeInputContainer]}>
                    {_.map(this.inputPlaceholderSlots, (index) => (
                        <View
                            key={index}
                            style={[styles.w15]}
                        >
                            <View style={[styles.textInputContainer, this.state.focusedIndex === index ? styles.borderColorFocus : {}]}>
                                <Text style={[styles.magicCodeInput, styles.textAlignCenter]}>{this.state.numbers[index] || ''}</Text>
                            </View>
                            <View style={[StyleSheet.absoluteFillObject, styles.w100, styles.opacity0]}>
                                <TextInput
                                    ref={(ref) => (this.inputRefs[index] = ref)}
                                    autoFocus={index === 0 && this.props.autoFocus}
                                    inputMode="numeric"
                                    textContentType="oneTimeCode"
                                    name={this.props.name}
                                    maxLength={CONST.MAGIC_CODE_LENGTH}
                                    value={this.state.input}
                                    hideFocusedState
                                    autoComplete={index === 0 ? this.props.autoComplete : 'off'}
                                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                    onChangeText={(value) => {
                                        // Do not run when the event comes from an input that is
                                        // not currently being responsible for the input, this is
                                        // necessary to avoid calls when the input changes due to
                                        // deleted characters. Only happens in mobile.
                                        if (index !== this.state.editIndex) {
                                            return;
                                        }
                                        this.onChangeText(value);
                                    }}
                                    onKeyPress={this.onKeyPress}
                                    onPress={(event) => this.onPress(event, index)}
                                    onFocus={this.onFocus}
                                />
                            </View>
                        </View>
                    ))}
                </View>
                {!_.isEmpty(this.props.errorText) && (
                    <FormHelpMessage
                        isError
                        message={this.props.errorText}
                    />
                )}
            </>
        );
    }
}

MagicCodeInput.propTypes = propTypes;
MagicCodeInput.defaultProps = defaultProps;

export default MagicCodeInput;
