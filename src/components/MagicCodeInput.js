import React, {useEffect, useImperativeHandle, useRef, useState, forwardRef} from 'react';
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

    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

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
    innerRef: null,
    onChangeText: () => {},
    onFulfill: () => {},
};

/**
 * Converts a given string into an array of numbers that must have the same
 * number of elements as the number of inputs.
 *
 * @param {String} value
 * @returns {Array}
 */
const decomposeString = (value) => {
    let arr = _.map(value.split('').slice(0, CONST.MAGIC_CODE_LENGTH), (v) => (ValidationUtils.isNumeric(v) ? v : CONST.MAGIC_CODE_EMPTY_CHAR));
    if (arr.length < CONST.MAGIC_CODE_LENGTH) {
        arr = arr.concat(Array(CONST.MAGIC_CODE_LENGTH - arr.length).fill(CONST.MAGIC_CODE_EMPTY_CHAR));
    }
    return arr;
};

/**
 * Converts an array of strings into a single string. If there are undefined or
 * empty values, it will replace them with a space.
 *
 * @param {Array} value
 * @returns {String}
 */
const composeToString = (value) => _.map(value, (v) => (v === undefined || v === '' ? CONST.MAGIC_CODE_EMPTY_CHAR : v)).join('');

const inputPlaceholderSlots = Array.from(Array(CONST.MAGIC_CODE_LENGTH).keys());

function MagicCodeInput(props) {
    const inputRefs = useRef([]);
    const [input, setInput] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [editIndex, setEditIndex] = useState(0);

    useImperativeHandle(props.innerRef, () => ({
        focus() {
            setFocusedIndex(0);
            inputRefs.current[0].focus();
        },
        clear() {
            setInput('');
            setFocusedIndex(0);
            setEditIndex(0);
            inputRefs.current[0].focus();
            props.onChangeText('');
        },
    }));

    useEffect(() => {
        // Blurs the input and removes focus from the last input and, if it should submit
        // on complete, it will call the onFulfill callback.
        const numbers = decomposeString(props.value);
        if (!props.shouldSubmitOnComplete || _.filter(numbers, (n) => ValidationUtils.isNumeric(n)).length !== CONST.MAGIC_CODE_LENGTH) {
            return;
        }
        inputRefs.current[editIndex].blur();
        setFocusedIndex(undefined);
        props.onFulfill(props.value);

        // We have not added the editIndex as the dependency because we don't want to run this logic after focusing on an input to edit it after the user has completed the code.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, props.shouldSubmitOnComplete, props.onFulfill]);

    useEffect(() => {
        if (!props.autoFocus) {
            return;
        }

        let focusTimeout = null;
        if (props.shouldDelayFocus) {
            focusTimeout = setTimeout(() => inputRefs.current[0].focus(), CONST.ANIMATED_TRANSITION);
        }

        inputRefs.current[0].focus();

        return () => {
            if (!focusTimeout) {
                return;
            }
            clearTimeout(focusTimeout);
        };
    }, [props.autoFocus, props.shouldDelayFocus]);

    /**
     * Focuses on the input when it is pressed.
     *
     * @param {Object} event
     * @param {Number} index
     */
    const onFocus = (event) => {
        event.preventDefault();
        setInput('');
    };

    /**
     * Callback for the onPress event, updates the indexes
     * of the currently focused input.
     *
     * @param {Object} event
     * @param {Number} index
     */
    const onPress = (event, index) => {
        event.preventDefault();
        setInput('');
        setFocusedIndex(index);
        setEditIndex(index);
    };

    /**
     * Updates the magic inputs with the contents written in the
     * input. It spreads each number into each input and updates
     * the focused input on the next empty one, if exists.
     * It handles both fast typing and only one digit at a time
     * in a specific position.
     *
     * @param {String} value
     */
    const onChangeText = (value) => {
        if (_.isUndefined(value) || _.isEmpty(value) || !ValidationUtils.isNumeric(value)) {
            return;
        }

        // Updates the focused input taking into consideration the last input
        // edited and the number of digits added by the user.
        const numbersArr = value
            .trim()
            .split('')
            .slice(0, CONST.MAGIC_CODE_LENGTH - editIndex);
        const updatedFocusedIndex = Math.min(editIndex + (numbersArr.length - 1) + 1, CONST.MAGIC_CODE_LENGTH - 1);

        let numbers = decomposeString(props.value);
        numbers = [...numbers.slice(0, editIndex), ...numbersArr, ...numbers.slice(numbersArr.length + editIndex, CONST.MAGIC_CODE_LENGTH)];

        setFocusedIndex(updatedFocusedIndex);
        setInput(value);

        const finalInput = composeToString(numbers);
        props.onChangeText(finalInput);
    };

    /**
     * Handles logic related to certain key presses.
     *
     * NOTE: when using Android Emulator, this can only be tested using
     * hardware keyboard inputs.
     *
     * @param {Object} event
     */
    const onKeyPress = ({nativeEvent: {key: keyValue}}) => {
        if (keyValue === 'Backspace') {
            let numbers = decomposeString(props.value);

            // If the currently focused index already has a value, it will delete
            // that value but maintain the focus on the same input.
            if (numbers[focusedIndex] !== CONST.MAGIC_CODE_EMPTY_CHAR) {
                setInput('');
                numbers = [...numbers.slice(0, focusedIndex), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex + 1, CONST.MAGIC_CODE_LENGTH)];
                setEditIndex(focusedIndex);
                props.onChangeText(composeToString(numbers));
                return;
            }

            const hasInputs = _.filter(numbers, (n) => ValidationUtils.isNumeric(n)).length !== 0;

            // Fill the array with empty characters if there are no inputs.
            if (focusedIndex === 0 && !hasInputs) {
                numbers = Array(CONST.MAGIC_CODE_LENGTH).fill(CONST.MAGIC_CODE_EMPTY_CHAR);

                // Deletes the value of the previous input and focuses on it.
            } else if (focusedIndex !== 0) {
                numbers = [...numbers.slice(0, Math.max(0, focusedIndex - 1)), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex, CONST.MAGIC_CODE_LENGTH)];
            }

            const newFocusedIndex = Math.max(0, focusedIndex - 1);

            // Saves the input string so that it can compare to the change text
            // event that will be triggered, this is a workaround for mobile that
            // triggers the change text on the event after the key press.
            setInput('');
            setFocusedIndex(newFocusedIndex);
            setEditIndex(newFocusedIndex);
            props.onChangeText(composeToString(numbers));

            if (!_.isUndefined(newFocusedIndex)) {
                inputRefs.current[newFocusedIndex].focus();
            }
        }
        if (keyValue === 'ArrowLeft' && !_.isUndefined(focusedIndex)) {
            const newFocusedIndex = Math.max(0, focusedIndex - 1);
            setInput('');
            setFocusedIndex(newFocusedIndex);
            setEditIndex(newFocusedIndex);
            inputRefs.current[newFocusedIndex].focus();
        } else if (keyValue === 'ArrowRight' && !_.isUndefined(focusedIndex)) {
            const newFocusedIndex = Math.min(focusedIndex + 1, CONST.MAGIC_CODE_LENGTH - 1);
            setInput('');
            setFocusedIndex(newFocusedIndex);
            setEditIndex(newFocusedIndex);
            inputRefs.current[newFocusedIndex].focus();
        } else if (keyValue === 'Enter') {
            setInput('');
            props.onFulfill(props.value);
        }
    };

    return (
        <>
            <View style={[styles.magicCodeInputContainer]}>
                {_.map(inputPlaceholderSlots, (index) => (
                    <View
                        key={index}
                        style={[styles.w15]}
                    >
                        <View style={[styles.textInputContainer, focusedIndex === index ? styles.borderColorFocus : {}]}>
                            <Text style={[styles.magicCodeInput, styles.textAlignCenter]}>{decomposeString(props.value)[index] || ''}</Text>
                        </View>
                        <View style={[StyleSheet.absoluteFillObject, styles.w100, styles.opacity0]}>
                            <TextInput
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                autoFocus={index === 0 && props.autoFocus}
                                inputMode="numeric"
                                textContentType="oneTimeCode"
                                name={props.name}
                                maxLength={CONST.MAGIC_CODE_LENGTH}
                                value={input}
                                hideFocusedState
                                autoComplete={index === 0 ? props.autoComplete : 'off'}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                onChangeText={(value) => {
                                    // Do not run when the event comes from an input that is
                                    // not currently being responsible for the input, this is
                                    // necessary to avoid calls when the input changes due to
                                    // deleted characters. Only happens in mobile.
                                    if (index !== editIndex) {
                                        return;
                                    }
                                    onChangeText(value);
                                }}
                                onKeyPress={onKeyPress}
                                onPress={(event) => onPress(event, index)}
                                onFocus={onFocus}
                            />
                        </View>
                    </View>
                ))}
            </View>
            {!_.isEmpty(props.errorText) && (
                <FormHelpMessage
                    isError
                    message={props.errorText}
                />
            )}
        </>
    );
}

MagicCodeInput.propTypes = propTypes;
MagicCodeInput.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    <MagicCodeInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
