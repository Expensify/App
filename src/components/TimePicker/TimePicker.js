import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import AmountTextInput from '@components/AmountTextInput';
import BigNumberPad from '@components/BigNumberPad';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import refPropTypes from '@components/refPropTypes';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import setCursorPosition from './setCursorPosition';

const propTypes = {
    /** Refs forwarded to the TextInputWithCurrencySymbol */
    forwardedRef: refPropTypes,

    /** Default value for the inputs */
    defaultValue: PropTypes.string,

    /** Callback to call when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,
};

const defaultProps = {
    forwardedRef: null,
    onInputChange: () => {},
    defaultValue: '',
};

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

/**
 * Replace the sub-string of the given string with the provided value
 * @param {String} originalString - the string that will be modified
 * @param {String} newSubstring - the replacement string
 * @param {Number} from - the start index of the sub-string to replace
 * @param {Number} to - the end index of the sub-string to replace
 *
 * @returns {String} - the modified string with the range (from, to) replaced with the provided value
 */
function insertAtPosition(originalString, newSubstring, from, to) {
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
 * @param {String} originalString - the string that will be modified
 * @param {Number} from - the start index of the sub-string to replace
 * @param {Number} to - the end index of the sub-string to replace
 *
 * @returns {String} - the modified string with the range (from, to) replaced with zeros
 */
function replaceRangeWithZeros(originalString, from, to) {
    const normalizedFrom = Math.max(from, 0);
    const normalizedTo = Math.min(to, 2);
    const replacement = '0'.repeat(normalizedTo - normalizedFrom);
    return `${originalString.slice(0, normalizedFrom)}${replacement}${originalString.slice(normalizedTo)}`;
}

/**
 * Clear the value under selection of an input (either hours or minutes) by replacing it with zeros
 * @param {String} value - current value of the input
 * @param {Object} selection - current selection of the input
 * @param {Function} setValue - the function that modifies the value of the input
 * @param {Function} setSelection - the function that modifies the selection of the input
 */
function clearSelectedValue(value, selection, setValue, setSelection) {
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

function TimePicker({forwardedRef, defaultValue, onSubmit, onInputChange}) {
    const {numberFormat, translate} = useLocalize();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const value = DateUtils.extractTime12Hour(defaultValue);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const [isError, setError] = useState(false);
    const [selectionHour, setSelectionHour] = useState({start: 0, end: 0});
    const [selectionMinute, setSelectionMinute] = useState({start: 2, end: 2}); // we focus it by default so need  to have selection on the end
    const [hours, setHours] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).hour);
    const [minutes, setMinutes] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).minute);
    const [amPmValue, setAmPmValue] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).period);

    const lastPressedKey = useRef('');
    const hourInputRef = useRef(null);
    const minuteInputRef = useRef(null);

    const {inputCallbackRef} = useAutoFocusInput();

    const focusMinuteInputOnFirstCharacter = useCallback(() => setCursorPosition(0, minuteInputRef, setSelectionMinute), []);
    const focusHourInputOnLastCharacter = useCallback(() => setCursorPosition(2, hourInputRef, setSelectionHour), []);

    const validate = useCallback(
        (time) => {
            const isValid = DateUtils.isTimeAtLeastOneMinuteInFuture({timeString: time || `${hours}:${minutes} ${amPmValue}`, dateTimeString: defaultValue});
            setError(!isValid);
            return isValid;
        },
        [hours, minutes, amPmValue, defaultValue],
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
    const handleHourChange = (text) => {
        // Replace spaces with 0 to implement the following digit removal by pressing space
        const trimmedText = text.replace(/ /g, '0');
        if (_.isEmpty(trimmedText)) {
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
            } else if (firstDigit <= 1) {
                /*
                 The first entered digit is 0 or 1.
                 If the first digit is 0, we can safely append the second digit.
                 If the first digit is 1, we must check the second digit to ensure it is not greater than 2, amd replace it with 0 otherwise.
                */
                newHour = `${firstDigit}${firstDigit === '1' && secondDigit > 2 ? 0 : secondDigit}`;
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
        } else if (trimmedText.length === 1 && trimmedText <= 1) {
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

        if (newHour > 24) {
            newHour = hours;
        } else if (newHour > 12) {
            newHour = String(newHour - 12).padStart(2, '0');
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
    const handleMinutesChange = (text) => {
        // Replace spaces with 0 to implement the following digit removal by pressing space
        const trimmedText = text.replace(/ /g, '0');
        if (_.isEmpty(trimmedText)) {
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
            } else if (firstDigit <= 5) {
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
        } else if (trimmedText.length === 1 && trimmedText <= 5) {
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

        if (newMinute > 59) {
            newMinute = minutes;
        }

        setMinutes(newMinute);
        setSelectionMinute({start: newSelection, end: newSelection});
    };

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    const updateAmountNumberPad = useCallback(
        (key) => {
            const isHourFocused = hourInputRef.current.isFocused();
            const isMinuteFocused = minuteInputRef.current.isFocused();
            if (!isHourFocused && !isMinuteFocused) {
                minuteInputRef.current.focus();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        (e) => {
            const isMinuteFocused = minuteInputRef.current.isFocused();
            if (isMinuteFocused && selectionMinute.start === 0) {
                if (e) {
                    // Check e to be truthy to avoid crashing on Android (e is undefined there)
                    e.preventDefault();
                }
                focusHourInputOnLastCharacter();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionHour, selectionMinute],
    );
    const arrowRightCallback = useCallback(
        (e) => {
            const isHourFocused = hourInputRef.current.isFocused();

            if (isHourFocused && selectionHour.start === 2) {
                if (e) {
                    // Check e to be truthy to avoid crashing on Android (e is undefined there)
                    e.preventDefault();
                }
                focusMinuteInputOnFirstCharacter();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionHour, selectionMinute],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT, arrowLeftCallback, arrowConfig);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT, arrowRightCallback, arrowConfig);

    const handleFocusOnBackspace = useCallback(
        (e) => {
            if (selectionMinute.start !== 0 || selectionMinute.end !== 0 || e.key !== 'Backspace') {
                return;
            }
            e.preventDefault();
            focusHourInputOnLastCharacter();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionMinute.start, selectionMinute.end, focusHourInputOnLastCharacter],
    );

    const {styleForAM, styleForPM} = StyleUtils.getStatusAMandPMButtonStyle(amPmValue);

    const numberPad = useCallback(() => {
        if (!canUseTouchScreen) {
            return null;
        }
        return (
            <BigNumberPad
                nativeID={NUM_PAD_VIEW_ID}
                numberPressed={updateAmountNumberPad}
                isLongPressDisabled
            />
        );
    }, [canUseTouchScreen, updateAmountNumberPad]);

    useEffect(() => {
        onInputChange(`${hours}:${minutes} ${amPmValue}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        maxLength={2}
                        formattedAmount={hours}
                        onKeyPress={(e) => {
                            lastPressedKey.current = e.nativeEvent.key;
                        }}
                        onChangeAmount={handleHourChange}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(ref) => {
                            if (typeof forwardedRef === 'function') {
                                forwardedRef({refHour: ref, minuteRef: minuteInputRef.current});
                            } else if (forwardedRef && _.has(forwardedRef, 'current')) {
                                // eslint-disable-next-line no-param-reassign
                                forwardedRef.current = {hourRef: ref, minuteRef: minuteInputRef.current};
                            }
                            hourInputRef.current = ref;
                        }}
                        onSelectionChange={(e) => {
                            setSelectionHour(e.nativeEvent.selection);
                        }}
                        style={styles.timePickerInput}
                        touchableInputWrapperStyle={styles.timePickerHeight100}
                        selection={selectionHour}
                        showSoftInputOnFocus={false}
                    />
                    <Text style={styles.timePickerSemiDot}>{CONST.COLON}</Text>
                    <AmountTextInput
                        placeholder={numberFormat(0)}
                        maxLength={2}
                        formattedAmount={minutes}
                        onKeyPress={(e) => {
                            lastPressedKey.current = e.nativeEvent.key;
                            handleFocusOnBackspace(e);
                        }}
                        onChangeAmount={handleMinutesChange}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(ref) => {
                            if (typeof forwardedRef === 'function') {
                                forwardedRef({refHour: hourInputRef.current, minuteRef: ref});
                            } else if (forwardedRef && _.has(forwardedRef, 'current')) {
                                // eslint-disable-next-line no-param-reassign
                                minuteInputRef.current = {hourRef: hourInputRef.current, minuteInputRef: ref};
                            }
                            minuteInputRef.current = ref;
                            inputCallbackRef(ref);
                        }}
                        onSelectionChange={(e) => {
                            setSelectionMinute(e.nativeEvent.selection);
                        }}
                        style={styles.timePickerInput}
                        touchableInputWrapperStyle={styles.timePickerHeight100}
                        selection={selectionMinute}
                        showSoftInputOnFocus={false}
                    />
                </View>
                <View style={styles.timePickerSwitcherContainer}>
                    <Button
                        shouldEnableHapticFeedback
                        innerStyles={styleForAM}
                        medium={isExtraSmallScreenHeight}
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
                        innerStyles={[...styleForPM, styles.ml1]}
                        medium={isExtraSmallScreenHeight}
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
                    message={translate('common.error.invalidTimeShouldBeFuture')}
                    style={styles.pl5}
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
                style={[styles.mb5, styles.mh5]}
                onPress={handleSubmit}
                pressOnEnter
                text={translate('common.save')}
            />
        </View>
    );
}

TimePicker.propTypes = propTypes;
TimePicker.defaultProps = defaultProps;
TimePicker.displayName = 'TimePicker';

const TimePickerWithRef = React.forwardRef((props, ref) => (
    <TimePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

TimePickerWithRef.displayName = 'TimePickerWithRef';

export default TimePickerWithRef;
