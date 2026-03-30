import {deepEqual} from 'fast-equals';
import type {ForwardedRef, ReactNode, RefObject} from 'react';
import React, {createRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {StyleProp, TextInputSubmitEditingEvent, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import {useInputBlurActions} from '@components/InputBlurContext';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {getIsRestoringKeyboardFocus} from '@components/TextInput';
import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useDebounceNonReactive from '@hooks/useDebounceNonReactive';
import useIsFocusedRef from '@hooks/useIsFocusedRef';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {isSafari} from '@libs/Browser';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {prepareValues} from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import {clearErrorFields, clearErrors, setDraftValues, setErrors as setFormErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormDraftKey, OnyxFormKey} from '@src/ONYXKEYS';
import type {Form} from '@src/types/form';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import KeyboardUtils from '@src/utils/keyboard';
import type {RegisterInput} from './FormContext';
import FormContext from './FormContext';
import FormWrapper from './FormWrapper';
import isNumericKeyboard from './isNumericKeyboard';
import type {FormInputErrors, FormOnyxValues, FormProps, FormRef, FormWrapperRef, InputComponentBaseProps, InputRefs, ValueTypeKey} from './types';

// In order to prevent Checkbox focus loss when the user are focusing a TextInput and proceeds to toggle a CheckBox in web and mobile web.
// 200ms delay was chosen as a result of empirical testing.
// More details: https://github.com/Expensify/App/pull/16444#issuecomment-1482983426
const VALIDATE_DELAY = 200;

type GenericFormInputErrors = Partial<Record<string, string>>;
type InitialDefaultValue = false | Date | '';

function getInitialValueByType(valueType?: ValueTypeKey): InitialDefaultValue {
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

type FormProviderProps<TFormID extends OnyxFormKey = OnyxFormKey> = FormProps<TFormID> & {
    /** Children to render. */
    children: ((props: {inputValues: FormOnyxValues<TFormID>}) => ReactNode) | ReactNode;

    /** Callback to validate the form */
    validate?: (values: FormOnyxValues<TFormID>, translate: LocalizedTranslate) => FormInputErrors<TFormID>;

    /** Should validate function be called when input loose focus */
    shouldValidateOnBlur?: boolean;

    /** Should validate function be called when the value of the input is changed */
    shouldValidateOnChange?: boolean;

    /** Whether to remove invisible characters from strings before validation and submission */
    shouldTrimValues?: boolean;

    /** Styles that will be applied to the submit button only */
    submitButtonStyles?: StyleProp<ViewStyle>;

    /** Whether to apply flex to the submit button */
    submitFlexEnabled?: boolean;

    /** Whether button is disabled */
    isSubmitDisabled?: boolean;

    /** Whether HTML is allowed in form inputs */
    allowHTML?: boolean;

    /** Whether to render the submit button above the footer. */
    shouldRenderFooterAboveSubmit?: boolean;

    /** Whether the form is loading */
    isLoading?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;

    /** Whether the submit button should stick to the bottom of the screen. */
    shouldSubmitButtonStickToBottom?: boolean;

    /** Fires at most once per frame during scrolling. */
    onScroll?: () => void;

    /** Use stricter HTML-like tag validation (e.g. blocks <✓>, <123>). */
    shouldUseStrictHtmlTagValidation?: boolean;

    /** Prevents the submit button from triggering blur on mouse down. */
    shouldPreventDefaultFocusOnPressSubmit?: boolean;

    /**
     * Controls how keyboard dismissal interacts with form submission.
     * - `DISMISS_THEN_SUBMIT` (default): waits for the keyboard to fully dismiss before calling `onSubmit`.
     * - `SUBMIT_AND_DISMISS`: calls `onSubmit` immediately while dismissing the keyboard in parallel via `dismissKeyboardAndExecute`.
     * - `SUBMIT_ONLY`: calls `onSubmit` immediately without any keyboard dismissal (navigation handles keyboard cleanup).
     */
    keyboardSubmitBehavior?: ValueOf<typeof CONST.KEYBOARD_SUBMIT_BEHAVIOR>;

    /** Callback fired synchronously when the user presses submit, before validation runs */
    onBeforeSubmit?: () => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<FormRef>;
};

function FormProvider({
    formID,
    validate,
    shouldValidateOnBlur = true,
    shouldValidateOnChange = true,
    children,
    enabledWhenOffline = false,
    onSubmit,
    shouldTrimValues = true,
    allowHTML = false,
    isLoading = false,
    shouldRenderFooterAboveSubmit = false,
    shouldUseStrictHtmlTagValidation = false,
    shouldPreventDefaultFocusOnPressSubmit = false,
    shouldHideFixErrorsAlert = false,
    keyboardSubmitBehavior = CONST.KEYBOARD_SUBMIT_BEHAVIOR.DISMISS_THEN_SUBMIT,
    onBeforeSubmit,
    ref,
    ...rest
}: FormProviderProps) {
    const {isOffline} = useNetwork();
    const [formState] = useOnyx<OnyxFormKey, Form>(`${formID}`);
    const [draftValues, draftValuesMetadata] = useOnyx<OnyxFormDraftKey, Form>(`${formID}Draft`);
    const {preferredLocale, translate} = useLocalize();
    const inputRefs = useRef<InputRefs>({});
    const formWrapperRef = useRef<FormWrapperRef>(null);
    const touchedInputs = useRef<Record<string, boolean>>({});
    const [inputValues, setInputValues] = useState<Form>(() => ({...draftValues}));
    const isLoadingDraftValues = isLoadingOnyxValue(draftValuesMetadata);
    const previousDraftValues = useRef(draftValues);

    if (!isLoadingDraftValues && draftValues !== previousDraftValues.current) {
        previousDraftValues.current = draftValues;
        setInputValues({...inputValues, ...draftValues});
    }

    const [errors, setErrors] = useState<GenericFormInputErrors>({});
    const [errorAnnouncementKey, setErrorAnnouncementKey] = useState(0);
    const hasServerError = useMemo(() => !!formState && !isEmptyObject(formState?.errors), [formState]);
    const {setIsBlurred} = useInputBlurActions();

    const errorMessage = formState ? getLatestErrorMessage(formState) : undefined;
    const isGeneralAlertVisible = ((!isEmptyObject(errors) || !isEmptyObject(formState?.errorFields)) && !shouldHideFixErrorsAlert) || !!errorMessage;
    const firstFieldErrorMessage = useMemo(() => {
        for (const errorMsg of Object.values(errors)) {
            if (errorMsg) {
                return errorMsg;
            }
        }
        return '';
    }, [errors]);

    useAccessibilityAnnouncement(firstFieldErrorMessage, !isGeneralAlertVisible && !!firstFieldErrorMessage && errorAnnouncementKey > 1, {
        shouldAnnounceOnNative: true,
        announcementKey: errorAnnouncementKey,
    });

    const onValidate = useCallback(
        (values: FormOnyxValues, shouldClearServerError = true) => {
            const trimmedStringValues = shouldTrimValues ? prepareValues(values) : values;

            if (shouldClearServerError) {
                clearErrors(formID);
            }
            clearErrorFields(formID);

            const validateErrors: GenericFormInputErrors = validate?.(trimmedStringValues, translate) ?? {};

            if (!allowHTML) {
                // Validate the input for html tags. It should supersede any other error
                for (const [inputID, inputValue] of Object.entries(trimmedStringValues)) {
                    // If the input value is empty OR is non-string, we don't need to validate it for HTML tags
                    if (!inputValue || typeof inputValue !== 'string') {
                        continue;
                    }
                    const validateForHtmlTagRegex = shouldUseStrictHtmlTagValidation ? CONST.STRICT_VALIDATE_FOR_HTML_TAG_REGEX : CONST.VALIDATE_FOR_HTML_TAG_REGEX;
                    const foundHtmlTagIndex = inputValue.search(validateForHtmlTagRegex);
                    const leadingSpaceIndex = inputValue.search(CONST.VALIDATE_FOR_LEADING_SPACES_HTML_TAG_REGEX);

                    // Return early if there are no HTML characters
                    if (leadingSpaceIndex === -1 && foundHtmlTagIndex === -1) {
                        continue;
                    }

                    const matchedHtmlTags = inputValue.match(validateForHtmlTagRegex);
                    let isMatch = CONST.WHITELISTED_TAGS.some((regex) => regex.test(inputValue));
                    // Check for any matches that the original regex (foundHtmlTagIndex) matched
                    if (matchedHtmlTags) {
                        // Check if any matched inputs does not match in WHITELISTED_TAGS list and return early if needed.
                        for (const htmlTag of matchedHtmlTags) {
                            isMatch = CONST.WHITELISTED_TAGS.some((regex) => regex.test(htmlTag));
                            if (!isMatch) {
                                break;
                            }
                        }
                    }

                    if (isMatch && leadingSpaceIndex === -1) {
                        continue;
                    }

                    // Add a validation error here because it is a string value that contains HTML characters
                    validateErrors[inputID] = translate('common.error.invalidCharacter');
                }
            }

            if (typeof validateErrors !== 'object') {
                throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
            }

            const touchedInputErrors = Object.fromEntries(Object.entries(validateErrors).filter(([inputID]) => touchedInputs.current[inputID]));

            if (!deepEqual(errors, touchedInputErrors)) {
                setErrors(touchedInputErrors);
            }

            return touchedInputErrors;
        },
        [shouldTrimValues, formID, validate, errors, translate, allowHTML, shouldUseStrictHtmlTagValidation],
    );

    // When locales change from another session of the same account,
    // validate the form in order to update the error translations
    useEffect(() => {
        // Return since we only have issues with error translations
        if (Object.keys(errors).length === 0) {
            return;
        }

        // Prepare validation values
        const trimmedStringValues = shouldTrimValues ? prepareValues(inputValues) : inputValues;

        // Validate in order to make sure the correct error translations are displayed,
        // making sure to not clear server errors if they exist
        onValidate(trimmedStringValues, !hasServerError);

        // Only run when locales change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preferredLocale]);

    /** @param inputID - The inputID of the input being touched */
    const setTouchedInput = useCallback(
        (inputID: keyof Form) => {
            touchedInputs.current[inputID] = true;
        },
        [touchedInputs],
    );

    const submit = useDebounceNonReactive(
        useCallback(() => {
            // Return early if the form is already submitting to avoid duplicate submission
            if (!!formState?.isLoading || isLoading) {
                return;
            }

            onBeforeSubmit?.();

            // Prepare values before submitting
            const trimmedStringValues = shouldTrimValues ? prepareValues(inputValues) : inputValues;

            // Touches all form inputs, so we can validate the entire form
            for (const inputID of Object.keys(inputRefs.current)) {
                touchedInputs.current[inputID] = true;
            }

            if (hasServerError) {
                return;
            }

            // Validate form and return early if any errors are found
            if (!isEmptyObject(onValidate(trimmedStringValues))) {
                setErrorAnnouncementKey((prev) => prev + 1);
                return;
            }

            // Do not submit form if network is offline and the form is not enabled when offline
            if (isOffline && !enabledWhenOffline) {
                return;
            }

            if (keyboardSubmitBehavior === CONST.KEYBOARD_SUBMIT_BEHAVIOR.DISMISS_THEN_SUBMIT) {
                KeyboardUtils.dismiss().then(() => onSubmit(trimmedStringValues));
            } else if (keyboardSubmitBehavior === CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_AND_DISMISS) {
                KeyboardUtils.dismissKeyboardAndExecute(() => onSubmit(trimmedStringValues));
            } else {
                onSubmit(trimmedStringValues);
            }
        }, [enabledWhenOffline, formState?.isLoading, inputValues, isLoading, isOffline, onSubmit, onValidate, shouldTrimValues, hasServerError, keyboardSubmitBehavior, onBeforeSubmit]),
        1000,
        {leading: true, trailing: false},
    );

    // Keep track of the focus state of the current screen.
    // This is used to prevent validating the form on blur before it has been interacted with.
    const isFocusedRef = useIsFocusedRef();

    const resetForm = useCallback(
        (optionalValue: FormOnyxValues) => {
            for (const inputID of Object.keys(inputValues)) {
                setInputValues((prevState) => {
                    const copyPrevState = {...prevState};

                    touchedInputs.current[inputID] = false;
                    copyPrevState[inputID] = optionalValue[inputID as keyof FormOnyxValues] || '';

                    return copyPrevState;
                });
            }
            setErrors({});
        },
        [inputValues],
    );

    const resetErrors = useCallback(() => {
        clearErrors(formID);
        clearErrorFields(formID);
        setErrors({});
    }, [formID]);

    const resetFormFieldError = useCallback(
        (inputID: keyof Form) => {
            const newErrors = {...errors};
            delete newErrors[inputID];
            setFormErrors(formID, newErrors as Errors);
            setErrors(newErrors);
        },
        [errors, formID],
    );

    const scrollToEnd = useCallback(() => {
        formWrapperRef.current?.scrollToEnd();
    }, []);

    useImperativeHandle(ref, () => ({
        resetForm,
        resetErrors,
        resetFormFieldError,
        submit,
        scrollToEnd,
    }));

    const registerInput = useCallback<RegisterInput>(
        (inputID, shouldSubmitForm, inputProps) => {
            const newRef: RefObject<InputComponentBaseProps> = inputRefs.current[inputID] ?? inputProps.ref ?? createRef();
            if (inputRefs.current[inputID] !== newRef) {
                inputRefs.current[inputID] = newRef;
            }
            if (inputProps.value !== undefined) {
                inputValues[inputID] = inputProps.value;
            } else if (inputProps.shouldSaveDraft && draftValues?.[inputID] !== undefined && inputValues[inputID] === undefined) {
                inputValues[inputID] = draftValues[inputID];
            } else if (inputProps.shouldUseDefaultValue && inputProps.defaultValue !== undefined && inputValues[inputID] === undefined) {
                // We force the form to set the input value from the defaultValue props if there is a saved valid value
                inputValues[inputID] = inputProps.defaultValue;
            } else if (inputValues[inputID] === undefined) {
                // We want to initialize the input value if it's undefined
                inputValues[inputID] = inputProps.defaultValue ?? getInitialValueByType(inputProps.valueType);
            }

            const errorFields = formState?.errorFields?.[inputID] ?? {};
            const fieldErrorMessage =
                Object.keys(errorFields)
                    .sort()
                    .map((key) => errorFields[key])
                    .at(-1) ?? '';

            const inputRef = inputProps.ref;

            const hasNumericKeyboard = isNumericKeyboard(inputProps);

            return {
                ...inputProps,
                ...(shouldSubmitForm && {
                    onSubmitEditing: (event: TextInputSubmitEditingEvent) => {
                        submit();

                        inputProps.onSubmitEditing?.(event);
                    },
                    ...(!hasNumericKeyboard && {returnKeyType: 'go' as const}),
                }),
                ref:
                    typeof inputRef === 'function'
                        ? (node: InputComponentBaseProps) => {
                              inputRef(node);
                              newRef.current = node;
                          }
                        : newRef,
                inputID,
                key: inputProps.key ?? inputID,
                errorText: errors[inputID] ?? fieldErrorMessage,
                value: inputValues[inputID],
                // As the text input is controlled, we never set the defaultValue prop
                // as this is already happening by the value prop.
                // If it's uncontrolled, then we set the `defaultValue` prop to actual value
                defaultValue: inputProps.uncontrolled ? inputProps.defaultValue : undefined,
                onTouched: (event) => {
                    if (!inputProps.shouldSetTouchedOnBlurOnly) {
                        setTouchedInput(inputID);
                    }
                    inputProps.onTouched?.(event);
                },
                onPress: (event) => {
                    if (!inputProps.shouldSetTouchedOnBlurOnly) {
                        setTimeout(() => {
                            setTouchedInput(inputID);
                        }, VALIDATE_DELAY);
                    }
                    inputProps.onPress?.(event);
                },
                onPressOut: (event) => {
                    // To prevent validating just pressed inputs, we need to set the touched input right after
                    // onValidate and to do so, we need to delay setTouchedInput of the same amount of time
                    // as the onValidate is delayed
                    if (!inputProps.shouldSetTouchedOnBlurOnly) {
                        setTimeout(() => {
                            setTouchedInput(inputID);
                        }, VALIDATE_DELAY);
                    }
                    inputProps.onPressOut?.(event);
                },
                onBlur: (event) => {
                    // Only run validation when user proactively blurs the input.
                    if (Visibility.isVisible() && Visibility.hasFocus()) {
                        const relatedTarget = event && 'relatedTarget' in event.nativeEvent && event?.nativeEvent?.relatedTarget;
                        const relatedTargetId = relatedTarget && 'id' in relatedTarget && typeof relatedTarget.id === 'string' && relatedTarget.id;
                        // We delay the validation in order to prevent Checkbox loss of focus when
                        // the user is focusing a TextInput and proceeds to toggle a CheckBox in
                        // web and mobile web platforms.

                        setTimeout(() => {
                            if (
                                relatedTargetId === CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID ||
                                relatedTargetId === CONST.OVERLAY.TOP_BUTTON_NATIVE_ID ||
                                relatedTargetId === CONST.BACK_BUTTON_NATIVE_ID
                            ) {
                                return;
                            }
                            setTouchedInput(inputID);
                            // Skip validation if the screen is not focused or keyboard focus is being restored (Android mWeb)
                            if (shouldValidateOnBlur && isFocusedRef.current && !getIsRestoringKeyboardFocus()) {
                                onValidate(inputValues, !hasServerError);
                            }
                        }, VALIDATE_DELAY);
                    }
                    inputProps.onBlur?.(event);
                    if (isSafari()) {
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            setIsBlurred(true);
                        });
                    }
                },
                onInputChange: (value, key) => {
                    const inputKey = key ?? inputID;
                    setInputValues((prevState) => {
                        const newState = {
                            ...prevState,
                            [inputKey]: value,
                        };

                        if (shouldValidateOnChange) {
                            onValidate(newState);
                        }
                        return newState as Form;
                    });

                    if (inputProps.shouldSaveDraft && !formID.includes('Draft')) {
                        setDraftValues(formID, {[inputKey]: value});
                    }
                    inputProps.onValueChange?.(value, inputKey);
                },
            };
        },
        [
            draftValues,
            inputValues,
            formState?.errorFields,
            errors,
            submit,
            setTouchedInput,
            shouldValidateOnBlur,
            onValidate,
            hasServerError,
            setIsBlurred,
            formID,
            shouldValidateOnChange,
            isFocusedRef,
        ],
    );
    const fallbackAnnouncementMessage = !isGeneralAlertVisible ? firstFieldErrorMessage : '';
    const getErrorAnnouncementKey = useCallback(() => errorAnnouncementKey, [errorAnnouncementKey]);
    const getFallbackAnnouncementMessage = useCallback(() => fallbackAnnouncementMessage, [fallbackAnnouncementMessage]);
    const value = useMemo(() => ({registerInput, getErrorAnnouncementKey, getFallbackAnnouncementMessage}), [registerInput, getErrorAnnouncementKey, getFallbackAnnouncementMessage]);

    const submitAndAnnounce = useCallback(() => {
        if (hasServerError) {
            setErrorAnnouncementKey((prev) => prev + 1);
        }
        submit();
    }, [hasServerError, submit]);

    return (
        <FormContext.Provider value={value}>
            {/* eslint-disable react/jsx-props-no-spreading */}
            <FormWrapper
                {...rest}
                formID={formID}
                onSubmit={submitAndAnnounce}
                inputRefs={inputRefs}
                errors={errors}
                isLoading={isLoading}
                enabledWhenOffline={enabledWhenOffline}
                shouldHideFixErrorsAlert={shouldHideFixErrorsAlert}
                shouldRenderFooterAboveSubmit={shouldRenderFooterAboveSubmit}
                shouldPreventDefaultFocusOnPressSubmit={shouldPreventDefaultFocusOnPressSubmit}
                ref={formWrapperRef}
            >
                {typeof children === 'function' ? children({inputValues}) : children}
            </FormWrapper>
        </FormContext.Provider>
    );
}

export default FormProvider as <TFormID extends OnyxFormKey>(props: FormProviderProps<TFormID>) => ReactNode;

export type {FormProviderProps};
