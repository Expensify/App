import React, {useEffect, useState, useCallback, useRef, useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import BigNumberPad from './BigNumberPad';
import Button from './Button';
import AmountTextInput from './AmountTextInput';
import * as DeviceCapabilities from '../libs/DeviceCapabilities';
import useLocalize from '../hooks/useLocalize';
import CONST from '../CONST';
import DateUtils from '../libs/DateUtils';
import Text from './Text';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';

const propTypes = {
    /** Refs forwarded to the TextInputWithCurrencySymbol */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

    /** Fired when submit button pressed, saves the given amount and navigates to the next page */
    onSubmitButtonPress: PropTypes.func,

    /** Default value for the inputs */
    defaultValue: PropTypes.string,
};

const defaultProps = {
    forwardedRef: null,
    onSubmitButtonPress: () => {},
    defaultValue: '',
};

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

function formatHour(hourText) {
    // // If the integer value of hour is greater than 12, return the second digit with a leading 0

    // return twoDigitHour;
    const hourNumber = parseInt(hourText, 10);

    // If the integer value of hour is greater than 12, subtract 10
    const adjustedHour = hourNumber > 12 ? hourNumber - 10 : hourNumber;

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
            if (typeof fn === 'function') fn();
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
function TimePicker({forwardedRef, onSubmitButtonPress, defaultValue}) {
    const {translate, numberFormat} = useLocalize();

    const [hours, setHours] = useState(DateUtils.parseTimeTo12HourFormat(defaultValue).hour);
    const [minute, setMinute] = useState(DateUtils.parseTimeTo12HourFormat(defaultValue).minute);
    const [selectionHour, setSelectionHour] = useState({start: 0, end: 0});
    const [selectionMinute, setSelectionMinute] = useState({start: 2, end: 2}); // we focus it by default so need  to have selection on the end

    const [amPmValue, setAmPmValue] = useState(DateUtils.getTimePeriod(defaultValue));

    const hourInputRef = useRef(null);
    const minuteInputRef = useRef(null);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    /**
     * Submit amount and navigate to a proper page
     *
     */
    const submitAndNavigateToNextPage = useCallback(() => {
        onSubmitButtonPress(`${hours}:${minute}`, amPmValue);
    }, [hours, minute, onSubmitButtonPress, amPmValue]);

    const focusMinuteInputOnFirstCharacter = useCallback(() => {
        minuteInputRef.current.focus();
        setSelectionMinute({start: 0, end: 0});
    }, []);

    const handleHourChange = (text) => {
        let filteredText;
        if (selectionHour.start !== selectionHour.end) {
            filteredText = text.replace(/[^0-9]/g, '').slice(0, 2);
        } else {
            filteredText = text.replace(/[^0-9]/g, '');
        }
        let newHour = hours;
        let newSelection = selectionHour.start;
        if (selectionHour.start !== selectionHour.end) {
            if (filteredText.length === 1 && filteredText <= 1) {
                newHour = `${filteredText}0`;
                newSelection = 1;
            } else {
                newHour = `${formatHour(filteredText)}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            }
        } else if (selectionHour.start === 0) {
            const formattedText = `${filteredText[0]}${filteredText[2] || 0}`;
            if (formattedText > 12) {
                newHour = `0${formattedText[1]}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            } else {
                newHour = `${formattedText[0]}${formattedText[1]}`;
                newSelection = 1;
            }
        } else if (selectionHour.start === 1) {
            // if we remove value
            if (filteredText.length < 2) {
                newHour = `0${text}`;
                newSelection = 0;
            } else if (text[1] > 2) {
                newHour = `0${text[1]}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            } else {
                newHour = `${text[0]}${text[1]}`;
                newSelection = 2;
                focusMinuteInputOnFirstCharacter();
            }
        } else if (selectionHour.start === 2 && selectionHour.end === 2) {
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

    const handleMinutesChange = (text) => {
        const filteredText = text.replace(/[^0-9]/g, '');

        let newMinute = minute;
        let newSelection = selectionMinute.start;
        if (selectionMinute.start !== selectionMinute.end) {
            if (filteredText.length === 1 && filteredText > 5) {
                newMinute = `0${filteredText}`;
                newSelection = 2;
            } else if (filteredText.length === 1 && filteredText <= 5) {
                newMinute = `${filteredText}0`;
                newSelection = 1;
            } else {
                newMinute = `${filteredText.slice(0, 2)}`;
                newSelection = 2;
            }
        } else if (selectionMinute.start === 0) {
            const formattedText = `${filteredText[0]}${filteredText[2] || 0}`;
            if (text[0] >= 6) {
                newMinute = `0${formattedText[1]}`;
                newSelection = 2;
            } else {
                newMinute = `${formattedText[0]}${formattedText[1]}`;
                newSelection = 1;
            }
        } else if (selectionMinute.start === 1) {
            //   //if we remove value
            if (filteredText.length < 2) {
                newMinute = `0${text}`;
                newSelection = 0;
            } else {
                newMinute = `${text[0]}${text[1]}`;
                newSelection = 2;
            }
        } else if (filteredText.length < 2) {
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

            if (key === '.') return;
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
            if (selectionMinute.start !== 0 || e.key !== 'Backspace') return;
            hourInputRef.current.focus();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectionMinute.start],
    );

    const {styleForAM, styleForPM} = useMemo(() => {
        const computedStyleForAM = amPmValue !== CONST.TIME_PERIOD.AM ? {backgroundColor: themeColors.componentBG} : {};
        const computedStyleForPM = amPmValue !== CONST.TIME_PERIOD.PM ? {backgroundColor: themeColors.componentBG} : {};

        return {
            styleForAM: [styles.timePickerWidth100, computedStyleForAM],
            styleForPM: [styles.timePickerWidth100, computedStyleForPM],
        };
    }, [amPmValue]);

    const numberPad = useCallback(() => {
        if (!canUseTouchScreen) return null;
        return (
            <BigNumberPad
                nativeID={NUM_PAD_VIEW_ID}
                numberPressed={updateAmountNumberPad}
                isDisabledLongPress
            />
        );
    }, [canUseTouchScreen, updateAmountNumberPad]);

    return (
        <>
            <View style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <View
                    nativeID={AMOUNT_VIEW_ID}
                    style={[styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
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
                    />
                    <Text style={styles.timePickerSemiDot}>:</Text>
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
                    />
                </View>
                <View style={styles.timePickerSwitcherContainer}>
                    <Button
                        shouldEnableHapticFeedback
                        innerStyles={styleForAM}
                        text="AM"
                        onLongPress={() => {}}
                        onPress={() => {
                            setAmPmValue(CONST.TIME_PERIOD.AM);
                        }}
                        onPressOut={() => {}}
                        onMouseDown={(e) => e.preventDefault()}
                    />
                    <Button
                        shouldEnableHapticFeedback
                        innerStyles={styleForPM}
                        text="PM"
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
                style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}
                nativeID={NUM_PAD_CONTAINER_VIEW_ID}
            >
                {numberPad()}
                <Button
                    success
                    style={[styles.w100, styles.mt5]}
                    onPress={submitAndNavigateToNextPage}
                    pressOnEnter
                    text={translate('common.save')}
                />
            </View>
        </>
    );
}

TimePicker.propTypes = propTypes;
TimePicker.defaultProps = defaultProps;
TimePicker.displayName = 'TimePicker';

export default React.forwardRef((props, ref) => (
    <TimePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
