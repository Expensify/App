import React, {useEffect, useImperativeHandle, useRef, useState, forwardRef} from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import * as ValidationUtils from '../libs/ValidationUtils';
import CONST from '../CONST';
import Text from './Text';
import TextInput from './TextInput';
import FormHelpMessage from './FormHelpMessage';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';
import useNetwork from '../hooks/useNetwork';

const propTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Name attribute for the input */
    name: PropTypes.string,

    /** Input value */
    value: PropTypes.string,

    /** Should the input auto focus */
    autoFocus: PropTypes.bool,

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

    /** Specifies if the input has a validation error */
    hasError: PropTypes.bool,

    /** Specifies the max length of the input */
    maxLength: PropTypes.number,
};

const defaultProps = {
    value: undefined,
    name: '',
    autoFocus: true,
    errorText: '',
    shouldSubmitOnComplete: true,
    innerRef: null,
    onChangeText: () => {},
    onFulfill: () => {},
    hasError: false,
    maxLength: CONST.MAGIC_CODE_LENGTH,
};

/**
 * Converts a given string into an array of numbers that must have the same
 * number of elements as the number of inputs.
 *
 * @param {String} value
 * @param {Number} length
 * @returns {Array}
 */
const decomposeString = (value, length) => {
    let arr = _.map(value.split('').slice(0, length), (v) => (ValidationUtils.isNumeric(v) ? v : CONST.MAGIC_CODE_EMPTY_CHAR));
    if (arr.length < length) {
        arr = arr.concat(Array(length - arr.length).fill(CONST.MAGIC_CODE_EMPTY_CHAR));
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

const getInputPlaceholderSlots = (length) => Array.from(Array(length).keys());

function MagicCodeInput(props) {
    const inputRefs = useRef([]);
    const [input, setInput] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [editIndex, setEditIndex] = useState(0);

    const blurMagicCodeInput = () => {
        inputRefs.current[editIndex].blur();
        setFocusedIndex(undefined);
    };

    useImperativeHandle(props.innerRef, () => ({
        focus() {
            inputRefs.current[0].focus();
        },
        clear() {
            inputRefs.current[0].focus();
            props.onChangeText('');
        },
        blur() {
            blurMagicCodeInput();
        },
    }));

    /**
     * Validate the entered code and submit
     *
     * @param {String} value
     */
    const validateAndSubmit = (value) => {
        const numbers = decomposeString(value, props.maxLength);
        if (!props.shouldSubmitOnComplete || _.filter(numbers, (n) => ValidationUtils.isNumeric(n)).length !== props.maxLength || props.network.isOffline) {
            return;
        }
        // Blurs the input and removes focus from the last input and, if it should submit
        // on complete, it will call the onFulfill callback.
        blurMagicCodeInput();
        props.onFulfill(value);
    };

    useNetwork({onReconnect: () => validateAndSubmit(props.value)});

    useEffect(() => {
        if (!props.hasError) {
            return;
        }

        // Focus the last input if an error occurred to allow for corrections
        inputRefs.current[props.maxLength - 1].focus();
    }, [props.hasError, props.maxLength]);

    useEffect(() => {
        validateAndSubmit(props.value);

        // We have not added:
        // + the editIndex as the dependency because we don't want to run this logic after focusing on an input to edit it after the user has completed the code.
        // + the props.onFulfill as the dependency because props.onFulfill is changed when the preferred locale changed => avoid auto submit form when preferred locale changed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, props.shouldSubmitOnComplete]);

    /**
     * Callback for the onFocus event, updates the indexes
     * of the currently focused input.
     *
     * @param {Object} event
     * @param {Number} index
     */
    const onFocus = (event, index) => {
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
            .slice(0, props.maxLength - editIndex);
        const updatedFocusedIndex = Math.min(editIndex + (numbersArr.length - 1) + 1, props.maxLength - 1);

        let numbers = decomposeString(props.value, props.maxLength);
        numbers = [...numbers.slice(0, editIndex), ...numbersArr, ...numbers.slice(numbersArr.length + editIndex, props.maxLength)];

        inputRefs.current[updatedFocusedIndex].focus();

        const finalInput = composeToString(numbers);
        props.onChangeText(finalInput);

        // If the same number is pressed, we cannot depend on props.value in useEffect for re-submitting
        if (props.value === finalInput) {
            validateAndSubmit(finalInput);
        }
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
            let numbers = decomposeString(props.value, props.maxLength);

            // If the currently focused index already has a value, it will delete
            // that value but maintain the focus on the same input.
            if (numbers[focusedIndex] !== CONST.MAGIC_CODE_EMPTY_CHAR) {
                setInput('');
                numbers = [...numbers.slice(0, focusedIndex), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex + 1, props.maxLength)];
                setEditIndex(focusedIndex);
                props.onChangeText(composeToString(numbers));
                return;
            }

            const hasInputs = _.filter(numbers, (n) => ValidationUtils.isNumeric(n)).length !== 0;

            // Fill the array with empty characters if there are no inputs.
            if (focusedIndex === 0 && !hasInputs) {
                numbers = Array(props.maxLength).fill(CONST.MAGIC_CODE_EMPTY_CHAR);

                // Deletes the value of the previous input and focuses on it.
            } else if (focusedIndex !== 0) {
                numbers = [...numbers.slice(0, Math.max(0, focusedIndex - 1)), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex, props.maxLength)];
            }

            const newFocusedIndex = Math.max(0, focusedIndex - 1);
            props.onChangeText(composeToString(numbers));

            if (!_.isUndefined(newFocusedIndex)) {
                inputRefs.current[newFocusedIndex].focus();
            }
        }
        if (keyValue === 'ArrowLeft' && !_.isUndefined(focusedIndex)) {
            const newFocusedIndex = Math.max(0, focusedIndex - 1);
            inputRefs.current[newFocusedIndex].focus();
        } else if (keyValue === 'ArrowRight' && !_.isUndefined(focusedIndex)) {
            const newFocusedIndex = Math.min(focusedIndex + 1, props.maxLength - 1);
            inputRefs.current[newFocusedIndex].focus();
        } else if (keyValue === 'Enter') {
            // We should prevent users from submitting when it's offline.
            if (props.network.isOffline) {
                return;
            }
            setInput('');
            props.onFulfill(props.value);
        }
    };

    return (
        <>
            <View style={[styles.magicCodeInputContainer]}>
                {_.map(getInputPlaceholderSlots(props.maxLength), (index) => (
                    <View
                        key={index}
                        style={[styles.w15]}
                    >
                        <View
                            style={[
                                styles.textInputContainer,
                                StyleUtils.getHeightOfMagicCodeInput(),
                                props.hasError || props.errorText ? styles.borderColorDanger : {},
                                focusedIndex === index ? styles.borderColorFocus : {},
                            ]}
                        >
                            <Text style={[styles.magicCodeInput, styles.textAlignCenter]}>{decomposeString(props.value, props.maxLength)[index] || ''}</Text>
                        </View>
                        {/* Hide the input above the text. Cannot set opacity to 0 as it would break pasting on iOS Safari. */}
                        <View style={[StyleSheet.absoluteFillObject, styles.w100, styles.bgTransparent]}>
                            <TextInput
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                autoFocus={index === 0 && props.autoFocus}
                                inputMode="numeric"
                                textContentType="oneTimeCode"
                                name={props.name}
                                maxLength={props.maxLength}
                                value={input}
                                hideFocusedState
                                autoComplete={index === 0 ? props.autoComplete : 'off'}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                onChangeText={(value) => {
                                    // Do not run when the event comes from an input that is
                                    // not currently being responsible for the input, this is
                                    // necessary to avoid calls when the input changes due to
                                    // deleted characters. Only happens in mobile.
                                    if (index !== editIndex || _.isUndefined(focusedIndex)) {
                                        return;
                                    }
                                    onChangeText(value);
                                }}
                                onKeyPress={onKeyPress}
                                onFocus={(event) => onFocus(event, index)}
                                // Manually set selectionColor to make caret transparent.
                                // We cannot use caretHidden as it breaks the pasting function on Android.
                                selectionColor="transparent"
                                textInputContainerStyles={[styles.borderNone]}
                                inputStyle={[styles.inputTransparent]}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
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

export default withNetwork()(
    forwardRef((props, ref) => (
        <MagicCodeInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
);
