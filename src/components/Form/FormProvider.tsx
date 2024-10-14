import {useFocusEffect} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import type {ForwardedRef, MutableRefObject, ReactNode, RefAttributes} from 'react';
import React, {createRef, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent, StyleProp, TextInputSubmitEditingEventData, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormDraftKey, OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Form} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {RegisterInput} from './FormContext';
import FormContext from './FormContext';
import FormWrapper from './FormWrapper';
import type {FormInputErrors, FormOnyxValues, FormProps, FormRef, InputComponentBaseProps, InputRefs, ValueTypeKey} from './types';

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
    validate?: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

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
};

function FormProvider(
    {
        formID,
        validate,
        shouldValidateOnBlur = true,
        shouldValidateOnChange = true,
        children,
        enabledWhenOffline = false,
        onSubmit,
        shouldTrimValues = true,
        allowHTML = false,
        ...rest
    }: FormProviderProps,
    forwardedRef: ForwardedRef<FormRef>,
) {
    const [network] = useOnyx(ONYXKEYS.NETWORK);
    const [formState] = useOnyx<OnyxFormKey, Form>(`${formID}`);
    const [draftValues] = useOnyx<OnyxFormDraftKey, Form>(`${formID}Draft`);
    const {preferredLocale, translate} = useLocalize();
    const inputRefs = useRef<InputRefs>({});
    const touchedInputs = useRef<Record<string, boolean>>({});
    const [inputValues, setInputValues] = useState<Form>(() => ({...draftValues}));
    const [errors, setErrors] = useState<GenericFormInputErrors>({});
    const hasServerError = useMemo(() => !!formState && !isEmptyObject(formState?.errors), [formState]);

    const onValidate = useCallback(
        (values: FormOnyxValues, shouldClearServerError = true) => {
            const trimmedStringValues = shouldTrimValues ? ValidationUtils.prepareValues(values) : values;

            if (shouldClearServerError) {
                FormActions.clearErrors(formID);
            }
            FormActions.clearErrorFields(formID);

            const validateErrors: GenericFormInputErrors = validate?.(trimmedStringValues) ?? {};

            if (!allowHTML) {
                // Validate the input for html tags. It should supersede any other error
                Object.entries(trimmedStringValues).forEach(([inputID, inputValue]) => {
                    // If the input value is empty OR is non-string, we don't need to validate it for HTML tags
                    if (!inputValue || typeof inputValue !== 'string') {
                        return;
                    }
                    const foundHtmlTagIndex = inputValue.search(CONST.VALIDATE_FOR_HTML_TAG_REGEX);
                    const leadingSpaceIndex = inputValue.search(CONST.VALIDATE_FOR_LEADINGSPACES_HTML_TAG_REGEX);

                    // Return early if there are no HTML characters
                    if (leadingSpaceIndex === -1 && foundHtmlTagIndex === -1) {
                        return;
                    }

                    const matchedHtmlTags = inputValue.match(CONST.VALIDATE_FOR_HTML_TAG_REGEX);
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
                        return;
                    }

                    // Add a validation error here because it is a string value that contains HTML characters
                    validateErrors[inputID] = translate('common.error.invalidCharacter');
                });
            }

            if (typeof validateErrors !== 'object') {
                throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
            }

            const touchedInputErrors = Object.fromEntries(Object.entries(validateErrors).filter(([inputID]) => touchedInputs.current[inputID]));

            if (!lodashIsEqual(errors, touchedInputErrors)) {
                setErrors(touchedInputErrors);
            }

            return touchedInputErrors;
        },
        [shouldTrimValues, formID, validate, errors, translate, allowHTML],
    );

    // When locales change from another session of the same account,
    // validate the form in order to update the error translations
    useEffect(() => {
        // Return since we only have issues with error translations
        if (Object.keys(errors).length === 0) {
            return;
        }

        // Prepare validation values
        const trimmedStringValues = shouldTrimValues ? ValidationUtils.prepareValues(inputValues) : inputValues;

        // Validate in order to make sure the correct error translations are displayed,
        // making sure to not clear server errors if they exist
        onValidate(trimmedStringValues, !hasServerError);

        // Only run when locales change
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [preferredLocale]);

    /** @param inputID - The inputID of the input being touched */
    const setTouchedInput = useCallback(
        (inputID: keyof Form) => {
            touchedInputs.current[inputID] = true;
        },
        [touchedInputs],
    );

    const submit = useCallback(() => {
        // Return early if the form is already submitting to avoid duplicate submission
        if (formState?.isLoading) {
            return;
        }

        // Prepare values before submitting
        const trimmedStringValues = shouldTrimValues ? ValidationUtils.prepareValues(inputValues) : inputValues;

        // Touches all form inputs, so we can validate the entire form
        Object.keys(inputRefs.current).forEach((inputID) => (touchedInputs.current[inputID] = true));

        // Validate form and return early if any errors are found
        if (!isEmptyObject(onValidate(trimmedStringValues))) {
            return;
        }

        // Do not submit form if network is offline and the form is not enabled when offline
        if (network?.isOffline && !enabledWhenOffline) {
            return;
        }

        onSubmit(trimmedStringValues);
    }, [enabledWhenOffline, formState?.isLoading, inputValues, network?.isOffline, onSubmit, onValidate, shouldTrimValues]);

    // Keep track of the focus state of the current screen.
    // This is used to prevent validating the form on blur before it has been interacted with.
    const isFocusedRef = useRef(true);

    useFocusEffect(
        useCallback(() => {
            isFocusedRef.current = true;
            return () => {
                isFocusedRef.current = false;
            };
        }, []),
    );

    const resetForm = useCallback(
        (optionalValue: FormOnyxValues) => {
            Object.keys(inputValues).forEach((inputID) => {
                setInputValues((prevState) => {
                    const copyPrevState = {...prevState};

                    touchedInputs.current[inputID] = false;
                    copyPrevState[inputID] = optionalValue[inputID as keyof FormOnyxValues] || '';

                    return copyPrevState;
                });
            });
            setErrors({});
        },
        [inputValues],
    );

    const resetErrors = useCallback(() => {
        FormActions.clearErrors(formID);
        FormActions.clearErrorFields(formID);
        setErrors({});
    }, [formID]);

    useImperativeHandle(forwardedRef, () => ({
        resetForm,
        resetErrors,
    }));

    const registerInput = useCallback<RegisterInput>(
        (inputID, shouldSubmitForm, inputProps) => {
            const newRef: MutableRefObject<InputComponentBaseProps> = inputRefs.current[inputID] ?? inputProps.ref ?? createRef();
            if (inputRefs.current[inputID] !== newRef) {
                inputRefs.current[inputID] = newRef;
            }
            if (inputProps.value !== undefined) {
                // eslint-disable-next-line react-compiler/react-compiler
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

            return {
                ...inputProps,
                ...(shouldSubmitForm && {
                    onSubmitEditing: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
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
                value: inputValues[inputID],
                // As the text input is controlled, we never set the defaultValue prop
                // as this is already happening by the value prop.
                defaultValue: undefined,
                onTouched: (event) => {
                    if (!inputProps.shouldSetTouchedOnBlurOnly) {
                        setTimeout(() => {
                            setTouchedInput(inputID);
                        }, VALIDATE_DELAY);
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
                            // We don't validate the form on blur in case the current screen is not focused
                            if (shouldValidateOnBlur && isFocusedRef.current) {
                                onValidate(inputValues, !hasServerError);
                            }
                        }, VALIDATE_DELAY);
                    }
                    inputProps.onBlur?.(event);
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
                        FormActions.setDraftValues(formID, {[inputKey]: value});
                    }
                    inputProps.onValueChange?.(value, inputKey);
                },
            };
        },
        [draftValues, inputValues, formState?.errorFields, errors, submit, setTouchedInput, shouldValidateOnBlur, onValidate, hasServerError, formID, shouldValidateOnChange],
    );
    const value = useMemo(() => ({registerInput}), [registerInput]);

    return (
        <FormContext.Provider value={value}>
            {/* eslint-disable react/jsx-props-no-spreading */}
            <FormWrapper
                {...rest}
                formID={formID}
                onSubmit={submit}
                inputRefs={inputRefs}
                errors={errors}
                enabledWhenOffline={enabledWhenOffline}
            >
                {typeof children === 'function' ? children({inputValues}) : children}
            </FormWrapper>
        </FormContext.Provider>
    );
}

FormProvider.displayName = 'Form';

export default forwardRef(FormProvider) as <TFormID extends OnyxFormKey>(props: FormProviderProps<TFormID> & RefAttributes<FormRef>) => ReactNode;

export type {FormProviderProps};
