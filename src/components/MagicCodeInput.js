import PropTypes from 'prop-types';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TapGestureHandler} from 'react-native-gesture-handler';
import _ from 'underscore';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import FormHelpMessage from './FormHelpMessage';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';
import Text from './Text';
import TextInput from './TextInput';

const TEXT_INPUT_EMPTY_STATE = '';

const propTypes = {
    /** Information about the network */
    network: networkPropTypes.isRequired,

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
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code', 'off']).isRequired,

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

    /** Specifies if the keyboard should be disabled */
    isDisableKeyboard: PropTypes.bool,

    /** Last pressed digit on BigDigitPad */
    lastPressedDigit: PropTypes.string,
};

const defaultProps = {
    value: '',
    name: '',
    autoFocus: true,
    shouldDelayFocus: false,
    errorText: '',
    shouldSubmitOnComplete: true,
    innerRef: null,
    onChangeText: () => {},
    onFulfill: () => {},
    hasError: false,
    maxLength: CONST.MAGIC_CODE_LENGTH,
    isDisableKeyboard: false,
    lastPressedDigit: '',
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
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const inputRefs = useRef();
    const [input, setInput] = useState(TEXT_INPUT_EMPTY_STATE);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [editIndex, setEditIndex] = useState(0);
    const [wasSubmitted, setWasSubmitted] = useState(false);
    const shouldFocusLast = useRef(false);
    const inputWidth = useRef(0);
    const lastFocusedIndex = useRef(0);
    const lastValue = useRef(TEXT_INPUT_EMPTY_STATE);

    useEffect(() => {
        lastValue.current = input.length;
    }, [input]);

    const blurMagicCodeInput = () => {
        inputRefs.current.blur();
        setFocusedIndex(undefined);
    };

    const focusMagicCodeInput = () => {
        setFocusedIndex(0);
        lastFocusedIndex.current = 0;
        setEditIndex(0);
        inputRefs.current.focus();
    };

    const setInputAndIndex = (index) => {
        setInput(TEXT_INPUT_EMPTY_STATE);
        setFocusedIndex(index);
        setEditIndex(index);
    };

    useImperativeHandle(props.innerRef, () => ({
        focus() {
            focusMagicCodeInput();
        },
        focusLastSelected() {
            inputRefs.current.focus();
        },
        resetFocus() {
            setInput(TEXT_INPUT_EMPTY_STATE);
            focusMagicCodeInput();
        },
        clear() {
            lastFocusedIndex.current = 0;
            setInputAndIndex(0);
            inputRefs.current.focus();
            props.onChangeText('');
        },
        blur() {
            blurMagicCodeInput();
        },
    }));

    const validateAndSubmit = () => {
        const numbers = decomposeString(props.value, props.maxLength);
        if (wasSubmitted || !props.shouldSubmitOnComplete || _.filter(numbers, (n) => ValidationUtils.isNumeric(n)).length !== props.maxLength || props.network.isOffline) {
            return;
        }
        if (!wasSubmitted) {
            setWasSubmitted(true);
        }
        // Blurs the input and removes focus from the last input and, if it should submit
        // on complete, it will call the onFulfill callback.
        blurMagicCodeInput();
        props.onFulfill(props.value);
        lastValue.current = '';
    };

    useNetwork({onReconnect: validateAndSubmit});

    useEffect(() => {
        validateAndSubmit();

        // We have not added:
        // + the editIndex as the dependency because we don't want to run this logic after focusing on an input to edit it after the user has completed the code.
        // + the props.onFulfill as the dependency because props.onFulfill is changed when the preferred locale changed => avoid auto submit form when preferred locale changed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, props.shouldSubmitOnComplete]);

    /**
     * Focuses on the input when it is pressed.
     *
     * @param {Object} event
     * @param {Number} index
     */
    const onFocus = (event) => {
        if (shouldFocusLast.current) {
            lastValue.current = TEXT_INPUT_EMPTY_STATE;
            setInputAndIndex(lastFocusedIndex.current);
        }
        event.preventDefault();
    };

    /**
     * Callback for the onPress event, updates the indexes
     * of the currently focused input.
     *
     * @param {Number} index
     */
    const onPress = (index) => {
        shouldFocusLast.current = false;
        // TapGestureHandler works differently on mobile web and native app
        // On web gesture handler doesn't block interactions with textInput below so there is no need to run `focus()` manually
        if (!Browser.isMobileChrome() && !Browser.isMobileSafari()) {
            inputRefs.current.focus();
        }
        setInputAndIndex(index);
        lastFocusedIndex.current = index;
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

        // Checks if one new character was added, or if the content was replaced
        const hasToSlice = value.length - 1 === lastValue.current.length && value.slice(0, value.length - 1) === lastValue.current;

        // Gets the new value added by the user
        const addedValue = hasToSlice ? value.slice(lastValue.current.length, value.length) : value;

        lastValue.current = value;
        // Updates the focused input taking into consideration the last input
        // edited and the number of digits added by the user.
        const numbersArr = addedValue
            .trim()
            .split('')
            .slice(0, props.maxLength - editIndex);
        const updatedFocusedIndex = Math.min(editIndex + (numbersArr.length - 1) + 1, props.maxLength - 1);

        let numbers = decomposeString(props.value, props.maxLength);
        numbers = [...numbers.slice(0, editIndex), ...numbersArr, ...numbers.slice(numbersArr.length + editIndex, props.maxLength)];

        setInputAndIndex(updatedFocusedIndex);

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
        if (keyValue === 'Backspace' || keyValue === '<') {
            let numbers = decomposeString(props.value, props.maxLength);

            // If keyboard is disabled and no input is focused we need to remove
            // the last entered digit and focus on the correct input
            if (props.isDisableKeyboard && focusedIndex === undefined) {
                const indexBeforeLastEditIndex = editIndex === 0 ? editIndex : editIndex - 1;

                const indexToFocus = numbers[editIndex] === CONST.MAGIC_CODE_EMPTY_CHAR ? indexBeforeLastEditIndex : editIndex;
                inputRefs.current[indexToFocus].focus();
                props.onChangeText(props.value.substring(0, indexToFocus));

                return;
            }

            // If the currently focused index already has a value, it will delete
            // that value but maintain the focus on the same input.
            if (numbers[focusedIndex] !== CONST.MAGIC_CODE_EMPTY_CHAR) {
                setInput(TEXT_INPUT_EMPTY_STATE);
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

            // Saves the input string so that it can compare to the change text
            // event that will be triggered, this is a workaround for mobile that
            // triggers the change text on the event after the key press.
            setInputAndIndex(newFocusedIndex);
            props.onChangeText(composeToString(numbers));

            if (!_.isUndefined(newFocusedIndex)) {
                inputRefs.current.focus();
            }
        }
        if (keyValue === 'ArrowLeft' && !_.isUndefined(focusedIndex)) {
            const newFocusedIndex = Math.max(0, focusedIndex - 1);
            setInputAndIndex(newFocusedIndex);
            inputRefs.current.focus();
        } else if (keyValue === 'ArrowRight' && !_.isUndefined(focusedIndex)) {
            const newFocusedIndex = Math.min(focusedIndex + 1, props.maxLength - 1);
            setInputAndIndex(newFocusedIndex);
            inputRefs.current.focus();
        } else if (keyValue === 'Enter') {
            // We should prevent users from submitting when it's offline.
            if (props.network.isOffline) {
                return;
            }
            setInput(TEXT_INPUT_EMPTY_STATE);
            props.onFulfill(props.value);
        }
    };

    /**
     *  If isDisableKeyboard is true we will have to call onKeyPress and onChangeText manually
     *  as the press on digit pad will not trigger native events. We take lastPressedDigit from props
     *  as it stores the last pressed digit pressed on digit pad. We take only the first character
     *  as anything after that is added to differentiate between two same digits passed in a row.
     */

    useEffect(() => {
        if (!props.isDisableKeyboard) {
            return;
        }

        const value = props.lastPressedDigit.charAt(0);
        onKeyPress({nativeEvent: {key: value}});
        onChangeText(value);

        // We have not added:
        // + the onChangeText and onKeyPress as the dependencies because we only want to run this when lastPressedDigit changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.lastPressedDigit, props.isDisableKeyboard]);

    return (
        <>
            <View style={[styles.magicCodeInputContainer]}>
                <TapGestureHandler
                    onBegan={(e) => {
                        onPress(Math.floor(e.nativeEvent.x / (inputWidth.current / props.maxLength)));
                    }}
                >
                    {/* Android does not handle touch on invisible Views so I created a wrapper around invisible TextInput just to handle taps */}
                    <View
                        style={[StyleSheet.absoluteFillObject, styles.w100, styles.h100, styles.invisibleOverlay]}
                        collapsable={false}
                    >
                        <TextInput
                            onLayout={(e) => {
                                inputWidth.current = e.nativeEvent.layout.width;
                            }}
                            ref={(ref) => (inputRefs.current = ref)}
                            autoFocus={props.autoFocus}
                            inputMode="numeric"
                            textContentType="oneTimeCode"
                            name={props.name}
                            maxLength={props.maxLength}
                            value={input}
                            hideFocusedState
                            autoComplete={input.length === 0 && props.autoComplete}
                            shouldDelayFocus={input.length === 0 && props.shouldDelayFocus}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            onChangeText={(value) => {
                                onChangeText(value);
                            }}
                            onKeyPress={onKeyPress}
                            onFocus={onFocus}
                            onBlur={() => {
                                shouldFocusLast.current = true;
                                lastFocusedIndex.current = focusedIndex;
                                setFocusedIndex(undefined);
                            }}
                            selectionColor="transparent"
                            inputStyle={[styles.inputTransparent]}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            style={[styles.inputTransparent]}
                            textInputContainerStyles={[styles.borderNone]}
                        />
                    </View>
                </TapGestureHandler>
                {_.map(getInputPlaceholderSlots(props.maxLength), (index) => (
                    <View
                        key={index}
                        style={props.maxLength === CONST.MAGIC_CODE_LENGTH ? [styles.w15] : [styles.flex1, index !== 0 && styles.ml3]}
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
MagicCodeInput.displayName = 'MagicCodeInput';

const MagicCodeInputWithRef = forwardRef((props, ref) => (
    <MagicCodeInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

MagicCodeInputWithRef.displayName = 'MagicCodeInputWithRef';

export default withNetwork()(MagicCodeInputWithRef);
