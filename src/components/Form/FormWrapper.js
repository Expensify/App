"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var FormElement_1 = require("@components/FormElement");
var ScrollView_1 = require("@components/ScrollView");
var ScrollViewWithContext_1 = require("@components/ScrollViewWithContext");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function FormWrapper(_a) {
    var onSubmit = _a.onSubmit, children = _a.children, errors = _a.errors, inputRefs = _a.inputRefs, submitButtonText = _a.submitButtonText, footerContent = _a.footerContent, _b = _a.isSubmitButtonVisible, isSubmitButtonVisible = _b === void 0 ? true : _b, style = _a.style, submitButtonStyles = _a.submitButtonStyles, _c = _a.submitFlexEnabled, submitFlexEnabled = _c === void 0 ? true : _c, enabledWhenOffline = _a.enabledWhenOffline, _d = _a.isSubmitActionDangerous, isSubmitActionDangerous = _d === void 0 ? false : _d, formID = _a.formID, _e = _a.shouldUseScrollView, shouldUseScrollView = _e === void 0 ? true : _e, _f = _a.scrollContextEnabled, scrollContextEnabled = _f === void 0 ? false : _f, _g = _a.shouldHideFixErrorsAlert, shouldHideFixErrorsAlert = _g === void 0 ? false : _g, _h = _a.disablePressOnEnter, disablePressOnEnter = _h === void 0 ? false : _h, _j = _a.isSubmitDisabled, isSubmitDisabled = _j === void 0 ? false : _j, _k = _a.shouldRenderFooterAboveSubmit, shouldRenderFooterAboveSubmit = _k === void 0 ? false : _k, _l = _a.isLoading, isLoading = _l === void 0 ? false : _l, _m = _a.shouldScrollToEnd, shouldScrollToEnd = _m === void 0 ? false : _m, addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _a.addOfflineIndicatorBottomSafeAreaPadding, shouldSubmitButtonStickToBottomProp = _a.shouldSubmitButtonStickToBottom, _o = _a.shouldSubmitButtonBlendOpacity, shouldSubmitButtonBlendOpacity = _o === void 0 ? false : _o, _p = _a.shouldPreventDefaultFocusOnPressSubmit, shouldPreventDefaultFocusOnPressSubmit = _p === void 0 ? false : _p, _q = _a.onScroll, onScroll = _q === void 0 ? function () { } : _q;
    var styles = (0, useThemeStyles_1.default)();
    var formRef = (0, react_1.useRef)(null);
    var formContentRef = (0, react_1.useRef)(null);
    var formState = (0, useOnyx_1.default)("".concat(formID), { canBeMissing: true })[0];
    var errorMessage = (0, react_1.useMemo)(function () { return (formState ? (0, ErrorUtils_1.getLatestErrorMessage)(formState) : undefined); }, [formState]);
    var onFixTheErrorsLinkPressed = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d, _e, _f;
        var errorFields = !(0, EmptyObject_1.isEmptyObject)(errors) ? errors : ((_a = formState === null || formState === void 0 ? void 0 : formState.errorFields) !== null && _a !== void 0 ? _a : {});
        var focusKey = Object.keys((_b = inputRefs.current) !== null && _b !== void 0 ? _b : {}).find(function (key) { return Object.keys(errorFields).includes(key); });
        if (!focusKey) {
            return;
        }
        var focusInput = (_d = (_c = inputRefs.current) === null || _c === void 0 ? void 0 : _c[focusKey]) === null || _d === void 0 ? void 0 : _d.current;
        // Dismiss the keyboard for non-text fields by checking if the component has the isFocused method, as only TextInput has this method.
        if (typeof (focusInput === null || focusInput === void 0 ? void 0 : focusInput.isFocused) !== 'function') {
            react_native_1.Keyboard.dismiss();
        }
        // We subtract 10 to scroll slightly above the input
        if (formContentRef.current) {
            // We measure relative to the content root, not the scroll view, as that gives
            // consistent results across mobile and web
            (_e = focusInput === null || focusInput === void 0 ? void 0 : focusInput.measureLayout) === null || _e === void 0 ? void 0 : _e.call(focusInput, formContentRef.current, function (X, y) {
                var _a;
                return (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({
                    y: y - 10,
                    animated: false,
                });
            });
        }
        // Focus the input after scrolling, as on the Web it gives a slightly better visual result
        (_f = focusInput === null || focusInput === void 0 ? void 0 : focusInput.focus) === null || _f === void 0 ? void 0 : _f.call(focusInput);
    }, [errors, formState === null || formState === void 0 ? void 0 : formState.errorFields, inputRefs]);
    // If either of `addBottomSafeAreaPadding` or `shouldSubmitButtonStickToBottom` is explicitly set,
    // we expect that the user wants to use the new edge-to-edge mode.
    // In this case, we want to get and apply the padding unconditionally.
    var isUsingEdgeToEdgeMode = addBottomSafeAreaPadding !== undefined || shouldSubmitButtonStickToBottomProp !== undefined;
    var shouldSubmitButtonStickToBottom = shouldSubmitButtonStickToBottomProp !== null && shouldSubmitButtonStickToBottomProp !== void 0 ? shouldSubmitButtonStickToBottomProp : false;
    var paddingBottom = (0, useSafeAreaPaddings_1.default)(isUsingEdgeToEdgeMode).paddingBottom;
    // Same as above, if `addBottomSafeAreaPadding` is explicitly set true, we default to the new edge-to-edge bottom safe area padding handling.
    // If the paddingBottom is 0, it has already been applied to a parent component and we don't want to apply the padding again.
    var isLegacyBottomSafeAreaPaddingAlreadyApplied = paddingBottom === 0;
    var shouldApplyBottomSafeAreaPadding = addBottomSafeAreaPadding !== null && addBottomSafeAreaPadding !== void 0 ? addBottomSafeAreaPadding : !isLegacyBottomSafeAreaPaddingAlreadyApplied;
    // We need to add bottom safe area padding to the submit button when we don't use a scroll view or
    // when the submit button is sticking to the bottom.
    var addSubmitButtonBottomSafeAreaPadding = addBottomSafeAreaPadding && (!shouldUseScrollView || shouldSubmitButtonStickToBottom);
    var submitButtonStylesWithBottomSafeAreaPadding = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({
        addBottomSafeAreaPadding: addSubmitButtonBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: addOfflineIndicatorBottomSafeAreaPadding,
        styleProperty: shouldSubmitButtonStickToBottom ? 'bottom' : 'paddingBottom',
        additionalPaddingBottom: shouldSubmitButtonStickToBottom ? styles.pb5.paddingBottom : 0,
        style: submitButtonStyles,
    });
    var SubmitButton = (0, react_1.useMemo)(function () {
        return isSubmitButtonVisible && (<FormAlertWithSubmitButton_1.default buttonText={submitButtonText} isDisabled={isSubmitDisabled} isAlertVisible={((!(0, EmptyObject_1.isEmptyObject)(errors) || !(0, EmptyObject_1.isEmptyObject)(formState === null || formState === void 0 ? void 0 : formState.errorFields)) && !shouldHideFixErrorsAlert) || !!errorMessage} isLoading={!!(formState === null || formState === void 0 ? void 0 : formState.isLoading) || isLoading} message={(0, EmptyObject_1.isEmptyObject)(formState === null || formState === void 0 ? void 0 : formState.errorFields) ? errorMessage : undefined} onSubmit={onSubmit} footerContent={footerContent} onFixTheErrorsLinkPressed={onFixTheErrorsLinkPressed} containerStyles={[
                styles.mh0,
                styles.mt5,
                submitFlexEnabled && styles.flex1,
                submitButtonStylesWithBottomSafeAreaPadding,
                shouldSubmitButtonStickToBottom && [styles.stickToBottom, style],
            ]} enabledWhenOffline={enabledWhenOffline} isSubmitActionDangerous={isSubmitActionDangerous} disablePressOnEnter={disablePressOnEnter} enterKeyEventListenerPriority={1} shouldRenderFooterAboveSubmit={shouldRenderFooterAboveSubmit} shouldBlendOpacity={shouldSubmitButtonBlendOpacity} shouldPreventDefaultFocusOnPress={shouldPreventDefaultFocusOnPressSubmit}/>);
    }, [
        disablePressOnEnter,
        enabledWhenOffline,
        errorMessage,
        errors,
        footerContent,
        formState === null || formState === void 0 ? void 0 : formState.errorFields,
        formState === null || formState === void 0 ? void 0 : formState.isLoading,
        isLoading,
        isSubmitActionDangerous,
        isSubmitButtonVisible,
        isSubmitDisabled,
        onFixTheErrorsLinkPressed,
        onSubmit,
        shouldHideFixErrorsAlert,
        shouldSubmitButtonBlendOpacity,
        shouldSubmitButtonStickToBottom,
        style,
        styles.flex1,
        styles.mh0,
        styles.mt5,
        styles.stickToBottom,
        submitButtonStylesWithBottomSafeAreaPadding,
        submitButtonText,
        submitFlexEnabled,
        shouldRenderFooterAboveSubmit,
        shouldPreventDefaultFocusOnPressSubmit,
    ]);
    var scrollViewContent = (0, react_1.useCallback)(function () { return (<FormElement_1.default key={formID} ref={formContentRef} style={[style, styles.pb5]} onLayout={function () {
            if (!shouldScrollToEnd) {
                return;
            }
            react_native_1.InteractionManager.runAfterInteractions(function () {
                requestAnimationFrame(function () {
                    var _a;
                    (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated: true });
                });
            });
        }}>
                {children}
                {!shouldSubmitButtonStickToBottom && SubmitButton}
            </FormElement_1.default>); }, [formID, style, styles.pb5, children, shouldSubmitButtonStickToBottom, SubmitButton, shouldScrollToEnd]);
    if (!shouldUseScrollView) {
        if (shouldSubmitButtonStickToBottom) {
            return (<>
                    {scrollViewContent()}
                    {SubmitButton}
                </>);
        }
        return scrollViewContent();
    }
    return (<react_native_1.View style={styles.flex1}>
            {scrollContextEnabled ? (<ScrollViewWithContext_1.default style={[styles.w100, styles.flex1]} contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="handled" addBottomSafeAreaPadding={shouldApplyBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding} ref={formRef}>
                    {scrollViewContent()}
                </ScrollViewWithContext_1.default>) : (<ScrollView_1.default style={[styles.w100, styles.flex1]} contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="handled" addBottomSafeAreaPadding={shouldApplyBottomSafeAreaPadding} addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding} ref={formRef} onScroll={onScroll}>
                    {scrollViewContent()}
                </ScrollView_1.default>)}
            {shouldSubmitButtonStickToBottom && SubmitButton}
        </react_native_1.View>);
}
FormWrapper.displayName = 'FormWrapper';
exports.default = FormWrapper;
