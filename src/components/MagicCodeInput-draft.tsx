import React, {ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, View, TextInput as RNTextInput, NativeSyntheticEvent, TextInputFocusEventData} from 'react-native';
import {HandlerStateChangeEvent, TapGestureHandler} from 'react-native-gesture-handler';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import FormHelpMessage from './FormHelpMessage';
import Text from './Text';
import TextInput from './TextInput';

const TEXT_INPUT_EMPTY_STATE = '';

type MagicCodeInputProps = {
    /** Name attribute for the input */
    name?: string,

    /** Input value */
    value?: string,

    /** Should the input auto focus */
    autoFocus?: boolean,

    /** Whether we should wait before focusing the TextInput, useful when using transitions  */
    shouldDelayFocus?: boolean,

    /** Error text to display */
    errorText?: string,

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: 'sms-otp' | 'one-time-code' | 'off',

    /* Should submit when the input is complete */
    shouldSubmitOnComplete?: boolean,

    /** Function to call when the input is changed  */
    onChangeText?: (value: string) => void,

    /** Function to call when the input is submitted or fully complete */
    onFulfill?: (value: string) => void,

    /** Specifies if the input has a validation error */
    hasError?: boolean,

    /** Specifies the max length of the input */
    maxLength?: number,

    /** Specifies if the keyboard should be disabled */
    isDisableKeyboard?: boolean,

    /** Last pressed digit on BigDigitPad */
    lastPressedDigit?: string,
}

/**
 * Converts a given string into an array of numbers that must have the same
 * number of elements as the number of inputs.
 */
const decomposeString = (value: string, length: number): string[] => {
    let arr = value.split('').slice(0, length).map((v) => (ValidationUtils.isNumeric(v) ? v : CONST.MAGIC_CODE_EMPTY_CHAR))
    if (arr.length < length) {
        arr = arr.concat(Array(length - arr.length).fill(CONST.MAGIC_CODE_EMPTY_CHAR));
    }
    return arr;
};

/**
 * Converts an array of strings into a single string. If there are undefined or
 * empty values, it will replace them with a space.
 */
const composeToString = (value: string[]): string => value.map((v) => (v === undefined || v === '' ? CONST.MAGIC_CODE_EMPTY_CHAR : v)).join('');

const getInputPlaceholderSlots = (length: number): number[] => Array.from(Array(length).keys());

function MagicCodeInput({
    value = '',
    name = '',
    autoFocus = true,
    shouldDelayFocus = false,
    errorText = '',
    shouldSubmitOnComplete = true,
    onChangeText: onChangeTextProp = () => {},
    onFulfill = () => {},
    hasError = false,
    maxLength = CONST.MAGIC_CODE_LENGTH,
    isDisableKeyboard = false,
    lastPressedDigit = '',
    autoComplete,
}: MagicCodeInputProps, ref: ForwardedRef<unknown>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const inputRefs = useRef<RNTextInput | null>();
    const [input, setInput] = useState(TEXT_INPUT_EMPTY_STATE);
    const [focusedIndex, setFocusedIndex] = useState<number | undefined>(0);
    const [editIndex, setEditIndex] = useState<number | undefined>(0);
    const [wasSubmitted, setWasSubmitted] = useState(false);
    const shouldFocusLast = useRef(false);
    const inputWidth = useRef(0);
    const lastFocusedIndex = useRef<number | undefined>(0);
    const lastValue = useRef<number | string>(TEXT_INPUT_EMPTY_STATE);

    console.log("** I RENDER **")

    useEffect(() => {
        lastValue.current = input.length;
    }, [input]);

    const blurMagicCodeInput = () => {
        inputRefs.current?.blur();
        setFocusedIndex(undefined);
    };

    const focusMagicCodeInput = () => {
        setFocusedIndex(0);
        lastFocusedIndex.current = 0;
        setEditIndex(0);
        inputRefs.current?.focus();
    };

    const setInputAndIndex = (index: number | undefined) => {
        setInput(TEXT_INPUT_EMPTY_STATE);
        setFocusedIndex(index);
        setEditIndex(index);
    };

    useImperativeHandle(ref, () => ({
        focus() {
            focusMagicCodeInput();
        },
        focusLastSelected() {
            inputRefs.current?.focus();
        },
        resetFocus() {
            setInput(TEXT_INPUT_EMPTY_STATE);
            focusMagicCodeInput();
        },
        clear() {
            lastFocusedIndex.current = 0;
            setInputAndIndex(0);
            inputRefs.current?.focus();
            onChangeTextProp('');
        },
        blur() {
            blurMagicCodeInput();
        },
    }));

    const validateAndSubmit = () => {
        const numbers = decomposeString(value, maxLength);
        if (wasSubmitted || !shouldSubmitOnComplete || numbers.filter((n) => ValidationUtils.isNumeric(n)).length !== maxLength || isOffline) {
            return;
        }
        if (!wasSubmitted) {
            setWasSubmitted(true);
        }
        // Blurs the input and removes focus from the last input and, if it should submit
        // on complete, it will call the onFulfill callback.
        blurMagicCodeInput();
        onFulfill(value);
        lastValue.current = '';
    };

    const {isOffline} = useNetwork({onReconnect: validateAndSubmit});

    useEffect(() => {
        validateAndSubmit();

        // We have not added:
        // + the editIndex as the dependency because we don't want to run this logic after focusing on an input to edit it after the user has completed the code.
        // + the onFulfill as the dependency because onFulfill is changed when the preferred locale changed => avoid auto submit form when preferred locale changed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, shouldSubmitOnComplete]);

    /**
     * Focuses on the input when it is pressed.
     *
     * @param event
     * @param index
     */
    const onFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
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
     * @param index
     */
    const onPress = (index: number) => {
        shouldFocusLast.current = false;
        // TapGestureHandler works differently on mobile web and native app
        // On web gesture handler doesn't block interactions with textInput below so there is no need to run `focus()` manually
        if (!Browser.isMobileChrome() && !Browser.isMobileSafari()) {
            inputRefs.current?.focus();
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
     * @param value
     */
    const onChangeText = (val: string) => {
        console.log('ON CHANGE', val)
        if (!val || !ValidationUtils.isNumeric(val)) {
            return;
        }

        // Checks if one new character was added, or if the content was replaced
        const hasToSlice = val.length - 1 === lastValue.current.length && val.slice(0, val.length - 1) === lastValue.current;

        // Gets the new value added by the user
        const addedValue = hasToSlice ? val.slice(lastValue.current.length, val.length) : val;

        lastValue.current = val;
        // Updates the focused input taking into consideration the last input
        // edited and the number of digits added by the user.
        const numbersArr = addedValue
            .trim()
            .split('')
            .slice(0, maxLength - editIndex);
        const updatedFocusedIndex = Math.min(editIndex + (numbersArr.length - 1) + 1, maxLength - 1);

        let numbers = decomposeString(val, maxLength);
        numbers = [...numbers.slice(0, editIndex), ...numbersArr, ...numbers.slice(numbersArr.length + editIndex, maxLength)];

        setInputAndIndex(updatedFocusedIndex);

        const finalInput = composeToString(numbers);
        onChangeTextProp(finalInput);
    };

    /**
     * Handles logic related to certain key presses.
     *
     * NOTE: when using Android Emulator, this can only be tested using
     * hardware keyboard inputs.
     *
     * @param event
     */
    const onKeyPress = ({nativeEvent: {key: keyValue}}) => {
        if (keyValue === 'Backspace' || keyValue === '<') {
            let numbers = decomposeString(value, maxLength);

            // If keyboard is disabled and no input is focused we need to remove
            // the last entered digit and focus on the correct input
            if (isDisableKeyboard && focusedIndex === undefined) {
                const indexBeforeLastEditIndex = editIndex === 0 ? editIndex : editIndex - 1;

                const indexToFocus = numbers[editIndex] === CONST.MAGIC_CODE_EMPTY_CHAR ? indexBeforeLastEditIndex : editIndex;
                inputRefs.current[indexToFocus].focus();
                onChangeTextProp(value.substring(0, indexToFocus));

                return;
            }

            // If the currently focused index already has a value, it will delete
            // that value but maintain the focus on the same input.
            if (numbers[focusedIndex] !== CONST.MAGIC_CODE_EMPTY_CHAR) {
                setInput(TEXT_INPUT_EMPTY_STATE);
                numbers = [...numbers.slice(0, focusedIndex), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex + 1, maxLength)];
                setEditIndex(focusedIndex);
                onChangeTextProp(composeToString(numbers));
                return;
            }

            const hasInputs = numbers.filter((n) => ValidationUtils.isNumeric(n)).length !== 0

            // Fill the array with empty characters if there are no inputs.
            if (focusedIndex === 0 && !hasInputs) {
                numbers = Array(maxLength).fill(CONST.MAGIC_CODE_EMPTY_CHAR);

                // Deletes the value of the previous input and focuses on it.
            } else if (focusedIndex !== 0) {
                numbers = [...numbers.slice(0, Math.max(0, focusedIndex - 1)), CONST.MAGIC_CODE_EMPTY_CHAR, ...numbers.slice(focusedIndex, maxLength)];
            }

            const newFocusedIndex = Math.max(0, focusedIndex - 1);

            // Saves the input string so that it can compare to the change text
            // event that will be triggered, this is a workaround for mobile that
            // triggers the change text on the event after the key press.
            setInputAndIndex(newFocusedIndex);
            onChangeTextProp(composeToString(numbers));

            if (newFocusedIndex !== undefined) {
                inputRefs.current?.focus();
            }
        }
        if (keyValue === 'ArrowLeft' && focusedIndex !== undefined) {
            const newFocusedIndex = Math.max(0, focusedIndex - 1);
            setInputAndIndex(newFocusedIndex);
            inputRefs.current?.focus();
        } else if (keyValue === 'ArrowRight' && focusedIndex !== undefined) {
            const newFocusedIndex = Math.min(focusedIndex + 1, maxLength - 1);
            setInputAndIndex(newFocusedIndex);
            inputRefs.current?.focus();
        } else if (keyValue === 'Enter') {
            // We should prevent users from submitting when it's offline.
            if (isOffline) {
                return;
            }
            setInput(TEXT_INPUT_EMPTY_STATE);
            onFulfill(value);
        }
    };

    /**
     *  If isDisableKeyboard is true we will have to call onKeyPress and onChangeText manually
     *  as the press on digit pad will not trigger native events. We take lastPressedDigit from props
     *  as it stores the last pressed digit pressed on digit pad. We take only the first character
     *  as anything after that is added to differentiate between two same digits passed in a row.
     */

    useEffect(() => {
        if (!isDisableKeyboard) {
            return;
        }

        const val = lastPressedDigit.charAt(0);
        onKeyPress({nativeEvent: {key: val}});
        onChangeText(val);

        // We have not added:
        // + the onChangeText and onKeyPress as the dependencies because we only want to run this when lastPressedDigit changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastPressedDigit, isDisableKeyboard]);

    return (
        <>
            <View style={[styles.magicCodeInputContainer]}>
                <TapGestureHandler
                    onBegan={(e: HandlerStateChangeEvent) => {
                        onPress(Math.floor(e.nativeEvent.x / (inputWidth.current / maxLength)));
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
                            ref={(inputRef) => (inputRefs.current = inputRef)}
                            autoFocus={autoFocus}
                            inputMode="numeric"
                            textContentType="oneTimeCode"
                            name={name}
                            maxLength={maxLength}
                            value={input}
                            hideFocusedState
                            autoComplete={input.length === 0 && autoComplete}
                            shouldDelayFocus={input.length === 0 && shouldDelayFocus}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            onChangeText={(text: string) => {
                                onChangeText(text);
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
                            role={CONST.ROLE.FORM}
                            style={[styles.inputTransparent]}
                            textInputContainerStyles={[styles.borderNone]}
                        />
                    </View>
                </TapGestureHandler>
                {getInputPlaceholderSlots(maxLength).map((index) => (
                    <View
                        key={index}
                        style={maxLength === CONST.MAGIC_CODE_LENGTH ? [styles.w15] : [styles.flex1, index !== 0 && styles.ml3]}
                    >
                        <View
                            style={[
                                styles.textInputContainer,
                                StyleUtils.getHeightOfMagicCodeInput(),
                                hasError || errorText ? styles.borderColorDanger : {},
                                focusedIndex === index ? styles.borderColorFocus : {},
                            ]}
                        >
                            <Text style={[styles.magicCodeInput, styles.textAlignCenter]}>{decomposeString(value, maxLength)[index] || ''}</Text>
                        </View>
                    </View>
                ))}
            </View>
            {errorText && (
                <FormHelpMessage
                    isError
                    message={errorText}
                />
            )}
        </>
    );
}

MagicCodeInput.displayName = 'MagicCodeInput';

export default forwardRef(MagicCodeInput);
