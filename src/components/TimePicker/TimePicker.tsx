import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent, NativeSyntheticEvent} from 'react-native';
import type {TextInput} from 'react-native-gesture-handler';
import AmountTextInput from '@components/AmountTextInput';
import BigNumberPad from '@components/BigNumberPad';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import setCursorPosition from './setCursorPosition';

type MinuteHourRefs = {hourRef: TextInput | null; minuteRef: TextInput | null};

type TimePickerProps = {
    /** Default value for the inputs */
    defaultValue?: string;

    /** Callback to call when the Save button is pressed  */
    onSubmit: (timeString: string) => void;

    /** Callback to call when the input changes */
    onInputChange?: (timeString: string) => void;
};

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

/**
 * Replace the sub-string of the given string with the provided value
 * @param originalString - the string that will be modified
 * @param newSubstring - the replacement string
 * @param from - the start index of the sub-string to replace
 * @param to - the end index of the sub-string to replace
 *
 * @returns - the modified string with the range (from, to) replaced with the provided value
 */
function insertAtPosition(originalString: string, newSubstring: string, from: number, to: number): string {
    // Check for invalid positions
    if (from < 0 || to < 0 || from > originalString.length || to > originalString.length) {
        return originalString;
    }

    /*
     If the positions are the same, it means we're inserting at a point.
     If the insertion point is at the end, simply return the original string.
    */
    if (from === to && from === originalString.length) {
        return originalString;
    }

    // Replace the selected range
    return originalString.slice(0, from) + newSubstring + originalString.slice(to);
}

/**
 * Replace the sub-string of the given string with zeros
 * @param originalString - the string that will be modified
 * @param from - the start index of the sub-string to replace
 * @param to - the end index of the sub-string to replace
 *
 * @returns - the modified string with the range (from, to) replaced with zeros
 */
function replaceRangeWithZeros(originalString: string, from: number, to: number): string {
    const normalizedFrom = Math.max(from, 0);
    const normalizedTo = Math.min(to, 2);
    const replacement = '0'.repeat(normalizedTo - normalizedFrom);
    return `${originalString.slice(0, normalizedFrom)}${replacement}${originalString.slice(normalizedTo)}`;
}

/**
 * Clear the value under selection of an input (either hours or minutes) by replacing it with zeros
 *
 * @param value - current value of the input
 * @param selection - current selection of the input
 * @param setValue - the function that modifies the value of the input
 * @param setSelection - the function that modifies the selection of the input
 */
function clearSelectedValue(value: string, selection: {start: number; end: number}, setValue: (value: string) => void, setSelection: (value: {start: number; end: number}) => void) {
    let newValue;
    let newCursorPosition;

    if (selection.start !== selection.end) {
        newValue = replaceRangeWithZeros(value, selection.start, selection.end);
        newCursorPosition = selection.start;
    } else {
        const positionBeforeSelection = Math.max(selection.start - 1, 0);
        newValue = replaceRangeWithZeros(value, positionBeforeSelection, selection.start);
        newCursorPosition = positionBeforeSelection;
    }

    setValue(newValue);
    setSelection({start: newCursorPosition, end: newCursorPosition});
}

function TimePicker({defaultValue = '', onSubmit, onInputChange = () => {}}: TimePickerProps, ref: ForwardedRef<MinuteHourRefs>) {
    const {numberFormat, translate} = useLocalize();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const value = DateUtils.extractTime12Hour(defaultValue);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const [isError, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectionHour, setSelectionHour] = useState({start: 0, end: 0});
    const [selectionMinute, setSelectionMinute] = useState({start: 2, end: 2}); // we focus it by default so need  to have selection on the end
    const [hours, setHours] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).hour);
    const [minutes, setMinutes] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).minute);
    const [amPmValue, setAmPmValue] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).period);

    const lastPressedKey = useRef('');
    const hourInputRef = useRef<TextInput | null>(null);
    const minuteInputRef = useRef<TextInput | null>(null);

    const {inputCallbackRef} = useAutoFocusInput();

    const focusMinuteInputOnFirstCharacter = useCallback(() => setCursorPosition(0, minuteInputRef, setSelectionMinute), []);
    const focusHourInputOnLastCharacter = useCallback(() => setCursorPosition(2, hourInputRef, setSelectionHour), []);

    const validate = useCallback(
        (time: string) => {
            const timeString = time || `${hours}:${minutes} ${amPmValue}`;
            const [hourStr] = timeString.split(/[:\s]+/);
            const hour = parseInt(hourStr, 10);
            if (hour === 0) {
                setError(true);
                setErrorMessage(translate('common.error.invalidTimeRange'));
                return false;
            }
            const isValid = DateUtils.isTimeAtLeastOneMinuteInFuture({timeString, dateTimeString: defaultValue});
            setError(!isValid);
            setErrorMessage(translate('common.error.invalidTimeShouldBeFuture'));
            return isValid;
        },
        [hours, minutes, amPmValue, defaultValue, translate],
    );

    const resetHours = () => {
        setHours('00');
        setSelectionHour({start: 0, end: 0});
    };

    const resetMinutes = () => {
        setMinutes('00');
        setSelectionMinute({start: 0, end: 0});
    };

    // This function receive value from hour input and validate it
    // The valid format is HH(from 00 to 12). If the user input 9, it will be 09. If user try to change 09 to 19 it would skip the first character
    const handleHourChange = (text: string) => {
        // Replace spaces with 0 to implement the following digit removal by pressing space
        const trimmedText = text.replace(/ /g, '0');
        if (!trimmedText) {
            resetHours();
            return;
        }

        const isOnlyNumericValue = /^\d+$/.test(trimmedText);
        if (!isOnlyNumericValue) {
            return;
        }

        let newHour;
        let newSelection;

        if (selectionHour.start === 0 && selectionHour.end === 0) {
            // The cursor is at the start of hours
            const firstDigit = trimmedText[0];
            const secondDigit = trimmedText[2] || '0';

            if (trimmedText.length === 1) {
                // To support the forward-removal using Delete key
                newHour = `0${firstDigit}`;
                newSelection = 1;
            } else if (Number(firstDigit) <= 1) {
                /*
                 The first entered digit is 0 or 1.
                 If the first digit is 0, we can safely append the second digit.
                 If the first digit is 1, we must check the second digit to ensure it is not greater than 2, amd replace it with 0 otherwise.
                */
                newHour = `${firstDigit}${firstDigit === '1' && Number(secondDigit) > 2 ? 0 : secondDigit}`;
                newSelection = 1;
            } else {
                // The first entered digit is 2-9. We should replace the whole value by prepending 0 to the entered digit.
                newHour = `0${firstDigit}`;
                newSelection = 2;
            }
        } else if (selectionHour.start === 1 && selectionHour.end === 1) {
            // The cursor is in-between the digits
            if (trimmedText.length === 1 && lastPressedKey.current === 'Backspace') {
                // We have removed the first digit. Replace it with 0 and move the cursor to the start.
                newHour = `0${trimmedText}`;
                newSelection = 0;
            } else {
                newHour = `${trimmedText[0]}${trimmedText[1] || 0}`;
                newSelection = 2;
            }
        } else if (selectionHour.start === 0 && selectionHour.end === 1) {
            // There is an active selection of the first digit
            newHour = trimmedText.substring(0, 2).padStart(2, '0');
            newSelection = trimmedText.length === 1 ? 0 : 1;
        } else if (selectionHour.start === 1 && selectionHour.end === 2) {
            // There is an active selection of the second digit
            newHour = trimmedText.substring(0, 2).padEnd(2, '0');
            newSelection = trimmedText.length === 1 ? 1 : 2;
        } else if (trimmedText.length === 1 && Number(trimmedText) <= 1) {
            /*
             The trimmed text is either 0 or 1.
             We are either replacing hours with a single digit, or removing the last digit.
             In both cases, we should append 0 to the remaining value.
             Note: we must check the length of the filtered text to avoid incorrectly handling e.g. "01" as "1".
            */
            newHour = `${trimmedText}0`;
            newSelection = 1;
        } else {
            newHour = trimmedText.substring(0, 2).padStart(2, '0');
            newSelection = 2;
        }

        const newHourNumber = Number(newHour);
        if (newHourNumber > 24) {
            newHour = hours;
        } else if (newHourNumber > 12) {
            newHour = String(newHourNumber - 12).padStart(2, '0');
            setAmPmValue(CONST.TIME_PERIOD.PM);
        }

        setHours(newHour);
        setSelectionHour({start: newSelection, end: newSelection});
        if (newSelection === 2) {
            focusMinuteInputOnFirstCharacter();
        }
    };

    /*
     This function receives value from the minutes input and validates it.
     The valid format is MM(from 00 to 59). If the user enters 9, it will be prepended to 09. If the user tries to change 09 to 99, it would skip the character
    */
    const handleMinutesChange = (text: string) => {
        // Replace spaces with 0 to implement the following digit removal by pressing space
        const trimmedText = text.replace(/ /g, '0');
        if (!trimmedText) {
            resetMinutes();
            return;
        }

        const isOnlyNumericValue = /^\d+$/.test(trimmedText);
        if (!isOnlyNumericValue) {
            return;
        }

        let newMinute;
        let newSelection;

        if (selectionMinute.start === 0 && selectionMinute.end === 0) {
            // The cursor is at the start of minutes
            const firstDigit = trimmedText[0];
            if (trimmedText.length === 1) {
                // To support the forward-removal using Delete key
                newMinute = `0${firstDigit}`;
                newSelection = 1;
            } else if (Number(firstDigit) <= 5) {
                // The first entered digit is 0-5, we can safely append the second digit.
                newMinute = `${firstDigit}${trimmedText[2] || 0}`;
                newSelection = 1;
            } else {
                // The first entered digit is 6-9. We should replace the whole value by prepending 0 to the entered digit.
                newMinute = `0${firstDigit}`;
                newSelection = 2;
            }
        } else if (selectionMinute.start === 1 && selectionMinute.end === 1) {
            // The cursor is in-between the digits
            if (trimmedText.length === 1 && lastPressedKey.current === 'Backspace') {
                // We have removed the first digit. Replace it with 0 and move the cursor to the start.
                newMinute = `0${trimmedText}`;
                newSelection = 0;
            } else {
                newMinute = `${trimmedText[0]}${trimmedText[1] || 0}`;
                newSelection = 2;
            }
        } else if (selectionMinute.start === 0 && selectionMinute.end === 1) {
            // There is an active selection of the first digit
            newMinute = trimmedText.substring(0, 2).padStart(2, '0');
            newSelection = trimmedText.length === 1 ? 0 : 1;
        } else if (selectionMinute.start === 1 && selectionMinute.end === 2) {
            // There is an active selection of the second digit
            newMinute = trimmedText.substring(0, 2).padEnd(2, '0');
            newSelection = trimmedText.length === 1 ? 1 : 2;
        } else if (trimmedText.length === 1 && Number(trimmedText) <= 5) {
            /*
             The trimmed text is from 0 to 5.
             We are either replacing minutes with a single digit, or removing the last digit.
             In both cases, we should append 0 to the remaining value.
             Note: we must check the length of the filtered text to avoid incorrectly handling e.g. "01" as "1"
            */
            newMinute = `${trimmedText}0`;
            newSelection = 1;
        } else {
            newMinute = trimmedText.substring(0, 2).padStart(2, '0');
            newSelection = 2;
        }

        if (Number(newMinute) > 59) {
            newMinute = minutes;
        }

        setMinutes(newMinute);
        setSelectionMinute({start: newSelection, end: newSelection});
    };

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     */
    const updateAmountNumberPad = useCallback(
        (key: string) => {
            const isHourFocused = hourInputRef.current?.isFocused();
            const isMinuteFocused = minuteInputRef.current?.isFocused();
            if (!isHourFocused && !isMinuteFocused) {
                minuteInputRef.current?.focus();
            }

            if (key === '.') {
                return;
            }
            if (key === '<' || key === 'Backspace') {
                if (isHourFocused) {
                    clearSelectedValue(hours, selectionHour, setHours, setSelectionHour);
                } else if (isMinuteFocused) {
                    if (selectionMinute.start === 0 && selectionMinute.end === 0) {
                        focusHourInputOnLastCharacter();
                        return;
                    }

                    clearSelectedValue(minutes, selectionMinute, setMinutes, setSelectionMinute);
                }
                return;
            }
            const trimmedKey = key.replace(/[^0-9]/g, '');

            if (isHourFocused) {
                handleHourChange(insertAtPosition(hours, trimmedKey, selectionHour.start, selectionHour.end));
            } else if (isMinuteFocused) {
                handleMinutesChange(insertAtPosition(minutes, trimmedKey, selectionMinute.start, selectionMinute.end));
            }
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [minutes, hours, selectionMinute, selectionHour],
    );

    useEffect(() => {
        // we implement this to ensure the hour input focuses on the first character upon initial focus
        // https://github.com/facebook/react-native/issues/20214
        setSelectionHour({start: 0, end: 0});
    }, []);

    const arrowConfig = useMemo(
        () => ({
            shouldPreventDefault: false,
        }),
        [],
    );

    const arrowLeftCallback = useCallback(
        (e?: GestureResponderEvent | KeyboardEvent) => {
            const isMinuteFocused = minuteInputRef.current?.isFocused();
            if (isMinuteFocused && selectionMinute.start === 0) {
                // Check e to be truthy to avoid crashing on Android (e is undefined there)
                e?.preventDefault();
                focusHourInputOnLastCharacter();
            }
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [selectionHour, selectionMinute],
    );
    const arrowRightCallback = useCallback(
        (e?: GestureResponderEvent | KeyboardEvent) => {
            const isHourFocused = hourInputRef.current?.isFocused();

            if (isHourFocused && selectionHour.start === 2) {
                // Check e to be truthy to avoid crashing on Android (e is undefined there)
                e?.preventDefault();
                focusMinuteInputOnFirstCharacter();
            }
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [selectionHour, selectionMinute],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT, arrowLeftCallback, arrowConfig);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT, arrowRightCallback, arrowConfig);

    const handleFocusOnBackspace = useCallback(
        (e: NativeSyntheticEvent<KeyboardEvent>) => {
            if (selectionMinute.start !== 0 || selectionMinute.end !== 0 || e.nativeEvent.key !== 'Backspace') {
                return;
            }
            e.preventDefault();
            focusHourInputOnLastCharacter();
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [selectionMinute.start, selectionMinute.end, focusHourInputOnLastCharacter],
    );

    const {styleForAM, styleForPM} = StyleUtils.getStatusAMandPMButtonStyle(amPmValue);

    const numberPad = useCallback(() => {
        if (!canUseTouchScreen) {
            return null;
        }
        return (
            <BigNumberPad
                id={NUM_PAD_VIEW_ID}
                numberPressed={updateAmountNumberPad}
                isLongPressDisabled
            />
        );
    }, [canUseTouchScreen, updateAmountNumberPad]);

    useEffect(() => {
        onInputChange(`${hours}:${minutes} ${amPmValue}`);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [hours, minutes, amPmValue]);

    const handleSubmit = () => {
        const time = `${hours}:${minutes} ${amPmValue}`;
        const isValid = validate(time);

        if (isValid) {
            onSubmit(time);
        }
    };

    return (
        <View style={styles.flex1}>
            <View style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <View
                    nativeID={AMOUNT_VIEW_ID}
                    style={[styles.flexRow, styles.w100, styles.justifyContentCenter, styles.timePickerInputsContainer, styles.mb8]}
                >
                    <AmountTextInput
                        placeholder={numberFormat(0)}
                        formattedAmount={hours}
                        onKeyPress={(e) => {
                            lastPressedKey.current = e.nativeEvent.key;
                        }}
                        onChangeAmount={handleHourChange}
                        ref={(textInputRef) => {
                            if (typeof ref === 'function') {
                                ref({hourRef: textInputRef as TextInput | null, minuteRef: minuteInputRef.current});
                            } else if (ref && 'current' in ref) {
                                // eslint-disable-next-line no-param-reassign
                                ref.current = {hourRef: textInputRef as TextInput | null, minuteRef: minuteInputRef.current};
                            }
                            // eslint-disable-next-line react-compiler/react-compiler
                            hourInputRef.current = textInputRef as TextInput | null;
                        }}
                        onSelectionChange={(e) => {
                            setSelectionHour(e.nativeEvent.selection);
                        }}
                        style={[styles.iouAmountTextInput, styles.timePickerInput]}
                        containerStyle={[styles.iouAmountTextInputContainer]}
                        touchableInputWrapperStyle={styles.timePickerHeight100}
                        selection={selectionHour}
                    />
                    <Text style={styles.timePickerSemiDot}>{CONST.COLON}</Text>
                    <AmountTextInput
                        placeholder={numberFormat(0)}
                        formattedAmount={minutes}
                        onKeyPress={(e) => {
                            lastPressedKey.current = e.nativeEvent.key;
                            handleFocusOnBackspace(e);
                        }}
                        onChangeAmount={handleMinutesChange}
                        ref={(textInputRef) => {
                            if (typeof ref === 'function') {
                                ref({hourRef: hourInputRef.current, minuteRef: textInputRef as TextInput | null});
                            } else if (ref && 'current' in ref) {
                                // eslint-disable-next-line no-param-reassign
                                ref.current = {hourRef: hourInputRef.current, minuteRef: textInputRef as TextInput | null};
                            }
                            minuteInputRef.current = textInputRef as TextInput | null;
                            inputCallbackRef(textInputRef as TextInput | null);
                        }}
                        onSelectionChange={(e) => {
                            setSelectionMinute(e.nativeEvent.selection);
                        }}
                        style={[styles.iouAmountTextInput, styles.timePickerInput]}
                        containerStyle={[styles.iouAmountTextInputContainer]}
                        touchableInputWrapperStyle={styles.timePickerHeight100}
                        selection={selectionMinute}
                    />
                </View>
                <View style={styles.timePickerSwitcherContainer}>
                    <Button
                        shouldEnableHapticFeedback
                        innerStyles={styleForAM}
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        text={translate('common.am')}
                        onLongPress={() => {}}
                        onPress={() => {
                            setAmPmValue(CONST.TIME_PERIOD.AM);
                        }}
                        onPressOut={() => {}}
                        onMouseDown={(e) => e.preventDefault()}
                    />
                    <Button
                        shouldEnableHapticFeedback
                        innerStyles={[styleForPM, styles.ml1]}
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        text={translate('common.pm')}
                        onLongPress={() => {}}
                        onPress={() => {
                            setAmPmValue(CONST.TIME_PERIOD.PM);
                        }}
                        onPressOut={() => {}}
                        onMouseDown={(e) => e.preventDefault()}
                    />
                </View>
            </View>
            {isError ? (
                <FormHelpMessage
                    isError={isError}
                    message={errorMessage}
                    style={[styles.ph5]}
                />
            ) : (
                <View style={styles.formHelperMessage} />
            )}
            <View
                style={[styles.numberPadWrapper, styles.pb4]}
                nativeID={NUM_PAD_CONTAINER_VIEW_ID}
            >
                {numberPad()}
            </View>
            <Button
                success
                medium={isExtraSmallScreenHeight}
                large={!isExtraSmallScreenHeight}
                style={[styles.mb5, styles.mh5]}
                onPress={handleSubmit}
                pressOnEnter
                text={translate('common.save')}
            />
        </View>
    );
}

TimePicker.displayName = 'TimePicker';

export default React.forwardRef(TimePicker);
