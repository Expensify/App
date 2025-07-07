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
var SwipeInterceptPanResponder_1 = require("@components/SwipeInterceptPanResponder");
var Text_1 = require("@components/Text");
var implementations_1 = require("@components/TextInput/BaseTextInput/implementations");
var styleConst_1 = require("@components/TextInput/styleConst");
var TextInputClearButton_1 = require("@components/TextInput/TextInputClearButton");
var TextInputLabel_1 = require("@components/TextInput/TextInputLabel");
var TextInputMeasurement_1 = require("@components/TextInput/TextInputMeasurement");
var useHtmlPaste_1 = require("@hooks/useHtmlPaste");
var useLocalize_1 = require("@hooks/useLocalize");
var useMarkdownStyle_1 = require("@hooks/useMarkdownStyle");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var InputUtils_1 = require("@libs/InputUtils");
var isInputAutoFilled_1 = require("@libs/isInputAutoFilled");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function BaseTextInput(_a, ref) {
    var _b, _c;
    var _d, _e, _f;
    var _g = _a.label, label = _g === void 0 ? '' : _g, 
    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    _h = _a.value, 
    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    value = _h === void 0 ? undefined : _h, _j = _a.defaultValue, defaultValue = _j === void 0 ? undefined : _j, _k = _a.placeholder, placeholder = _k === void 0 ? '' : _k, _l = _a.errorText, errorText = _l === void 0 ? '' : _l, _m = _a.icon, icon = _m === void 0 ? null : _m, _o = _a.iconLeft, iconLeft = _o === void 0 ? null : _o, textInputContainerStyles = _a.textInputContainerStyles, _p = _a.shouldApplyPaddingToContainer, shouldApplyPaddingToContainer = _p === void 0 ? true : _p, touchableInputWrapperStyle = _a.touchableInputWrapperStyle, containerStyles = _a.containerStyles, inputStyle = _a.inputStyle, _q = _a.forceActiveLabel, forceActiveLabel = _q === void 0 ? false : _q, _r = _a.disableKeyboard, disableKeyboard = _r === void 0 ? false : _r, _s = _a.autoGrow, autoGrow = _s === void 0 ? false : _s, _t = _a.autoGrowHeight, autoGrowHeight = _t === void 0 ? false : _t, maxAutoGrowHeight = _a.maxAutoGrowHeight, _u = _a.hideFocusedState, hideFocusedState = _u === void 0 ? false : _u, _v = _a.maxLength, maxLength = _v === void 0 ? undefined : _v, _w = _a.hint, hint = _w === void 0 ? '' : _w, _x = _a.onInputChange, onInputChange = _x === void 0 ? function () { } : _x, _y = _a.multiline, multiline = _y === void 0 ? false : _y, _z = _a.shouldInterceptSwipe, shouldInterceptSwipe = _z === void 0 ? false : _z, _0 = _a.autoCorrect, autoCorrect = _0 === void 0 ? true : _0, _1 = _a.prefixCharacter, prefixCharacter = _1 === void 0 ? '' : _1, _2 = _a.suffixCharacter, suffixCharacter = _2 === void 0 ? '' : _2, inputID = _a.inputID, _3 = _a.type, type = _3 === void 0 ? 'default' : _3, _4 = _a.excludedMarkdownStyles, excludedMarkdownStyles = _4 === void 0 ? [] : _4, _5 = _a.shouldShowClearButton, shouldShowClearButton = _5 === void 0 ? false : _5, _6 = _a.shouldHideClearButton, shouldHideClearButton = _6 === void 0 ? true : _6, _7 = _a.shouldUseDisabledStyles, shouldUseDisabledStyles = _7 === void 0 ? true : _7, _8 = _a.prefixContainerStyle, prefixContainerStyle = _8 === void 0 ? [] : _8, _9 = _a.prefixStyle, prefixStyle = _9 === void 0 ? [] : _9, _10 = _a.suffixContainerStyle, suffixContainerStyle = _10 === void 0 ? [] : _10, _11 = _a.suffixStyle, suffixStyle = _11 === void 0 ? [] : _11, contentWidth = _a.contentWidth, loadingSpinnerStyle = _a.loadingSpinnerStyle, _12 = _a.uncontrolled, uncontrolled = _12 === void 0 ? false : _12, placeholderTextColor = _a.placeholderTextColor, onClearInput = _a.onClearInput, iconContainerStyle = _a.iconContainerStyle, inputProps = __rest(_a, ["label", "value", "defaultValue", "placeholder", "errorText", "icon", "iconLeft", "textInputContainerStyles", "shouldApplyPaddingToContainer", "touchableInputWrapperStyle", "containerStyles", "inputStyle", "forceActiveLabel", "disableKeyboard", "autoGrow", "autoGrowHeight", "maxAutoGrowHeight", "hideFocusedState", "maxLength", "hint", "onInputChange", "multiline", "shouldInterceptSwipe", "autoCorrect", "prefixCharacter", "suffixCharacter", "inputID", "type", "excludedMarkdownStyles", "shouldShowClearButton", "shouldHideClearButton", "shouldUseDisabledStyles", "prefixContainerStyle", "prefixStyle", "suffixContainerStyle", "suffixStyle", "contentWidth", "loadingSpinnerStyle", "uncontrolled", "placeholderTextColor", "onClearInput", "iconContainerStyle"]);
    var InputComponent = (_d = implementations_1.default.get(type)) !== null && _d !== void 0 ? _d : RNTextInput_1.default;
    var isMarkdownEnabled = type === 'markdown';
    var isAutoGrowHeightMarkdown = isMarkdownEnabled && autoGrowHeight;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var markdownStyle = (0, useMarkdownStyle_1.default)(false, excludedMarkdownStyles);
    var _13 = inputProps.hasError, hasError = _13 === void 0 ? false : _13;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // Disabling this line for safeness as nullish coalescing works only if value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var initialValue = value || defaultValue || '';
    var initialActiveLabel = !!forceActiveLabel || initialValue.length > 0 || !!prefixCharacter || !!suffixCharacter;
    var _14 = (0, react_1.useState)(false), isFocused = _14[0], setIsFocused = _14[1];
    var _15 = (0, react_1.useState)(inputProps.secureTextEntry), passwordHidden = _15[0], setPasswordHidden = _15[1];
    var _16 = (0, react_1.useState)(0), textInputWidth = _16[0], setTextInputWidth = _16[1];
    var _17 = (0, react_1.useState)(0), textInputHeight = _17[0], setTextInputHeight = _17[1];
    var _18 = (0, react_1.useState)(null), width = _18[0], setWidth = _18[1];
    var _19 = (0, react_1.useState)(8), prefixCharacterPadding = _19[0], setPrefixCharacterPadding = _19[1];
    var _20 = (0, react_1.useState)(function () { return !prefixCharacter; }), isPrefixCharacterPaddingCalculated = _20[0], setIsPrefixCharacterPaddingCalculated = _20[1];
    var labelScale = (0, react_native_reanimated_1.useSharedValue)(initialActiveLabel ? styleConst_1.ACTIVE_LABEL_SCALE : styleConst_1.INACTIVE_LABEL_SCALE);
    var labelTranslateY = (0, react_native_reanimated_1.useSharedValue)(initialActiveLabel ? styleConst_1.ACTIVE_LABEL_TRANSLATE_Y : styleConst_1.INACTIVE_LABEL_TRANSLATE_Y);
    var input = (0, react_1.useRef)(null);
    var isLabelActive = (0, react_1.useRef)(initialActiveLabel);
    var didScrollToEndRef = (0, react_1.useRef)(false);
    (0, useHtmlPaste_1.default)(input, undefined, isMarkdownEnabled);
    // AutoFocus which only works on mount:
    (0, react_1.useEffect)(function () {
        // We are manually managing focus to prevent this issue: https://github.com/Expensify/App/issues/4514
        if (!inputProps.autoFocus || !input.current) {
            return;
        }
        input.current.focus();
        // We only want this to run on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
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
        var newValue = value !== null && value !== void 0 ? value : '';
        if (newValue.length < 0 || isLabelActive.current) {
            return;
        }
        animateLabel(styleConst_1.ACTIVE_LABEL_TRANSLATE_Y, styleConst_1.ACTIVE_LABEL_SCALE);
        isLabelActive.current = true;
    }, [animateLabel, value]);
    var deactivateLabel = (0, react_1.useCallback)(function () {
        var newValue = value !== null && value !== void 0 ? value : '';
        if (!!forceActiveLabel || newValue.length !== 0 || prefixCharacter || suffixCharacter) {
            return;
        }
        animateLabel(styleConst_1.INACTIVE_LABEL_TRANSLATE_Y, styleConst_1.INACTIVE_LABEL_SCALE);
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
        setWidth(function (prevWidth) { return (autoGrowHeight ? layout.width : prevWidth); });
    }, [autoGrowHeight, multiline]);
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
        onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(newValue);
        if (inputProps.onChangeText) {
            expensify_common_1.Str.result(inputProps.onChangeText, newValue);
        }
        if (newValue && newValue.length > 0) {
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
    var isMultiline = multiline || autoGrowHeight;
    var shouldAddPaddingBottom = isMultiline || (autoGrowHeight && !isAutoGrowHeightMarkdown && textInputHeight > variables_1.default.componentSizeLarge);
    var hasLabel = !!(label === null || label === void 0 ? void 0 : label.length);
    var isReadOnly = (_e = inputProps.readOnly) !== null && _e !== void 0 ? _e : inputProps.disabled;
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and errorText can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var inputHelpText = errorText || hint;
    var newPlaceholder = !!prefixCharacter || !!suffixCharacter || isFocused || !hasLabel || (hasLabel && forceActiveLabel) ? placeholder : undefined;
    var newTextInputContainerStyles = react_native_1.StyleSheet.flatten([
        styles.textInputContainer,
        !shouldApplyPaddingToContainer && styles.p0,
        !hasLabel && styles.pt0,
        textInputContainerStyles,
        (autoGrow || !!contentWidth) && StyleUtils.getWidthStyle(textInputWidth + (shouldApplyPaddingToContainer ? styles.textInputContainer.padding * 2 : 0)),
        !hideFocusedState && isFocused && styles.borderColorFocus,
        (!!hasError || !!errorText) && styles.borderColorDanger,
        autoGrowHeight && { scrollPaddingTop: typeof maxAutoGrowHeight === 'number' ? 2 * maxAutoGrowHeight : undefined },
        isAutoGrowHeightMarkdown && styles.pb2,
        inputProps.disabled && shouldUseDisabledStyles && styles.textInputDisabledContainer,
        shouldAddPaddingBottom && styles.pb1,
    ]);
    var inputPaddingLeft = !!prefixCharacter && StyleUtils.getPaddingLeft(prefixCharacterPadding + styles.pl1.paddingLeft);
    var inputPaddingRight = !!suffixCharacter && StyleUtils.getPaddingRight(StyleUtils.getCharacterPadding(suffixCharacter) + styles.pr1.paddingRight);
    // This is workaround for https://github.com/Expensify/App/issues/47939: in case when user is using Chrome on Android we set inputMode to 'search' to disable autocomplete bar above the keyboard.
    // If we need some other inputMode (eg. 'decimal'), then the autocomplete bar will show, but we can do nothing about it as it's a known Chrome bug.
    var inputMode = (_f = inputProps.inputMode) !== null && _f !== void 0 ? _f : ((0, Browser_1.isMobileChrome)() ? 'search' : undefined);
    return (<>
            <react_native_1.View style={[containerStyles]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...(shouldInterceptSwipe && SwipeInterceptPanResponder_1.default.panHandlers)}>
                <PressableWithoutFeedback_1.default role={CONST_1.default.ROLE.PRESENTATION} onPress={onPress} tabIndex={-1} accessibilityLabel={label} 
    // When autoGrowHeight is true we calculate the width for the text input, so it will break lines properly
    // or if multiline is not supplied we calculate the text input height, using onLayout.
    onLayout={onLayout} style={[
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
                                {isMultiline && (<react_native_1.View style={[
                    styles.textInputLabelBackground,
                    styles.pointerEventsNone,
                    inputProps.disabled && shouldUseDisabledStyles && styles.textInputDisabledContainer,
                ]}/>)}
                                <TextInputLabel_1.default label={label} labelTranslateY={labelTranslateY} labelScale={labelScale} for={inputProps.nativeID}/>
                            </>) : null}
                        <react_native_1.View style={[styles.textInputAndIconContainer(isMarkdownEnabled), isMultiline && hasLabel && styles.textInputMultilineContainer, styles.pointerEventsBoxNone]}>
                            {!!iconLeft && (<react_native_1.View style={[styles.textInputLeftIconContainer, !isReadOnly ? styles.cursorPointer : styles.pointerEventsNone]}>
                                    <Icon_1.default src={iconLeft} fill={theme.icon} height={variables_1.default.iconSizeNormal} width={variables_1.default.iconSizeNormal}/>
                                </react_native_1.View>)}
                            {!!prefixCharacter && (<react_native_1.View style={[styles.textInputPrefixWrapper, prefixContainerStyle]}>
                                    <Text_1.default onLayout={function (event) {
                var _a;
                if (event.nativeEvent.layout.width === 0 && event.nativeEvent.layout.height === 0) {
                    return;
                }
                setPrefixCharacterPadding((_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.layout.width);
                setIsPrefixCharacterPaddingCalculated(true);
            }} tabIndex={-1} style={[styles.textInputPrefix, !hasLabel && styles.pv0, styles.pointerEventsNone, prefixStyle]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b} shouldUseDefaultLineHeight={!Object.keys(react_native_1.StyleSheet.flatten(prefixStyle)).includes('lineHeight')}>
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
    {...inputProps} autoCorrect={inputProps.secureTextEntry ? false : autoCorrect} placeholder={newPlaceholder} placeholderTextColor={placeholderTextColor !== null && placeholderTextColor !== void 0 ? placeholderTextColor : theme.placeholderText} underlineColorAndroid="transparent" style={__spreadArray(__spreadArray([
            styles.flex1,
            styles.w100,
            inputStyle,
            (!hasLabel || isMultiline) && styles.pv0,
            inputPaddingLeft,
            inputPaddingRight,
            inputProps.secureTextEntry && styles.secureInput,
            // Explicitly change boxSizing attribute for mobile chrome in order to apply line-height
            // for the issue mentioned here https://github.com/Expensify/App/issues/26735
            // Set overflow property to enable the parent flexbox to shrink its size
            // (See https://github.com/Expensify/App/issues/41766)
            !isMultiline && (0, Browser_1.isMobileChrome)() && __assign({ boxSizing: 'content-box', height: undefined }, styles.overflowAuto)
        ], (autoGrowHeight && !isAutoGrowHeightMarkdown
            ? [StyleUtils.getAutoGrowHeightInputStyle(textInputHeight, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : 0), styles.verticalAlignTop]
            : []), true), [
            isAutoGrowHeightMarkdown ? [StyleUtils.getMarkdownMaxHeight(maxAutoGrowHeight), styles.verticalAlignTop] : undefined,
            // Add disabled color theme when field is not editable.
            inputProps.disabled && shouldUseDisabledStyles && styles.textInputDisabled,
            styles.pointerEventsAuto,
        ], false)} multiline={isMultiline} maxLength={maxLength} onFocus={onFocus} onBlur={onBlur} onChangeText={setValue} secureTextEntry={passwordHidden} onPressOut={inputProps.onPress} showSoftInputOnFocus={!disableKeyboard} inputMode={inputMode} value={uncontrolled ? undefined : value} selection={inputProps.selection} readOnly={isReadOnly} defaultValue={defaultValue} markdownStyle={markdownStyle}/>
                            {!!suffixCharacter && (<react_native_1.View style={[styles.textInputSuffixWrapper, suffixContainerStyle]}>
                                    <Text_1.default tabIndex={-1} style={[styles.textInputSuffix, !hasLabel && styles.pv0, styles.pointerEventsNone, suffixStyle]} dataSet={_c = {}, _c[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _c}>
                                        {suffixCharacter}
                                    </Text_1.default>
                                </react_native_1.View>)}
                            {((isFocused && !isReadOnly && shouldShowClearButton) || !shouldHideClearButton) && !!value && (<react_native_1.View onLayout={function () {
                if (didScrollToEndRef.current || !input.current) {
                    return;
                }
                (0, InputUtils_1.scrollToRight)(input.current);
                didScrollToEndRef.current = true;
            }}>
                                    <TextInputClearButton_1.default style={StyleUtils.getTextInputIconContainerStyles(hasLabel, false)} onPressButton={function () {
                setValue('');
                onClearInput === null || onClearInput === void 0 ? void 0 : onClearInput();
            }}/>
                                </react_native_1.View>)}
                            {inputProps.isLoading !== undefined && (<react_native_1.ActivityIndicator size="small" color={theme.iconSuccessFill} style={[
                StyleUtils.getTextInputIconContainerStyles(hasLabel, false),
                styles.ml1,
                styles.justifyContentStart,
                loadingSpinnerStyle,
                StyleUtils.getOpacityStyle(inputProps.isLoading ? 1 : 0),
            ]}/>)}
                            {!!inputProps.secureTextEntry && (<Checkbox_1.default style={StyleUtils.getTextInputIconContainerStyles(hasLabel)} onPress={togglePasswordVisibility} onMouseDown={function (e) {
                e.preventDefault();
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
