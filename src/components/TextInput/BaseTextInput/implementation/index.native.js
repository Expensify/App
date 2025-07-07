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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Checkbox_1 = require("@components/Checkbox");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var RNTextInput_1 = require("@components/RNTextInput");
var Text_1 = require("@components/Text");
var implementations_1 = require("@components/TextInput/BaseTextInput/implementations");
var styleConst = require("@components/TextInput/styleConst");
var TextInputClearButton_1 = require("@components/TextInput/TextInputClearButton");
var TextInputLabel_1 = require("@components/TextInput/TextInputLabel");
var TextInputMeasurement_1 = require("@components/TextInput/TextInputMeasurement");
var useHtmlPaste_1 = require("@hooks/useHtmlPaste");
var useLocalize_1 = require("@hooks/useLocalize");
var useMarkdownStyle_1 = require("@hooks/useMarkdownStyle");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var isInputAutoFilled_1 = require("@libs/isInputAutoFilled");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function BaseTextInput(_a, ref) {
    var _b, _c;
    var _d, _e;
    var _f = _a.label, label = _f === void 0 ? '' : _f, 
    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    _g = _a.value, 
    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    value = _g === void 0 ? undefined : _g, _h = _a.defaultValue, defaultValue = _h === void 0 ? undefined : _h, _j = _a.placeholder, placeholder = _j === void 0 ? '' : _j, _k = _a.errorText, errorText = _k === void 0 ? '' : _k, _l = _a.iconLeft, iconLeft = _l === void 0 ? null : _l, _m = _a.icon, icon = _m === void 0 ? null : _m, textInputContainerStyles = _a.textInputContainerStyles, _o = _a.shouldApplyPaddingToContainer, shouldApplyPaddingToContainer = _o === void 0 ? true : _o, touchableInputWrapperStyle = _a.touchableInputWrapperStyle, containerStyles = _a.containerStyles, inputStyle = _a.inputStyle, _p = _a.shouldUseFullInputHeight, shouldUseFullInputHeight = _p === void 0 ? false : _p, _q = _a.forceActiveLabel, forceActiveLabel = _q === void 0 ? false : _q, _r = _a.disableKeyboard, disableKeyboard = _r === void 0 ? false : _r, _s = _a.autoGrow, autoGrow = _s === void 0 ? false : _s, _t = _a.autoGrowExtraSpace, autoGrowExtraSpace = _t === void 0 ? 0 : _t, autoGrowMarginSide = _a.autoGrowMarginSide, _u = _a.autoGrowHeight, autoGrowHeight = _u === void 0 ? false : _u, maxAutoGrowHeight = _a.maxAutoGrowHeight, _v = _a.hideFocusedState, hideFocusedState = _v === void 0 ? false : _v, _w = _a.maxLength, maxLength = _w === void 0 ? undefined : _w, _x = _a.hint, hint = _x === void 0 ? '' : _x, _y = _a.onInputChange, onInputChange = _y === void 0 ? function () { } : _y, _z = _a.multiline, multiline = _z === void 0 ? false : _z, _0 = _a.autoCorrect, autoCorrect = _0 === void 0 ? true : _0, _1 = _a.prefixCharacter, prefixCharacter = _1 === void 0 ? '' : _1, _2 = _a.suffixCharacter, suffixCharacter = _2 === void 0 ? '' : _2, inputID = _a.inputID, _3 = _a.type, type = _3 === void 0 ? 'default' : _3, _4 = _a.excludedMarkdownStyles, excludedMarkdownStyles = _4 === void 0 ? [] : _4, _5 = _a.shouldShowClearButton, shouldShowClearButton = _5 === void 0 ? false : _5, _6 = _a.shouldHideClearButton, shouldHideClearButton = _6 === void 0 ? true : _6, _7 = _a.prefixContainerStyle, prefixContainerStyle = _7 === void 0 ? [] : _7, _8 = _a.prefixStyle, prefixStyle = _8 === void 0 ? [] : _8, _9 = _a.suffixContainerStyle, suffixContainerStyle = _9 === void 0 ? [] : _9, _10 = _a.suffixStyle, suffixStyle = _10 === void 0 ? [] : _10, contentWidth = _a.contentWidth, loadingSpinnerStyle = _a.loadingSpinnerStyle, uncontrolled = _a.uncontrolled, placeholderTextColor = _a.placeholderTextColor, onClearInput = _a.onClearInput, iconContainerStyle = _a.iconContainerStyle, props = __rest(_a, ["label", "value", "defaultValue", "placeholder", "errorText", "iconLeft", "icon", "textInputContainerStyles", "shouldApplyPaddingToContainer", "touchableInputWrapperStyle", "containerStyles", "inputStyle", "shouldUseFullInputHeight", "forceActiveLabel", "disableKeyboard", "autoGrow", "autoGrowExtraSpace", "autoGrowMarginSide", "autoGrowHeight", "maxAutoGrowHeight", "hideFocusedState", "maxLength", "hint", "onInputChange", "multiline", "autoCorrect", "prefixCharacter", "suffixCharacter", "inputID", "type", "excludedMarkdownStyles", "shouldShowClearButton", "shouldHideClearButton", "prefixContainerStyle", "prefixStyle", "suffixContainerStyle", "suffixStyle", "contentWidth", "loadingSpinnerStyle", "uncontrolled", "placeholderTextColor", "onClearInput", "iconContainerStyle"]);
    var InputComponent = (_d = implementations_1.default.get(type)) !== null && _d !== void 0 ? _d : RNTextInput_1.default;
    var isMarkdownEnabled = type === 'markdown';
    var isAutoGrowHeightMarkdown = isMarkdownEnabled && autoGrowHeight;
    var inputProps = __assign({ shouldSaveDraft: false, shouldUseDefaultValue: false }, props);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var markdownStyle = (0, useMarkdownStyle_1.default)(false, excludedMarkdownStyles);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _11 = inputProps.hasError, hasError = _11 === void 0 ? false : _11;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var initialValue = value || defaultValue || '';
    var initialActiveLabel = !!forceActiveLabel || initialValue.length > 0 || !!prefixCharacter || !!suffixCharacter;
    var isMultiline = multiline || autoGrowHeight;
    var _12 = (0, react_1.useState)(false), isFocused = _12[0], setIsFocused = _12[1];
    var _13 = (0, react_1.useState)(inputProps.secureTextEntry), passwordHidden = _13[0], setPasswordHidden = _13[1];
    var _14 = (0, react_1.useState)(0), textInputWidth = _14[0], setTextInputWidth = _14[1];
    var _15 = (0, react_1.useState)(0), textInputHeight = _15[0], setTextInputHeight = _15[1];
    var _16 = (0, react_1.useState)(variables_1.default.componentSizeLarge), height = _16[0], setHeight = _16[1];
    var _17 = (0, react_1.useState)(null), width = _17[0], setWidth = _17[1];
    var _18 = (0, react_1.useState)(8), prefixCharacterPadding = _18[0], setPrefixCharacterPadding = _18[1];
    var _19 = (0, react_1.useState)(function () { return !prefixCharacter; }), isPrefixCharacterPaddingCalculated = _19[0], setIsPrefixCharacterPaddingCalculated = _19[1];
    var labelScale = (0, react_native_reanimated_1.useSharedValue)(initialActiveLabel ? styleConst.ACTIVE_LABEL_SCALE : styleConst.INACTIVE_LABEL_SCALE);
    var labelTranslateY = (0, react_native_reanimated_1.useSharedValue)(initialActiveLabel ? styleConst.ACTIVE_LABEL_TRANSLATE_Y : styleConst.INACTIVE_LABEL_TRANSLATE_Y);
    var input = (0, react_1.useRef)(null);
    var isLabelActive = (0, react_1.useRef)(initialActiveLabel);
    var hasLabel = !!(label === null || label === void 0 ? void 0 : label.length);
    (0, useHtmlPaste_1.default)(input, undefined, isMarkdownEnabled);
    var animateLabel = (0, react_1.useCallback)(function (translateY, scale) {
        labelScale.set((0, react_native_reanimated_1.withTiming)(scale, {
            duration: 200,
            easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.ease),
        }));
        labelTranslateY.set((0, react_native_reanimated_1.withTiming)(translateY, {
            duration: 200,
            easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.ease),
        }));
    }, [labelScale, labelTranslateY]);
    var activateLabel = (0, react_1.useCallback)(function () {
        var inputValue = value !== null && value !== void 0 ? value : '';
        if (inputValue.length < 0 || isLabelActive.current) {
            return;
        }
        animateLabel(styleConst.ACTIVE_LABEL_TRANSLATE_Y, styleConst.ACTIVE_LABEL_SCALE);
        isLabelActive.current = true;
    }, [animateLabel, value]);
    var deactivateLabel = (0, react_1.useCallback)(function () {
        var inputValue = value !== null && value !== void 0 ? value : '';
        if (!!forceActiveLabel || inputValue.length !== 0 || prefixCharacter || suffixCharacter) {
            return;
        }
        animateLabel(styleConst.INACTIVE_LABEL_TRANSLATE_Y, styleConst.INACTIVE_LABEL_SCALE);
        isLabelActive.current = false;
    }, [animateLabel, forceActiveLabel, prefixCharacter, suffixCharacter, value]);
    var onFocus = function (event) {
        var _a;
        (_a = inputProps.onFocus) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
        setIsFocused(true);
    };
    var onBlur = function (event) {
        var _a;
        (_a = inputProps.onBlur) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
        setIsFocused(false);
    };
    var onPress = function (event) {
        var _a, _b;
        if (!!inputProps.disabled || !event) {
            return;
        }
        (_a = inputProps.onPress) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
        if ('isDefaultPrevented' in event && !(event === null || event === void 0 ? void 0 : event.isDefaultPrevented())) {
            (_b = input.current) === null || _b === void 0 ? void 0 : _b.focus();
        }
    };
    var onLayout = (0, react_1.useCallback)(function (event) {
        if (!autoGrowHeight && multiline) {
            return;
        }
        var layout = event.nativeEvent.layout;
        // We need to increase the height for single line inputs to escape cursor jumping on ios
        var heightToFitEmojis = 1;
        setWidth(function (prevWidth) { return (autoGrowHeight ? layout.width : prevWidth); });
        var borderWidth = styles.textInputContainer.borderWidth * 2;
        var labelPadding = hasLabel ? styles.textInputContainer.padding : 0;
        setHeight(function (prevHeight) { return (!multiline ? layout.height + heightToFitEmojis - (labelPadding + borderWidth) : prevHeight); });
    }, [autoGrowHeight, multiline, styles.textInputContainer, hasLabel]);
    // The ref is needed when the component is uncontrolled and we don't have a value prop
    var hasValueRef = (0, react_1.useRef)(initialValue.length > 0);
    var inputValue = value !== null && value !== void 0 ? value : '';
    var hasValue = inputValue.length > 0 || hasValueRef.current;
    // Activate or deactivate the label when either focus changes, or for controlled
    // components when the value prop changes:
    (0, react_1.useEffect)(function () {
        if (hasValue ||
            isFocused ||
            // If the text has been supplied by Chrome autofill, the value state is not synced with the value
            // as Chrome doesn't trigger a change event. When there is autofill text, keep the label activated.
            (0, isInputAutoFilled_1.default)(input.current)) {
            activateLabel();
        }
        else {
            deactivateLabel();
        }
    }, [activateLabel, deactivateLabel, hasValue, isFocused]);
    // When the value prop gets cleared externally, we need to keep the ref in sync:
    (0, react_1.useEffect)(function () {
        // Return early when component uncontrolled, or we still have a value
        if (value === undefined || value) {
            return;
        }
        hasValueRef.current = false;
    }, [value]);
    /**
     * Set Value & activateLabel
     */
    var setValue = function (newValue) {
        var formattedValue = isMultiline ? newValue : newValue.replace(/\n/g, ' ');
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(formattedValue);
        if (inputProps.onChangeText) {
            expensify_common_1.Str.result(inputProps.onChangeText, formattedValue);
        }
        if (formattedValue && formattedValue.length > 0) {
            hasValueRef.current = true;
            // When the component is uncontrolled, we need to manually activate the label:
            if (value === undefined) {
                activateLabel();
            }
        }
        else {
            hasValueRef.current = false;
        }
    };
    var togglePasswordVisibility = (0, react_1.useCallback)(function () {
        setPasswordHidden(function (prevPasswordHidden) { return !prevPasswordHidden; });
    }, []);
    var shouldAddPaddingBottom = isMultiline || (autoGrowHeight && !isAutoGrowHeightMarkdown && textInputHeight > variables_1.default.componentSizeLarge);
    var isReadOnly = (_e = inputProps.readOnly) !== null && _e !== void 0 ? _e : inputProps.disabled;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and errorText can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var inputHelpText = errorText || hint;
    var placeholderValue = !!prefixCharacter || !!suffixCharacter || isFocused || !hasLabel || (hasLabel && forceActiveLabel) ? placeholder : undefined;
    var newTextInputContainerStyles = react_native_1.StyleSheet.flatten([
        styles.textInputContainer,
        !hasLabel && styles.pt0,
        textInputContainerStyles,
        !shouldApplyPaddingToContainer && styles.p0,
        !!contentWidth && StyleUtils.getWidthStyle(textInputWidth + (shouldApplyPaddingToContainer ? styles.textInputContainer.padding * 2 : 0)),
        autoGrow && StyleUtils.getAutoGrowWidthInputContainerStyles(textInputWidth, autoGrowExtraSpace, autoGrowMarginSide),
        !hideFocusedState && isFocused && styles.borderColorFocus,
        (!!hasError || !!errorText) && styles.borderColorDanger,
        autoGrowHeight && { scrollPaddingTop: typeof maxAutoGrowHeight === 'number' ? 2 * maxAutoGrowHeight : undefined },
        isAutoGrowHeightMarkdown && styles.pb2,
        inputProps.disabled && styles.textInputDisabledContainer,
        shouldAddPaddingBottom && styles.pb1,
    ]);
    var inputPaddingLeft = !!prefixCharacter && StyleUtils.getPaddingLeft(prefixCharacterPadding + styles.pl1.paddingLeft);
    var inputPaddingRight = !!suffixCharacter && StyleUtils.getPaddingRight(StyleUtils.getCharacterPadding(suffixCharacter) + styles.pr1.paddingRight);
    // Height fix is needed only for Text single line inputs
    var shouldApplyHeight = !shouldUseFullInputHeight && !isMultiline && !isMarkdownEnabled;
    return (<>
            <react_native_1.View style={[containerStyles]}>
                <PressableWithoutFeedback_1.default role={CONST_1.default.ROLE.PRESENTATION} onPress={onPress} tabIndex={-1} 
    // When autoGrowHeight is true we calculate the width for the text input, so it will break lines properly
    // or if multiline is not supplied we calculate the text input height, using onLayout.
    onLayout={onLayout} accessibilityLabel={label} style={[
            autoGrowHeight &&
                !isAutoGrowHeightMarkdown &&
                styles.autoGrowHeightInputContainer(textInputHeight + (shouldAddPaddingBottom ? styles.textInputContainer.padding : 0), variables_1.default.componentSizeLarge, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0),
            isAutoGrowHeightMarkdown && { minHeight: variables_1.default.componentSizeLarge },
            !isMultiline && styles.componentHeightLarge,
            touchableInputWrapperStyle,
        ]}>
                    <react_native_1.View style={[
            newTextInputContainerStyles,
            // When autoGrow is on and minWidth is not supplied, add a minWidth to allow the input to be focusable.
            autoGrow && !(newTextInputContainerStyles === null || newTextInputContainerStyles === void 0 ? void 0 : newTextInputContainerStyles.minWidth) && styles.mnw2,
        ]}>
                        {hasLabel ? (<>
                                {/* Adding this background to the label only for multiline text input,
to prevent text overlapping with label when scrolling */}
                                {isMultiline && <react_native_1.View style={[styles.textInputLabelBackground, styles.pointerEventsNone, inputProps.disabled && styles.textInputDisabledContainer]}/>}
                                <TextInputLabel_1.default label={label} labelTranslateY={labelTranslateY} labelScale={labelScale} for={inputProps.nativeID}/>
                            </>) : null}
                        <react_native_1.View style={[
            styles.textInputAndIconContainer(isMarkdownEnabled),
            { flex: 1 },
            isMultiline && hasLabel && styles.textInputMultilineContainer,
            styles.pointerEventsBoxNone,
        ]}>
                            {!!iconLeft && (<react_native_1.View style={styles.textInputLeftIconContainer}>
                                    <Icon_1.default src={iconLeft} fill={theme.icon} height={20} width={20}/>
                                </react_native_1.View>)}
                            {!!prefixCharacter && (<react_native_1.View style={[styles.textInputPrefixWrapper, prefixContainerStyle]}>
                                    <Text_1.default onLayout={function (event) {
                var _a;
                if (event.nativeEvent.layout.width === 0 && event.nativeEvent.layout.height === 0) {
                    return;
                }
                setPrefixCharacterPadding((_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.layout.width);
                setIsPrefixCharacterPaddingCalculated(true);
            }} tabIndex={-1} style={[styles.textInputPrefix, !hasLabel && styles.pv0, styles.pointerEventsNone, prefixStyle]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                                        {prefixCharacter}
                                    </Text_1.default>
                                </react_native_1.View>)}
                            <InputComponent ref={function (element) {
            var baseTextInputRef = element;
            if (typeof ref === 'function') {
                ref(baseTextInputRef);
            }
            else if (ref && 'current' in ref) {
                // eslint-disable-next-line no-param-reassign
                ref.current = baseTextInputRef;
            }
            input.current = element;
        }} 
    // eslint-disable-next-line
    {...inputProps} autoCorrect={inputProps.secureTextEntry ? false : autoCorrect} placeholder={placeholderValue} placeholderTextColor={placeholderTextColor !== null && placeholderTextColor !== void 0 ? placeholderTextColor : theme.placeholderText} underlineColorAndroid="transparent" style={__spreadArray(__spreadArray([
            styles.flex1,
            styles.w100,
            inputStyle,
            (!hasLabel || isMultiline) && styles.pv0,
            inputPaddingLeft,
            inputPaddingRight,
            inputProps.secureTextEntry && styles.secureInput,
            // Explicitly remove `lineHeight` from single line inputs so that long text doesn't disappear
            // once it exceeds the input space on iOS (See https://github.com/Expensify/App/issues/13802)
            shouldApplyHeight && { height: height, lineHeight: undefined }
        ], (autoGrowHeight && !isAutoGrowHeightMarkdown
            ? [StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0), styles.verticalAlignTop]
            : []), true), [
            isAutoGrowHeightMarkdown ? [StyleUtils.getMarkdownMaxHeight(maxAutoGrowHeight), styles.verticalAlignTop] : undefined,
            // Add disabled color theme when field is not editable.
            inputProps.disabled && styles.textInputDisabled,
            styles.pointerEventsAuto,
        ], false)} multiline={isMultiline} maxLength={maxLength} onFocus={onFocus} onBlur={onBlur} onChangeText={setValue} secureTextEntry={passwordHidden} onPressOut={inputProps.onPress} showSoftInputOnFocus={!disableKeyboard} keyboardType={inputProps.keyboardType} inputMode={!disableKeyboard ? inputProps.inputMode : CONST_1.default.INPUT_MODE.NONE} value={uncontrolled ? undefined : value} readOnly={isReadOnly} defaultValue={defaultValue} markdownStyle={markdownStyle}/>
                            {!!suffixCharacter && (<react_native_1.View style={[styles.textInputSuffixWrapper, suffixContainerStyle]}>
                                    <Text_1.default tabIndex={-1} style={[styles.textInputSuffix, !hasLabel && styles.pv0, styles.pointerEventsNone, suffixStyle]} dataSet={_c = {}, _c[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _c}>
                                        {suffixCharacter}
                                    </Text_1.default>
                                </react_native_1.View>)}
                            {((isFocused && !isReadOnly && shouldShowClearButton) || !shouldHideClearButton) && !!value && (<TextInputClearButton_1.default style={StyleUtils.getTextInputIconContainerStyles(hasLabel, false)} onPressButton={function () {
                setValue('');
                onClearInput === null || onClearInput === void 0 ? void 0 : onClearInput();
            }}/>)}
                            {inputProps.isLoading !== undefined && (<react_native_1.ActivityIndicator size="small" color={theme.iconSuccessFill} style={[
                StyleUtils.getTextInputIconContainerStyles(hasLabel, false),
                styles.ml1,
                styles.justifyContentStart,
                loadingSpinnerStyle,
                StyleUtils.getOpacityStyle(inputProps.isLoading ? 1 : 0),
            ]}/>)}
                            {!!inputProps.secureTextEntry && (<Checkbox_1.default style={StyleUtils.getTextInputIconContainerStyles(hasLabel)} onPress={togglePasswordVisibility} onMouseDown={function (event) {
                event.preventDefault();
            }} accessibilityLabel={translate('common.visible')}>
                                    <Icon_1.default src={passwordHidden ? Expensicons.Eye : Expensicons.EyeDisabled} fill={theme.icon}/>
                                </Checkbox_1.default>)}
                            {!inputProps.secureTextEntry && !!icon && (<react_native_1.View style={[StyleUtils.getTextInputIconContainerStyles(hasLabel), !isReadOnly ? styles.cursorPointer : styles.pointerEventsNone, iconContainerStyle]}>
                                    <Icon_1.default src={icon} fill={theme.icon}/>
                                </react_native_1.View>)}
                        </react_native_1.View>
                    </react_native_1.View>
                </PressableWithoutFeedback_1.default>
                {!!inputHelpText && (<FormHelpMessage_1.default isError={!!errorText} message={inputHelpText}/>)}
            </react_native_1.View>
            <TextInputMeasurement_1.default value={value} placeholder={placeholder} contentWidth={contentWidth} autoGrowHeight={autoGrowHeight} maxAutoGrowHeight={maxAutoGrowHeight} width={width} inputStyle={inputStyle} inputPaddingLeft={inputPaddingLeft} autoGrow={autoGrow} isAutoGrowHeightMarkdown={isAutoGrowHeightMarkdown} onSetTextInputWidth={setTextInputWidth} onSetTextInputHeight={setTextInputHeight} isPrefixCharacterPaddingCalculated={isPrefixCharacterPaddingCalculated}/>
        </>);
}
BaseTextInput.displayName = 'BaseTextInput';
exports.default = (0, react_1.forwardRef)(BaseTextInput);
