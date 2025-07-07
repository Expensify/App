"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var FormHelpMessage_1 = require("./FormHelpMessage");
var Text_1 = require("./Text");
var TextInput_1 = require("./TextInput");
var TEXT_INPUT_EMPTY_STATE = '';
/**
 * Converts a given string into an array of numbers that must have the same
 * number of elements as the number of inputs.
 */
var decomposeString = function (value, length) {
    var arr = value
        .split('')
        .slice(0, length)
        .map(function (v) { return ((0, ValidationUtils_1.isNumeric)(v) ? v : CONST_1.default.MAGIC_CODE_EMPTY_CHAR); });
    if (arr.length < length) {
        arr = arr.concat(Array(length - arr.length).fill(CONST_1.default.MAGIC_CODE_EMPTY_CHAR));
    }
    return arr;
};
/**
 * Converts an array of strings into a single string. If there are undefined or
 * empty values, it will replace them with a space.
 */
var composeToString = function (value) { return value.map(function (v) { return v !== null && v !== void 0 ? v : CONST_1.default.MAGIC_CODE_EMPTY_CHAR; }).join(''); };
var getInputPlaceholderSlots = function (length) { return Array.from(Array(length).keys()); };
function MagicCodeInput(_a, ref) {
    var _b = _a.value, value = _b === void 0 ? '' : _b, _c = _a.name, name = _c === void 0 ? '' : _c, _d = _a.autoFocus, autoFocus = _d === void 0 ? true : _d, _e = _a.errorText, errorText = _e === void 0 ? '' : _e, _f = _a.shouldSubmitOnComplete, shouldSubmitOnComplete = _f === void 0 ? true : _f, _g = _a.onChangeText, onChangeTextProp = _g === void 0 ? function () { } : _g, _h = _a.maxLength, maxLength = _h === void 0 ? CONST_1.default.MAGIC_CODE_LENGTH : _h, _j = _a.onFulfill, onFulfill = _j === void 0 ? function () { } : _j, _k = _a.isDisableKeyboard, isDisableKeyboard = _k === void 0 ? false : _k, _l = _a.lastPressedDigit, lastPressedDigit = _l === void 0 ? '' : _l, autoComplete = _a.autoComplete, _m = _a.hasError, hasError = _m === void 0 ? false : _m, _o = _a.testID, testID = _o === void 0 ? '' : _o;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var inputRef = (0, react_1.useRef)(null);
    var _p = (0, react_1.useState)(TEXT_INPUT_EMPTY_STATE), input = _p[0], setInput = _p[1];
    var _q = (0, react_1.useState)(0), focusedIndex = _q[0], setFocusedIndex = _q[1];
    var editIndex = (0, react_1.useRef)(0);
    var _r = (0, react_1.useState)(false), wasSubmitted = _r[0], setWasSubmitted = _r[1];
    var shouldFocusLast = (0, react_1.useRef)(false);
    var inputWidth = (0, react_1.useRef)(0);
    var lastFocusedIndex = (0, react_1.useRef)(0);
    var lastValue = (0, react_1.useRef)(TEXT_INPUT_EMPTY_STATE);
    var valueRef = (0, react_1.useRef)(value);
    (0, react_1.useEffect)(function () {
        lastValue.current = input.length;
    }, [input]);
    (0, react_1.useEffect)(function () {
        // Note: there are circumstances where the value state isn't updated yet
        // when e.g. onChangeText gets called the next time. In those cases its safer to access the value from a ref
        // to not have outdated values.
        valueRef.current = value;
    }, [value]);
    var blurMagicCodeInput = function () {
        var _a;
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        setFocusedIndex(undefined);
    };
    var focusMagicCodeInput = function () {
        var _a;
        setFocusedIndex(0);
        lastFocusedIndex.current = 0;
        editIndex.current = 0;
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    var setInputAndIndex = function (index) {
        setInput(TEXT_INPUT_EMPTY_STATE);
        setFocusedIndex(index);
        editIndex.current = index;
    };
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        focus: function () {
            focusMagicCodeInput();
        },
        focusLastSelected: function () {
            var _a;
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        },
        resetFocus: function () {
            setInput(TEXT_INPUT_EMPTY_STATE);
            focusMagicCodeInput();
        },
        clear: function () {
            var _a;
            lastFocusedIndex.current = 0;
            setInputAndIndex(0);
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            onChangeTextProp('');
        },
        blur: function () {
            blurMagicCodeInput();
        },
    }); });
    var validateAndSubmit = function () {
        var numbers = decomposeString(value, maxLength);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (wasSubmitted || !shouldSubmitOnComplete || numbers.filter(function (n) { return (0, ValidationUtils_1.isNumeric)(n); }).length !== maxLength || isOffline) {
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
    var isOffline = (0, useNetwork_1.default)({ onReconnect: validateAndSubmit }).isOffline;
    (0, react_1.useEffect)(function () {
        validateAndSubmit();
        // We have not added:
        // + the editIndex as the dependency because we don't want to run this logic after focusing on an input to edit it after the user has completed the code.
        // + the onFulfill as the dependency because onFulfill is changed when the preferred locale changed => avoid auto submit form when preferred locale changed.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [value, shouldSubmitOnComplete]);
    /**
     * Focuses on the input when it is pressed.
     */
    var onFocus = function (event) {
        if (shouldFocusLast.current) {
            lastValue.current = TEXT_INPUT_EMPTY_STATE;
            setInputAndIndex(lastFocusedIndex.current);
        }
        event.preventDefault();
    };
    /**
     * Tap gesture configuration, updates the indexes of the
     * currently focused input.
     */
    var tapGesture = react_native_gesture_handler_1.Gesture.Tap()
        .runOnJS(true)
        // eslint-disable-next-line react-compiler/react-compiler
        .onBegin(function (event) {
        var _a;
        var index = Math.floor(event.x / (inputWidth.current / maxLength));
        shouldFocusLast.current = false;
        // TapGestureHandler works differently on mobile web and native app
        // On web gesture handler doesn't block interactions with textInput below so there is no need to run `focus()` manually
        if (!(0, Browser_1.isMobileChrome)() && !(0, Browser_1.isMobileSafari)()) {
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
        setInputAndIndex(index);
        lastFocusedIndex.current = index;
    });
    /**
     * Updates the magic inputs with the contents written in the
     * input. It spreads each number into each input and updates
     * the focused input on the next empty one, if exists.
     * It handles both fast typing and only one digit at a time
     * in a specific position.
     *
     * Note: this works under the assumption that the backing text input will always have a cleared text,
     * and entering text will exactly call onChangeText with one new character/digit.
     * When the OS is inserting one time passwords for example it will call this method successively with one more digit each time.
     * Thus, this method relies on an internal value ref to make sure to always use the latest value (as state updates are async, and
     * might happen later than the next call to onChangeText).
     */
    var onChangeText = function (textValue) {
        if (!(textValue === null || textValue === void 0 ? void 0 : textValue.length) || !(0, ValidationUtils_1.isNumeric)(textValue)) {
            return;
        }
        // Checks if one new character was added, or if the content was replaced
        var hasToSlice = typeof lastValue.current === 'string' && textValue.length - 1 === lastValue.current.length && textValue.slice(0, textValue.length - 1) === lastValue.current;
        // Gets the new textValue added by the user
        var addedValue = hasToSlice && typeof lastValue.current === 'string' ? textValue.slice(lastValue.current.length, textValue.length) : textValue;
        lastValue.current = textValue;
        // Updates the focused input taking into consideration the last input
        // edited and the number of digits added by the user.
        var numbersArr = addedValue
            .trim()
            .split('')
            .slice(0, maxLength - editIndex.current);
        var updatedFocusedIndex = Math.min(editIndex.current + (numbersArr.length - 1) + 1, maxLength - 1);
        var numbers = decomposeString(valueRef.current, maxLength);
        numbers = __spreadArray(__spreadArray(__spreadArray([], numbers.slice(0, editIndex.current), true), numbersArr, true), numbers.slice(numbersArr.length + editIndex.current, maxLength), true);
        setInputAndIndex(updatedFocusedIndex);
        var finalInput = composeToString(numbers);
        onChangeTextProp(finalInput);
        valueRef.current = finalInput;
    };
    /**
     * Handles logic related to certain key presses.
     *
     * NOTE: when using Android Emulator, this can only be tested using
     * hardware keyboard inputs.
     */
    var onKeyPress = function (event) {
        var _a, _b, _c, _d, _e, _f;
        var keyValue = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.key;
        if (keyValue === 'Backspace' || keyValue === '<') {
            var numbers = decomposeString(value, maxLength);
            // If keyboard is disabled and no input is focused we need to remove
            // the last entered digit and focus on the correct input
            if (isDisableKeyboard && focusedIndex === undefined) {
                var curEditIndex = editIndex.current;
                var indexBeforeLastEditIndex = curEditIndex === 0 ? curEditIndex : curEditIndex - 1;
                var indexToFocus = numbers.at(curEditIndex) === CONST_1.default.MAGIC_CODE_EMPTY_CHAR ? indexBeforeLastEditIndex : curEditIndex;
                if (indexToFocus !== undefined) {
                    lastFocusedIndex.current = indexToFocus;
                    (_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.focus();
                }
                onChangeTextProp(value.substring(0, indexToFocus));
                return;
            }
            // If the currently focused index already has a value, it will delete
            // that value but maintain the focus on the same input.
            if (focusedIndex !== undefined && (numbers === null || numbers === void 0 ? void 0 : numbers.at(focusedIndex)) !== CONST_1.default.MAGIC_CODE_EMPTY_CHAR) {
                setInput(TEXT_INPUT_EMPTY_STATE);
                numbers = __spreadArray(__spreadArray(__spreadArray([], numbers.slice(0, focusedIndex), true), [CONST_1.default.MAGIC_CODE_EMPTY_CHAR], false), numbers.slice(focusedIndex + 1, maxLength), true);
                editIndex.current = focusedIndex;
                onChangeTextProp(composeToString(numbers));
                return;
            }
            var hasInputs = numbers.filter(function (n) { return (0, ValidationUtils_1.isNumeric)(n); }).length !== 0;
            // Fill the array with empty characters if there are no inputs.
            if (focusedIndex === 0 && !hasInputs) {
                numbers = Array(maxLength).fill(CONST_1.default.MAGIC_CODE_EMPTY_CHAR);
                // Deletes the value of the previous input and focuses on it.
            }
            else if (focusedIndex && focusedIndex !== 0) {
                numbers = __spreadArray(__spreadArray(__spreadArray([], numbers.slice(0, Math.max(0, focusedIndex - 1)), true), [CONST_1.default.MAGIC_CODE_EMPTY_CHAR], false), numbers.slice(focusedIndex, maxLength), true);
            }
            var newFocusedIndex = Math.max(0, (focusedIndex !== null && focusedIndex !== void 0 ? focusedIndex : 0) - 1);
            // Saves the input string so that it can compare to the change text
            // event that will be triggered, this is a workaround for mobile that
            // triggers the change text on the event after the key press.
            setInputAndIndex(newFocusedIndex);
            onChangeTextProp(composeToString(numbers));
            if (newFocusedIndex !== undefined) {
                lastFocusedIndex.current = newFocusedIndex;
                (_c = inputRef.current) === null || _c === void 0 ? void 0 : _c.focus();
            }
        }
        if (keyValue === 'ArrowLeft' && focusedIndex !== undefined) {
            var newFocusedIndex = Math.max(0, focusedIndex - 1);
            setInputAndIndex(newFocusedIndex);
            (_d = inputRef.current) === null || _d === void 0 ? void 0 : _d.focus();
        }
        else if (keyValue === 'ArrowRight' && focusedIndex !== undefined) {
            var newFocusedIndex = Math.min(focusedIndex + 1, maxLength - 1);
            setInputAndIndex(newFocusedIndex);
            (_e = inputRef.current) === null || _e === void 0 ? void 0 : _e.focus();
        }
        else if (keyValue === 'Enter') {
            // We should prevent users from submitting when it's offline.
            if (isOffline) {
                return;
            }
            setInput(TEXT_INPUT_EMPTY_STATE);
            onFulfill(value);
        }
        else if (keyValue === 'Tab' && focusedIndex !== undefined) {
            var newFocusedIndex = event.shiftKey ? focusedIndex - 1 : focusedIndex + 1;
            if (newFocusedIndex >= 0 && newFocusedIndex < maxLength) {
                setInputAndIndex(newFocusedIndex);
                (_f = inputRef.current) === null || _f === void 0 ? void 0 : _f.focus();
                if (event === null || event === void 0 ? void 0 : event.preventDefault) {
                    event.preventDefault();
                }
            }
        }
    };
    /**
     *  If isDisableKeyboard is true we will have to call onKeyPress and onChangeText manually
     *  as the press on digit pad will not trigger native events. We take lastPressedDigit from props
     *  as it stores the last pressed digit pressed on digit pad. We take only the first character
     *  as anything after that is added to differentiate between two same digits passed in a row.
     */
    (0, react_1.useEffect)(function () {
        if (!isDisableKeyboard) {
            return;
        }
        var textValue = lastPressedDigit.charAt(0);
        onKeyPress({ nativeEvent: { key: textValue } });
        onChangeText(textValue);
        // We have not added:
        // + the onChangeText and onKeyPress as the dependencies because we only want to run this when lastPressedDigit changes.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [lastPressedDigit, isDisableKeyboard]);
    return (<>
            <react_native_1.View style={[styles.magicCodeInputContainer]}>
                <react_native_gesture_handler_1.GestureDetector gesture={tapGesture}>
                    {/* Android does not handle touch on invisible Views so I created a wrapper around invisible TextInput just to handle taps */}
                    <react_native_1.View style={[react_native_1.StyleSheet.absoluteFillObject, styles.w100, styles.h100, styles.invisibleOverlay]} collapsable={false}>
                        <TextInput_1.default disableKeyboard={isDisableKeyboard} onLayout={function (e) {
            inputWidth.current = e.nativeEvent.layout.width;
        }} ref={function (newRef) {
            inputRef.current = newRef;
        }} autoFocus={autoFocus} inputMode="numeric" textContentType="oneTimeCode" name={name} maxLength={maxLength} value={input} hideFocusedState autoComplete={input.length === 0 ? autoComplete : undefined} keyboardType={CONST_1.default.KEYBOARD_TYPE.NUMBER_PAD} onChangeText={onChangeText} onKeyPress={onKeyPress} onFocus={onFocus} onBlur={function () {
            shouldFocusLast.current = true;
            lastFocusedIndex.current = focusedIndex !== null && focusedIndex !== void 0 ? focusedIndex : 0;
            setFocusedIndex(undefined);
        }} selectionColor="transparent" inputStyle={[styles.inputTransparent]} role={CONST_1.default.ROLE.PRESENTATION} style={[styles.inputTransparent]} textInputContainerStyles={[styles.borderNone]} testID={testID}/>
                    </react_native_1.View>
                </react_native_gesture_handler_1.GestureDetector>
                {getInputPlaceholderSlots(maxLength).map(function (index) {
            var _a;
            return (<react_native_1.View key={index} style={maxLength === CONST_1.default.MAGIC_CODE_LENGTH ? [styles.w15] : [styles.flex1, index !== 0 && styles.ml3]}>
                        <react_native_1.View style={[
                    styles.textInputContainer,
                    StyleUtils.getHeightOfMagicCodeInput(),
                    hasError || errorText ? styles.borderColorDanger : {},
                    focusedIndex === index ? styles.borderColorFocus : {},
                    styles.pt0,
                ]}>
                            <Text_1.default style={[styles.magicCodeInput, styles.textAlignCenter]}>{(_a = decomposeString(value, maxLength).at(index)) !== null && _a !== void 0 ? _a : ''}</Text_1.default>
                        </react_native_1.View>
                    </react_native_1.View>);
        })}
            </react_native_1.View>
            {!!errorText && (<FormHelpMessage_1.default isError message={errorText}/>)}
        </>);
}
MagicCodeInput.displayName = 'MagicCodeInput';
exports.default = (0, react_1.forwardRef)(MagicCodeInput);
