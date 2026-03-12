import {useFocusEffect} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import type {ForwardedRef, ReactNode, RefObject} from 'react';
import React, {createRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {StyleProp, TextInputSubmitEditingEvent, ViewStyle} from 'react-native';
import {useInputBlurActions} from '@components/InputBlurContext';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import useDebounceNonReactive from '@hooks/useDebounceNonReactive';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {isSafari} from '@libs/Browser';
import {prepareValues} from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import {clearErrorFields, clearErrors, setDraftValues, setErrors as setFormErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormDraftKey, OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Form} from '@src/types/form';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import KeyboardUtils from '@src/utils/keyboard';
import type {RegisterInput} from './FormContext';
import FormContext from './FormContext';
import FormWrapper from './FormWrapper';
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
    ref,
    ...rest
}: FormProviderProps) {
    const [network] = useOnyx(ONYXKEYS.NETWORK);
    const [formState] = useOnyx<OnyxFormKey, Form>(`${formID}`);
    const [draftValues] = useOnyx<OnyxFormDraftKey, Form>(`${formID}Draft`);
    const {preferredLocale, translate} = useLocalize();
    const {setIsBlurred} = useInputBlurActions();

    const [userEditedFields, setUserEditedFields] = useState<Partial<Form>>({});
    const [errors, setErrors] = useState<GenericFormInputErrors>({});

    const inputRefs = useRef<InputRefs>({});
    const formWrapperRef = useRef<FormWrapperRef>(null);
    const touchedInputs = useRef<Record<string, boolean>>({});
    const isFocusedRef = useRef(true);
    const prevLocaleRef = useRef(preferredLocale);
    const registeredInputDefaultsRef = useRef<Record<string, Form[keyof Form]>>({});

    const hasServerError = !!formState && !isEmptyObject(formState?.errors);
    const inputValues = {
        ...draftValues,
        ...userEditedFields,
    } as Form;

    function onValidate(values: FormOnyxValues, shouldClearServerError = true) {
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

                if (leadingSpaceIndex === -1 && foundHtmlTagIndex === -1) {
                    continue;
                }

                const matchedHtmlTags = inputValue.match(validateForHtmlTagRegex);
                let isMatch = CONST.WHITELISTED_TAGS.some((regex) => regex.test(inputValue));
                if (matchedHtmlTags) {
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
    }

    function setTouchedInput(inputID: keyof Form) {
        touchedInputs.current[inputID] = true;
    }

    const submit = useDebounceNonReactive(
        () => {
            if (!!formState?.isLoading || isLoading) {
                return;
            }

            const allValues = {...registeredInputDefaultsRef.current, ...inputValues};
            const trimmedStringValues = shouldTrimValues ? prepareValues(allValues) : allValues;

            for (const inputID of Object.keys(inputRefs.current)) {
                touchedInputs.current[inputID] = true;
            }

            if (hasServerError) {
                return;
            }

            if (!isEmptyObject(onValidate(trimmedStringValues))) {
                return;
            }

            if (network?.isOffline && !enabledWhenOffline) {
                return;
            }

            KeyboardUtils.dismiss().then(() => onSubmit(trimmedStringValues));
        },
        1000,
        {leading: true, trailing: false},
    );

    function resetForm(optionalValue: FormOnyxValues) {
        const newEdits: Partial<Form> = {};
        for (const inputID of Object.keys(inputRefs.current)) {
            touchedInputs.current[inputID] = false;
            newEdits[inputID] = optionalValue[inputID as keyof FormOnyxValues] || '';
        }
        setUserEditedFields(newEdits);
        setErrors({});
    }

    function resetErrors() {
        clearErrors(formID);
        clearErrorFields(formID);
        setErrors({});
    }

    function resetFormFieldError(inputID: keyof Form) {
        const newErrors = {...errors};
        delete newErrors[inputID];
        setFormErrors(formID, newErrors as Errors);
        setErrors(newErrors);
    }

    function scrollToEnd() {
        formWrapperRef.current?.scrollToEnd();
    }

    const registerInput: RegisterInput = (inputID, shouldSubmitForm, inputProps) => {
        const newRef: RefObject<InputComponentBaseProps> = inputRefs.current[inputID] ?? inputProps.ref ?? createRef();
        if (inputRefs.current[inputID] !== newRef) {
            inputRefs.current[inputID] = newRef;
        }

        if (inputProps.value !== undefined) {
            registeredInputDefaultsRef.current[inputID] = inputProps.value;
        } else if (registeredInputDefaultsRef.current[inputID] === undefined) {
            registeredInputDefaultsRef.current[inputID] = inputProps.defaultValue ?? getInitialValueByType(inputProps.valueType);
        }

        const resolvedValue = inputProps.value !== undefined ? inputProps.value : (inputValues[inputID] ?? inputProps.defaultValue ?? getInitialValueByType(inputProps.valueType));

        const errorFields = formState?.errorFields?.[inputID] ?? {};
        const fieldErrorMessage =
            Object.keys(errorFields)
                .sort()
                .map((key) => errorFields[key])
                .at(-1) ?? '';

        const inputRef = inputProps.ref;

        return {
            ...inputProps,
            ...(shouldSubmitForm && {
                onSubmitEditing: (event: TextInputSubmitEditingEvent) => {
                    submit();

                    inputProps.onSubmitEditing?.(event);
                },
                returnKeyType: 'go',
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
            value: resolvedValue,
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
                        if (shouldValidateOnBlur && isFocusedRef.current) {
                            onValidate({...registeredInputDefaultsRef.current, ...inputValues}, !hasServerError);
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
                setUserEditedFields((prev) => {
                    const newEdits = {
                        ...prev,
                        [inputKey]: value,
                    };

                    if (shouldValidateOnChange) {
                        onValidate({...registeredInputDefaultsRef.current, ...draftValues, ...newEdits} as Form);
                    }
                    return newEdits;
                });

                if (inputProps.shouldSaveDraft && !formID.includes('Draft')) {
                    setDraftValues(formID, {[inputKey]: value});
                }
                inputProps.onValueChange?.(value, inputKey);
            },
        };
    };

    // When locales change from another session of the same account,
    // validate the form in order to update the error translations
    useEffect(() => {
        if (prevLocaleRef.current === preferredLocale) {
            return;
        }
        prevLocaleRef.current = preferredLocale;

        if (Object.keys(errors).length === 0) {
            return;
        }

        const trimmedStringValues = shouldTrimValues ? prepareValues(inputValues) : inputValues;
        onValidate(trimmedStringValues, !hasServerError);
    }, [preferredLocale, errors, shouldTrimValues, inputValues, onValidate, hasServerError]);

    useFocusEffect(
        useCallback(() => {
            isFocusedRef.current = true;
            return () => {
                isFocusedRef.current = false;
            };
        }, []),
    );

    useImperativeHandle(ref, () => ({
        resetForm,
        resetErrors,
        resetFormFieldError,
        submit,
        scrollToEnd,
    }));

    return (
        <FormContext.Provider value={{registerInput}}>
            {/* eslint-disable react/jsx-props-no-spreading */}
            <FormWrapper
                {...rest}
                formID={formID}
                onSubmit={submit}
                inputRefs={inputRefs}
                errors={errors}
                isLoading={isLoading}
                enabledWhenOffline={enabledWhenOffline}
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
