"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var defer_1 = require("lodash/defer");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_picker_select_1 = require("react-native-picker-select");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useScrollContext_1 = require("@hooks/useScrollContext");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var CONST_1 = require("@src/CONST");
function BasePicker(_a, ref) {
    var items = _a.items, backgroundColor = _a.backgroundColor, inputID = _a.inputID, value = _a.value, onInputChange = _a.onInputChange, icon = _a.icon, _b = _a.label, label = _b === void 0 ? '' : _b, _c = _a.isDisabled, isDisabled = _c === void 0 ? false : _c, _d = _a.errorText, errorText = _d === void 0 ? '' : _d, _e = _a.hintText, hintText = _e === void 0 ? '' : _e, containerStyles = _a.containerStyles, _f = _a.placeholder, placeholder = _f === void 0 ? {} : _f, _g = _a.size, size = _g === void 0 ? 'normal' : _g, _h = _a.shouldAllowDisabledStyle, shouldAllowDisabledStyle = _h === void 0 ? true : _h, _j = _a.shouldFocusPicker, shouldFocusPicker = _j === void 0 ? false : _j, _k = _a.shouldShowOnlyTextWhenDisabled, shouldShowOnlyTextWhenDisabled = _k === void 0 ? true : _k, _l = _a.onBlur, onBlur = _l === void 0 ? function () { } : _l, _m = _a.additionalPickerEvents, additionalPickerEvents = _m === void 0 ? function () { } : _m;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _o = (0, react_1.useState)(false), isHighlighted = _o[0], setIsHighlighted = _o[1];
    // reference to the root View
    var root = (0, react_1.useRef)(null);
    // reference to @react-native-picker/picker
    var picker = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (!!value || !items || items.length !== 1 || !onInputChange) {
            return;
        }
        // When there is only 1 element in the selector, we do the user a favor and automatically select it for them
        // so they don't have to spend extra time selecting the only possible value.
        var item = items.at(0);
        if (item) {
            onInputChange(item.value, 0);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [items]);
    var context = (0, useScrollContext_1.default)();
    /**
     * Forms use inputID to set values. But BasePicker passes an index as the second parameter to onValueChange
     * We are overriding this behavior to make BasePicker work with Form
     */
    var onValueChange = function (inputValue, index) {
        if (inputID) {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(inputValue);
            return;
        }
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(inputValue, index);
    };
    var enableHighlight = function () {
        setIsHighlighted(true);
    };
    var disableHighlight = function () {
        setIsHighlighted(false);
    };
    var iconToRender = (0, react_1.useMemo)(function () {
        if (icon) {
            return function () { return icon(size); };
        }
        // eslint-disable-next-line react/display-name
        return function () { return (<Icon_1.default fill={theme.icon} src={Expensicons.DownArrow} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(size === 'small' ? { width: styles.pickerSmall().icon.width, height: styles.pickerSmall().icon.height } : {})}/>); };
    }, [icon, size, styles, theme.icon]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        /**
         * Focuses the picker (if configured to do so)
         *
         * This method is used by Form
         */
        focus: function () {
            if (!shouldFocusPicker) {
                return;
            }
            // Defer the focusing to work around a bug on Mobile Safari, where focusing the `select` element in the
            // same task when we scrolled to it left that element in a glitched state, where the dropdown list can't
            // be opened until the element gets re-focused
            (0, defer_1.default)(function () {
                var _a;
                (_a = picker.current) === null || _a === void 0 ? void 0 : _a.focus();
            });
        },
        /**
         * Like measure(), but measures the view relative to an ancestor
         *
         * This method is used by Form when scrolling to the input
         *
         * @param relativeToNativeComponentRef - reference to an ancestor
         * @param onSuccess - callback called on success
         * @param onFail - callback called on failure
         */
        measureLayout: function (relativeToNativeComponentRef, onSuccess, onFail) {
            if (!root.current) {
                return;
            }
            root.current.measureLayout(relativeToNativeComponentRef, onSuccess, onFail);
        },
    }); });
    /**
     * We pass light text on Android, since Android Native alerts have a dark background in all themes for now.
     */
    var itemColor = (0, react_1.useMemo)(function () {
        if ((0, getOperatingSystem_1.default)() === CONST_1.default.OS.ANDROID) {
            return theme.textLight;
        }
        return theme.text;
    }, [theme]);
    // Windows will reuse the text color of the select for each one of the options
    // so we might need to color accordingly so it doesn't blend with the background.
    var pickerPlaceholder = Object.keys(placeholder).length > 0 ? __assign(__assign({}, placeholder), { color: itemColor }) : {};
    var hasError = !!errorText;
    if (isDisabled && shouldShowOnlyTextWhenDisabled) {
        return (<react_native_1.View>
                {!!label && (<Text_1.default style={[styles.textLabelSupporting, styles.mb1]} numberOfLines={1}>
                        {label}
                    </Text_1.default>)}
                <Text_1.default numberOfLines={1}>{value}</Text_1.default>
                {!!hintText && <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{hintText}</Text_1.default>}
            </react_native_1.View>);
    }
    return (<>
            <react_native_1.View ref={root} style={[
            styles.pickerContainer,
            isDisabled && shouldAllowDisabledStyle && styles.inputDisabled,
            containerStyles,
            isHighlighted && styles.borderColorFocus,
            hasError && styles.borderColorDanger,
        ]}>
                {!!label && <Text_1.default style={[styles.pickerLabel, styles.textLabelSupporting, styles.pointerEventsNone]}>{label}</Text_1.default>}
                <react_native_picker_select_1.default onValueChange={onValueChange} 
    // We add a text color to prevent white text on white background dropdown items on Windows
    items={items.map(function (item) { return (__assign(__assign({}, item), { color: itemColor })); })} style={size === 'normal' ? styles.picker(isDisabled, backgroundColor) : styles.pickerSmall(isDisabled, backgroundColor)} useNativeAndroidPickerStyle={false} placeholder={pickerPlaceholder} value={value} Icon={iconToRender} disabled={isDisabled} fixAndroidTouchableBug onOpen={enableHighlight} onClose={disableHighlight} textInputProps={{
            allowFontScaling: false,
        }} pickerProps={__assign({ ref: picker, tabIndex: -1, onFocus: enableHighlight, onBlur: function () {
                disableHighlight();
                onBlur();
            } }, additionalPickerEvents(enableHighlight, function (inputValue, index) {
            onValueChange(inputValue, index);
            disableHighlight();
        }))} scrollViewRef={context === null || context === void 0 ? void 0 : context.scrollViewRef} scrollViewContentOffsetY={context === null || context === void 0 ? void 0 : context.contentOffsetY}/>
            </react_native_1.View>
            <FormHelpMessage_1.default message={errorText}/>
            {!!hintText && <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.mt2]}>{hintText}</Text_1.default>}
        </>);
}
BasePicker.displayName = 'BasePicker';
exports.default = (0, react_1.forwardRef)(BasePicker);
