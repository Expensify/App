import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import CONST from '@src/CONST';
import AmountTextInput from './AmountTextInput';
import BigNumberPad from './BigNumberPad';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import refPropTypes from './refPropTypes';
import Text from './Text';

const propTypes = {
    /** Refs forwarded to the TextInputWithCurrencySymbol */
    forwardedRef: refPropTypes,

    /** Default value for the inputs */
    value: PropTypes.string,

    /** Form Error description */
    errorText: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,
};

const defaultProps = {
    forwardedRef: null,
    errorText: '',
    onInputChange: () => {},
    value: '',
};

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

function formatHour(hourText) {
    let adjustedHour = '00';
    if (hourText > 12 && hourText <= 24) {
        adjustedHour = String(hourText - 12);
    } else if (hourText > 24) {
        adjustedHour = `0${hourText[1]}`;
    } else {
        adjustedHour = hourText;
    }

    // Convert to a string and pad with a 0 if needed
    return adjustedHour.toString().padStart(2, '0');
}

function insertAtPosition(originalString, newSubstring, selectionPositionFrom, selectionPositionTo, fn) {
    // Check for invalid positions
    if (selectionPositionFrom < 0 || selectionPositionTo < 0 || selectionPositionFrom > originalString.length || selectionPositionTo > originalString.length) {
        return;
    }

    // If the positions are the same, it means we're inserting at a point
    if (selectionPositionFrom === selectionPositionTo) {
        if (selectionPositionFrom === originalString.length) {
            if (typeof fn === 'function') {
                fn();
            }
            return originalString; // If the insertion point is at the end, simply return the original string
        }
        return originalString.slice(0, selectionPositionFrom) + newSubstring + originalString.slice(selectionPositionFrom);
    }

    // Replace the selected range
    return originalString.slice(0, selectionPositionFrom) + newSubstring + originalString.slice(selectionPositionTo);
}

function decreaseBothSelectionByOne({start, end}) {
    if (start === 0) {
        return {start: 0, end: 0};
    }
    return {start: start - 1, end: end - 1};
}

function replaceWithZeroAtPosition(originalString, position) {
    if (position === 0 || position > 2) {
        return originalString;
    }
    return `${originalString.slice(0, position - 1)}0${originalString.slice(position)}`;
}

function TimePicker({forwardedRef, value, errorText, onInputChange}) {
    const {numberFormat} = useLocalize();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const localize = useLocalize();
    const [hours, setHours] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).hour);
    const [minute, setMinute] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).minute);
    const [selectionHour, setSelectionHour] = useState({start: 0, end: 0});
    const [selectionMinute, setSelectionMinute] = useState({start: 2, end: 2}); // we focus it by default so need  to have selection on the end

    const [amPmValue, setAmPmValue] = useState(() => DateUtils.get12HourTimeObjectFromDate(value).period);

    const hourInputRef = useRef(null);
    const minuteInputRef = useRef(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const focusMinuteInputOnFirstCharacter = useCallback(() => {
        minuteInputRef.current.focus();
        setSelectionMinute({start: 0, end: 0});
    }, []);

    // This function receive value from hour input and validate it
    // The valid format is HH(from 00 to 12). If the user input 9, it will be 09. If user try to change 09 to 19 it would skip the first character
    const handleHourChange = (text) => {
        let filteredText;
        // Remove non-numeric characters and limit to 3 digits. The third digit will appear when input has 01 and you type 2 => 201
        if (selectionHour.start !== selectionHour.end) {
            filteredText = text.replace(/[^0-9]/g, '').slice(0, 2);
        } else {
            filteredText = text.replace(/[^0-9]/g, '');
        }
        let newHour = hours;
        let newSelection = selectionHour.start;

        // Case when user selects and replaces the text.
        if (selectionHour.start !== selectionHour.end) {
            // If the first digit is <= 1, append 0 at the end.
            if (filteredText.length === 1 && filteredText <= 1) {
                newHour = `${filteredText}0`;
                newSelection = 1;
            } else {
                // Format the hour and move focus to minute input.
                newHour = `${formatHour(filteredText)}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            }
            // Case when the cursor is at the start.
        } else if (selectionHour.start === 0) {
            // Handle cases where the hour would be > 12.

            // when you entering text the filteredText would consist of three numbers
            const formattedText = `${filteredText[0]}${filteredText[2] || 0}`;
            if (formattedText > 12 && formattedText <= 24) {
                newHour = String(formattedText - 12).padStart(2, '0');
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
                setAmPmValue(CONST.TIME_PERIOD.PM);
            } else if (formattedText > 24) {
                newHour = `0${formattedText[1]}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            } else {
                newHour = `${formattedText[0]}${formattedText[1]}`;
                newSelection = 1;
            }
        } else if (selectionHour.start === 1) {
            // Case when the cursor is at the second position.
            const formattedText = `${filteredText[0]}${filteredText[1]}`;

            if (filteredText.length < 2) {
                // If we remove a value, prepend 0.
                newHour = `0${text}`;
                newSelection = 0;
                // If the second digit is > 2, replace the hour with 0 and the second digit.
            } else if (formattedText > 12 && formattedText <= 24) {
                newHour = String(formattedText - 12).padStart(2, '0');
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
                setAmPmValue(CONST.TIME_PERIOD.PM);
            } else if (formattedText > 24) {
                newHour = `0${text[1]}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            } else {
                newHour = `${text[0]}${text[1]}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            }
        } else if (selectionHour.start === 2 && selectionHour.end === 2) {
            // Case when the cursor is at the end and no text is selected.
            if (filteredText.length < 2) {
                newHour = `${text}0`;
                newSelection = 1;
            } else {
                focusMinuteInputOnFirstCharacter();
            }
        }

        setHours(newHour);
        setSelectionHour({start: newSelection, end: newSelection});
    };

    // This function receive value from minute input and validate it
    // The valid format is MM(from 00 to 59). If the user input 9, it will be 09. If user try to change 09 to 99 it would skip the character
    const handleMinutesChange = (text) => {
        // Remove non-numeric characters.
        const filteredText = text.replace(/[^0-9]/g, '');

        let newMinute = minute;
        let newSelection = selectionMinute.start;
        // Case when user selects and replaces the text.
        if (selectionMinute.start !== selectionMinute.end) {
            // If the first digit is > 5, prepend 0.
            if (filteredText.length === 1 && filteredText > 5) {
                newMinute = `0${filteredText}`;
                newSelection = 2;
                // If the first digit is <= 5, append 0 at the end.
            } else if (filteredText.length === 1 && filteredText <= 5) {
                newMinute = `${filteredText}0`;
                newSelection = 1;
            } else {
                newMinute = `${filteredText.slice(0, 2)}`;
                newSelection = 2;
            }
        } else if (selectionMinute.start === 0) {
            // Case when the cursor is at the start.
            const formattedText = `${filteredText[0]}${filteredText[2] || 0}`;
            if (text[0] >= 6) {
                newMinute = `0${formattedText[1]}`;
                newSelection = 2;
            } else {
                newMinute = `${formattedText[0]}${formattedText[1]}`;
                newSelection = 1;
            }
        } else if (selectionMinute.start === 1) {
            // Case when the cursor is at the second position.
            // If we remove a value, prepend 0.
            if (filteredText.length < 2) {
                newMinute = `0${text}`;
                newSelection = 0;
            } else {
                newMinute = `${text[0]}${text[1]}`;
                newSelection = 2;
            }
        } else if (filteredText.length < 2) {
            // Case when the cursor is at the end and no text is selected.
            newMinute = `${text}0`;
            newSelection = 1;
        }

        setMinute(newMinute);
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
                hourInputRef.current.focus();
                setTimeout(() => setSelectionHour({start: 0, end: 0}), 10);
            }

            if (key === '.') {
                return;
            }
            if (key === '<' || key === 'Backspace') {
                if (isHourFocused) {
                    const newHour = replaceWithZeroAtPosition(hours, selectionHour.start);
                    setHours(newHour);
                    setSelectionHour(decreaseBothSelectionByOne(selectionHour));
                } else if (isMinuteFocused) {
                    if (selectionMinute.start === 0) {
                        hourInputRef.current.focus();
                    }
                    const newMinute = replaceWithZeroAtPosition(minute, selectionMinute.start);
                    setMinute(newMinute);
                    setSelectionMinute(decreaseBothSelectionByOne(selectionMinute));
                }
                return;
            }
            const trimmedKey = key.replace(/[^0-9]/g, '');
            if (isHourFocused) {
                handleHourChange(insertAtPosition(hours, trimmedKey, selectionHour.start, selectionHour.end));
            } else if (isMinuteFocused) {
                handleMinutesChange(insertAtPosition(minute, trimmedKey, selectionMinute.start, selectionMinute.end));
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [minute, hours, selectionHour, selectionMinute],
    );

    useEffect(() => {
        minuteInputRef.current.focus();
    }, []);

    const arrowConfig = useMemo(
        () => ({
            shouldPreventDefault: false,
        }),
        [],
    );

    const arrowLeftCallback = useCallback(() => {
        const isMinuteFocused = minuteInputRef.current.isFocused();
        if (isMinuteFocused && selectionMinute.start === 0) {
            hourInputRef.current.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionHour, selectionMinute]);
    const arrowRightCallback = useCallback(() => {
        const isHourFocused = hourInputRef.current.isFocused();

        if (isHourFocused && selectionHour.start === 2) {
            focusMinuteInputOnFirstCharacter();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionHour, selectionMinute]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT, arrowLeftCallback, arrowConfig);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT, arrowRightCallback, arrowConfig);

    const handleFocusOnBackspace = useCallback(
        (e) => {
            if (selectionMinute.start !== 0 || e.key !== 'Backspace') {
                return;
            }
            hourInputRef.current.focus();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionMinute.start],
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
                isDisabledLongPress
            />
        );
    }, [canUseTouchScreen, updateAmountNumberPad]);

    useEffect(() => {
        onInputChange(`${hours}:${minute} ${amPmValue}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hours, minute, amPmValue]);

    return (
        <View style={styles.flex1}>
            <View style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <View
                    nativeID={AMOUNT_VIEW_ID}
                    style={[styles.flexRow, styles.w100, styles.justifyContentCenter, styles.timePickerInputsContainer]}
                >
                    <AmountTextInput
                        formattedAmount={hours}
                        onChangeAmount={handleHourChange}
                        placeholder={numberFormat(0)}
                        ref={(ref) => {
                            if (typeof forwardedRef === 'function') {
                                forwardedRef({refHour: ref, minuteRef: minuteInputRef.current});
                            } else if (forwardedRef && _.has(forwardedRef, 'current')) {
                                // eslint-disable-next-line no-param-reassign
                                forwardedRef.current = {hourRef: ref, minuteRef: minuteInputRef.current};
                            }
                            hourInputRef.current = ref;
                        }}
                        maxLength={2}
                        onSelectionChange={(e) => {
                            setSelectionHour(e.nativeEvent.selection);
                        }}
                        selection={selectionHour}
                        style={styles.timePickerInput}
                        containerStyles={[styles.timePickerHeight100]}
                        showSoftInputOnFocus={false}
                    />
                    <Text style={styles.timePickerSemiDot}>{CONST.COLON}</Text>
                    <AmountTextInput
                        onKeyPress={handleFocusOnBackspace}
                        autofocus
                        formattedAmount={minute}
                        onChangeAmount={handleMinutesChange}
                        placeholder={numberFormat(0)}
                        ref={(ref) => {
                            if (typeof forwardedRef === 'function') {
                                forwardedRef({refHour: hourInputRef.current, minuteRef: ref});
                            } else if (forwardedRef && _.has(forwardedRef, 'current')) {
                                // eslint-disable-next-line no-param-reassign
                                minuteInputRef.current = {hourRef: hourInputRef.current, minuteInputRef: ref};
                            }
                            minuteInputRef.current = ref;
                        }}
                        maxLength={2}
                        onSelectionChange={(e) => {
                            setSelectionMinute(e.nativeEvent.selection);
                        }}
                        selection={selectionMinute}
                        style={styles.timePickerInput}
                        containerStyles={[styles.timePickerHeight100]}
                        showSoftInputOnFocus={false}
                    />
                </View>
                {errorText ? (
                    <FormHelpMessage
                        isError={!!errorText}
                        message={errorText}
                        containerMessageStyle={styles.flexReset}
                    />
                ) : (
                    <View style={styles.formHelperMessage} />
                )}
                <View style={styles.timePickerSwitcherContainer}>
                    <Button
                        shouldEnableHapticFeedback
                        innerStyles={styleForAM}
                        medium={isExtraSmallScreenHeight}
                        text={localize.translate('common.am')}
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
                        text={localize.translate('common.pm')}
                        onLongPress={() => {}}
                        onPress={() => {
                            setAmPmValue(CONST.TIME_PERIOD.PM);
                        }}
                        onPressOut={() => {}}
                        onMouseDown={(e) => e.preventDefault()}
                    />
                </View>
            </View>
            <View
                style={[styles.pageWrapper, styles.pb4]}
                nativeID={NUM_PAD_CONTAINER_VIEW_ID}
            >
                {numberPad()}
            </View>
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
