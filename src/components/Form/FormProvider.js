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
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var InputBlurContext_1 = require("@components/InputBlurContext");
var useDebounceNonReactive_1 = require("@hooks/useDebounceNonReactive");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var Browser_1 = require("@libs/Browser");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Visibility_1 = require("@libs/Visibility");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var keyboard_1 = require("@src/utils/keyboard");
var FormContext_1 = require("./FormContext");
var FormWrapper_1 = require("./FormWrapper");
// In order to prevent Checkbox focus loss when the user are focusing a TextInput and proceeds to toggle a CheckBox in web and mobile web.
// 200ms delay was chosen as a result of empirical testing.
// More details: https://github.com/Expensify/App/pull/16444#issuecomment-1482983426
var VALIDATE_DELAY = 200;
function getInitialValueByType(valueType) {
    switch (valueType) {
        case 'string':
            return '';
        case 'boolean':
            return false;
        case 'date':
            return new Date();
        default:
            return '';
    }
}
function FormProvider(_a, forwardedRef) {
    var formID = _a.formID, validate = _a.validate, _b = _a.shouldValidateOnBlur, shouldValidateOnBlur = _b === void 0 ? true : _b, _c = _a.shouldValidateOnChange, shouldValidateOnChange = _c === void 0 ? true : _c, children = _a.children, _d = _a.enabledWhenOffline, enabledWhenOffline = _d === void 0 ? false : _d, onSubmit = _a.onSubmit, _e = _a.shouldTrimValues, shouldTrimValues = _e === void 0 ? true : _e, _f = _a.allowHTML, allowHTML = _f === void 0 ? false : _f, _g = _a.isLoading, isLoading = _g === void 0 ? false : _g, _h = _a.shouldRenderFooterAboveSubmit, shouldRenderFooterAboveSubmit = _h === void 0 ? false : _h, _j = _a.shouldUseStrictHtmlTagValidation, shouldUseStrictHtmlTagValidation = _j === void 0 ? false : _j, _k = _a.shouldPreventDefaultFocusOnPressSubmit, shouldPreventDefaultFocusOnPressSubmit = _k === void 0 ? false : _k, rest = __rest(_a, ["formID", "validate", "shouldValidateOnBlur", "shouldValidateOnChange", "children", "enabledWhenOffline", "onSubmit", "shouldTrimValues", "allowHTML", "isLoading", "shouldRenderFooterAboveSubmit", "shouldUseStrictHtmlTagValidation", "shouldPreventDefaultFocusOnPressSubmit"]);
    var network = (0, useOnyx_1.default)(ONYXKEYS_1.default.NETWORK, { canBeMissing: true })[0];
    var formState = (0, useOnyx_1.default)("".concat(formID), { canBeMissing: true })[0];
    var _l = (0, useOnyx_1.default)("".concat(formID, "Draft"), { canBeMissing: true }), draftValues = _l[0], draftValuesMetadata = _l[1];
    var _m = (0, useLocalize_1.default)(), preferredLocale = _m.preferredLocale, translate = _m.translate;
    var inputRefs = (0, react_1.useRef)({});
    var touchedInputs = (0, react_1.useRef)({});
    var _o = (0, react_1.useState)(function () { return (__assign({}, draftValues)); }), inputValues = _o[0], setInputValues = _o[1];
    var isLoadingDraftValues = (0, isLoadingOnyxValue_1.default)(draftValuesMetadata);
    var prevIsLoadingDraftValues = (0, usePrevious_1.default)(isLoadingDraftValues);
    (0, react_1.useEffect)(function () {
        if (isLoadingDraftValues || !prevIsLoadingDraftValues) {
            return;
        }
        setInputValues(__assign({}, draftValues));
    }, [isLoadingDraftValues, draftValues, prevIsLoadingDraftValues]);
    var _p = (0, react_1.useState)({}), errors = _p[0], setErrors = _p[1];
    var hasServerError = (0, react_1.useMemo)(function () { return !!formState && !(0, EmptyObject_1.isEmptyObject)(formState === null || formState === void 0 ? void 0 : formState.errors); }, [formState]);
    var setIsBlurred = (0, InputBlurContext_1.useInputBlurContext)().setIsBlurred;
    var onValidate = (0, react_1.useCallback)(function (values, shouldClearServerError) {
        var _a;
        if (shouldClearServerError === void 0) { shouldClearServerError = true; }
        var trimmedStringValues = shouldTrimValues ? (0, ValidationUtils_1.prepareValues)(values) : values;
        if (shouldClearServerError) {
            (0, FormActions_1.clearErrors)(formID);
        }
        (0, FormActions_1.clearErrorFields)(formID);
        var validateErrors = (_a = validate === null || validate === void 0 ? void 0 : validate(trimmedStringValues)) !== null && _a !== void 0 ? _a : {};
        if (!allowHTML) {
            // Validate the input for html tags. It should supersede any other error
            Object.entries(trimmedStringValues).forEach(function (_a) {
                var inputID = _a[0], inputValue = _a[1];
                // If the input value is empty OR is non-string, we don't need to validate it for HTML tags
                if (!inputValue || typeof inputValue !== 'string') {
                    return;
                }
                var validateForHtmlTagRegex = shouldUseStrictHtmlTagValidation ? CONST_1.default.STRICT_VALIDATE_FOR_HTML_TAG_REGEX : CONST_1.default.VALIDATE_FOR_HTML_TAG_REGEX;
                var foundHtmlTagIndex = inputValue.search(validateForHtmlTagRegex);
                var leadingSpaceIndex = inputValue.search(CONST_1.default.VALIDATE_FOR_LEADING_SPACES_HTML_TAG_REGEX);
                // Return early if there are no HTML characters
                if (leadingSpaceIndex === -1 && foundHtmlTagIndex === -1) {
                    return;
                }
                var matchedHtmlTags = inputValue.match(validateForHtmlTagRegex);
                var isMatch = CONST_1.default.WHITELISTED_TAGS.some(function (regex) { return regex.test(inputValue); });
                // Check for any matches that the original regex (foundHtmlTagIndex) matched
                if (matchedHtmlTags) {
                    var _loop_1 = function (htmlTag) {
                        isMatch = CONST_1.default.WHITELISTED_TAGS.some(function (regex) { return regex.test(htmlTag); });
                        if (!isMatch) {
                            return "break";
                        }
                    };
                    // Check if any matched inputs does not match in WHITELISTED_TAGS list and return early if needed.
                    for (var _i = 0, matchedHtmlTags_1 = matchedHtmlTags; _i < matchedHtmlTags_1.length; _i++) {
                        var htmlTag = matchedHtmlTags_1[_i];
                        var state_1 = _loop_1(htmlTag);
                        if (state_1 === "break")
                            break;
                    }
                }
                if (isMatch && leadingSpaceIndex === -1) {
                    return;
                }
                // Add a validation error here because it is a string value that contains HTML characters
                validateErrors[inputID] = translate('common.error.invalidCharacter');
            });
        }
        if (typeof validateErrors !== 'object') {
            throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
        }
        var touchedInputErrors = Object.fromEntries(Object.entries(validateErrors).filter(function (_a) {
            var inputID = _a[0];
            return touchedInputs.current[inputID];
        }));
        if (!(0, fast_equals_1.deepEqual)(errors, touchedInputErrors)) {
            setErrors(touchedInputErrors);
        }
        return touchedInputErrors;
    }, [shouldTrimValues, formID, validate, errors, translate, allowHTML, shouldUseStrictHtmlTagValidation]);
    // When locales change from another session of the same account,
    // validate the form in order to update the error translations
    (0, react_1.useEffect)(function () {
        // Return since we only have issues with error translations
        if (Object.keys(errors).length === 0) {
            return;
        }
        // Prepare validation values
        var trimmedStringValues = shouldTrimValues ? (0, ValidationUtils_1.prepareValues)(inputValues) : inputValues;
        // Validate in order to make sure the correct error translations are displayed,
        // making sure to not clear server errors if they exist
        onValidate(trimmedStringValues, !hasServerError);
        // Only run when locales change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [preferredLocale]);
    /** @param inputID - The inputID of the input being touched */
    var setTouchedInput = (0, react_1.useCallback)(function (inputID) {
        touchedInputs.current[inputID] = true;
    }, [touchedInputs]);
    var submit = (0, useDebounceNonReactive_1.default)((0, react_1.useCallback)(function () {
        // Return early if the form is already submitting to avoid duplicate submission
        if (!!(formState === null || formState === void 0 ? void 0 : formState.isLoading) || isLoading) {
            return;
        }
        // Prepare values before submitting
        var trimmedStringValues = shouldTrimValues ? (0, ValidationUtils_1.prepareValues)(inputValues) : inputValues;
        // Touches all form inputs, so we can validate the entire form
        Object.keys(inputRefs.current).forEach(function (inputID) { return (touchedInputs.current[inputID] = true); });
        // Validate form and return early if any errors are found
        if (!(0, EmptyObject_1.isEmptyObject)(onValidate(trimmedStringValues))) {
            return;
        }
        // Do not submit form if network is offline and the form is not enabled when offline
        if ((network === null || network === void 0 ? void 0 : network.isOffline) && !enabledWhenOffline) {
            return;
        }
        keyboard_1.default.dismiss().then(function () { return onSubmit(trimmedStringValues); });
    }, [enabledWhenOffline, formState === null || formState === void 0 ? void 0 : formState.isLoading, inputValues, isLoading, network === null || network === void 0 ? void 0 : network.isOffline, onSubmit, onValidate, shouldTrimValues]), 1000, { leading: true, trailing: false });
    // Keep track of the focus state of the current screen.
    // This is used to prevent validating the form on blur before it has been interacted with.
    var isFocusedRef = (0, react_1.useRef)(true);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        isFocusedRef.current = true;
        return function () {
            isFocusedRef.current = false;
        };
    }, []));
    var resetForm = (0, react_1.useCallback)(function (optionalValue) {
        Object.keys(inputValues).forEach(function (inputID) {
            setInputValues(function (prevState) {
                var copyPrevState = __assign({}, prevState);
                touchedInputs.current[inputID] = false;
                copyPrevState[inputID] = optionalValue[inputID] || '';
                return copyPrevState;
            });
        });
        setErrors({});
    }, [inputValues]);
    var resetErrors = (0, react_1.useCallback)(function () {
        (0, FormActions_1.clearErrors)(formID);
        (0, FormActions_1.clearErrorFields)(formID);
        setErrors({});
    }, [formID]);
    var resetFormFieldError = (0, react_1.useCallback)(function (inputID) {
        var newErrors = __assign({}, errors);
        delete newErrors[inputID];
        (0, FormActions_1.setErrors)(formID, newErrors);
        setErrors(newErrors);
    }, [errors, formID]);
    (0, react_1.useImperativeHandle)(forwardedRef, function () { return ({
        resetForm: resetForm,
        resetErrors: resetErrors,
        resetFormFieldError: resetFormFieldError,
        submit: submit,
    }); });
    var registerInput = (0, react_1.useCallback)(function (inputID, shouldSubmitForm, inputProps) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var newRef = (_b = (_a = inputRefs.current[inputID]) !== null && _a !== void 0 ? _a : inputProps.ref) !== null && _b !== void 0 ? _b : (0, react_1.createRef)();
        if (inputRefs.current[inputID] !== newRef) {
            inputRefs.current[inputID] = newRef;
        }
        if (inputProps.value !== undefined) {
            // eslint-disable-next-line react-compiler/react-compiler
            inputValues[inputID] = inputProps.value;
        }
        else if (inputProps.shouldSaveDraft && (draftValues === null || draftValues === void 0 ? void 0 : draftValues[inputID]) !== undefined && inputValues[inputID] === undefined) {
            inputValues[inputID] = draftValues[inputID];
        }
        else if (inputProps.shouldUseDefaultValue && inputProps.defaultValue !== undefined && inputValues[inputID] === undefined) {
            // We force the form to set the input value from the defaultValue props if there is a saved valid value
            inputValues[inputID] = inputProps.defaultValue;
        }
        else if (inputValues[inputID] === undefined) {
            // We want to initialize the input value if it's undefined
            inputValues[inputID] = (_c = inputProps.defaultValue) !== null && _c !== void 0 ? _c : getInitialValueByType(inputProps.valueType);
        }
        var errorFields = (_e = (_d = formState === null || formState === void 0 ? void 0 : formState.errorFields) === null || _d === void 0 ? void 0 : _d[inputID]) !== null && _e !== void 0 ? _e : {};
        var fieldErrorMessage = (_f = Object.keys(errorFields)
            .sort()
            .map(function (key) { return errorFields[key]; })
            .at(-1)) !== null && _f !== void 0 ? _f : '';
        var inputRef = inputProps.ref;
        return __assign(__assign(__assign({}, inputProps), (shouldSubmitForm && {
            onSubmitEditing: function (event) {
                var _a;
                submit();
                (_a = inputProps.onSubmitEditing) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
            },
            returnKeyType: 'go',
        })), { ref: typeof inputRef === 'function'
                ? function (node) {
                    inputRef(node);
                    newRef.current = node;
                }
                : newRef, inputID: inputID, key: (_g = inputProps.key) !== null && _g !== void 0 ? _g : inputID, errorText: (_h = errors[inputID]) !== null && _h !== void 0 ? _h : fieldErrorMessage, value: inputValues[inputID], 
            // As the text input is controlled, we never set the defaultValue prop
            // as this is already happening by the value prop.
            // If it's uncontrolled, then we set the `defaultValue` prop to actual value
            defaultValue: inputProps.uncontrolled ? inputProps.defaultValue : undefined, onTouched: function (event) {
                var _a;
                if (!inputProps.shouldSetTouchedOnBlurOnly) {
                    setTouchedInput(inputID);
                }
                (_a = inputProps.onTouched) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
            }, onPress: function (event) {
                var _a;
                if (!inputProps.shouldSetTouchedOnBlurOnly) {
                    setTimeout(function () {
                        setTouchedInput(inputID);
                    }, VALIDATE_DELAY);
                }
                (_a = inputProps.onPress) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
            }, onPressOut: function (event) {
                var _a;
                // To prevent validating just pressed inputs, we need to set the touched input right after
                // onValidate and to do so, we need to delay setTouchedInput of the same amount of time
                // as the onValidate is delayed
                if (!inputProps.shouldSetTouchedOnBlurOnly) {
                    setTimeout(function () {
                        setTouchedInput(inputID);
                    }, VALIDATE_DELAY);
                }
                (_a = inputProps.onPressOut) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
            }, onBlur: function (event) {
                var _a, _b;
                // Only run validation when user proactively blurs the input.
                if (Visibility_1.default.isVisible() && Visibility_1.default.hasFocus()) {
                    var relatedTarget = event && 'relatedTarget' in event.nativeEvent && ((_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.relatedTarget);
                    var relatedTargetId_1 = relatedTarget && 'id' in relatedTarget && typeof relatedTarget.id === 'string' && relatedTarget.id;
                    // We delay the validation in order to prevent Checkbox loss of focus when
                    // the user is focusing a TextInput and proceeds to toggle a CheckBox in
                    // web and mobile web platforms.
                    setTimeout(function () {
                        if (relatedTargetId_1 === CONST_1.default.OVERLAY.BOTTOM_BUTTON_NATIVE_ID ||
                            relatedTargetId_1 === CONST_1.default.OVERLAY.TOP_BUTTON_NATIVE_ID ||
                            relatedTargetId_1 === CONST_1.default.BACK_BUTTON_NATIVE_ID) {
                            return;
                        }
                        setTouchedInput(inputID);
                        // We don't validate the form on blur in case the current screen is not focused
                        if (shouldValidateOnBlur && isFocusedRef.current) {
                            onValidate(inputValues, !hasServerError);
                        }
                    }, VALIDATE_DELAY);
                }
                (_b = inputProps.onBlur) === null || _b === void 0 ? void 0 : _b.call(inputProps, event);
                if ((0, Browser_1.isSafari)()) {
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        setIsBlurred(true);
                    });
                }
            }, onInputChange: function (value, key) {
                var _a;
                var _b;
                var inputKey = key !== null && key !== void 0 ? key : inputID;
                setInputValues(function (prevState) {
                    var _a;
                    var newState = __assign(__assign({}, prevState), (_a = {}, _a[inputKey] = value, _a));
                    if (shouldValidateOnChange) {
                        onValidate(newState);
                    }
                    return newState;
                });
                if (inputProps.shouldSaveDraft && !formID.includes('Draft')) {
                    (0, FormActions_1.setDraftValues)(formID, (_a = {}, _a[inputKey] = value, _a));
                }
                (_b = inputProps.onValueChange) === null || _b === void 0 ? void 0 : _b.call(inputProps, value, inputKey);
            } });
    }, [draftValues, inputValues, formState === null || formState === void 0 ? void 0 : formState.errorFields, errors, submit, setTouchedInput, shouldValidateOnBlur, onValidate, hasServerError, setIsBlurred, formID, shouldValidateOnChange]);
    var value = (0, react_1.useMemo)(function () { return ({ registerInput: registerInput }); }, [registerInput]);
    return (<FormContext_1.default.Provider value={value}>
            {/* eslint-disable react/jsx-props-no-spreading */}
            <FormWrapper_1.default {...rest} formID={formID} onSubmit={submit} inputRefs={inputRefs} errors={errors} isLoading={isLoading} enabledWhenOffline={enabledWhenOffline} shouldRenderFooterAboveSubmit={shouldRenderFooterAboveSubmit} shouldPreventDefaultFocusOnPressSubmit={shouldPreventDefaultFocusOnPressSubmit}>
                {typeof children === 'function' ? children({ inputValues: inputValues }) : children}
            </FormWrapper_1.default>
        </FormContext_1.default.Provider>);
}
FormProvider.displayName = 'Form';
exports.default = (0, react_1.forwardRef)(FormProvider);
