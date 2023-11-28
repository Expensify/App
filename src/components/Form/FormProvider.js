import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {createRef, useCallback, useMemo, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import compose from '@libs/compose';
import * as ValidationUtils from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import stylePropTypes from '@styles/stylePropTypes';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import FormContext from './FormContext';
import FormWrapper from './FormWrapper';

const propTypes = {
    /** A unique Onyx key identifying the form */
    formID: PropTypes.string.isRequired,

    /** Text to be displayed in the submit button */
    submitButtonText: PropTypes.string.isRequired,

    /** Controls the submit button's visibility */
    isSubmitButtonVisible: PropTypes.bool,

    /** Callback to validate the form */
    validate: PropTypes.func,

    /** Callback to submit the form */
    onSubmit: PropTypes.func.isRequired,

    /** Children to render. */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /* Onyx Props */

    /** Contains the form state that must be accessed outside of the component */
    formState: PropTypes.shape({
        /** Controls the loading state of the form */
        isLoading: PropTypes.bool,

        /** Server side errors keyed by microtime */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /** Contains draft values for each input in the form */
    draftValues: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number, PropTypes.objectOf(Date)])),

    /** Should the button be enabled when offline */
    enabledWhenOffline: PropTypes.bool,

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous: PropTypes.bool,

    /** Whether ScrollWithContext should be used instead of regular ScrollView. Set to true when there's a nested Picker component in Form. */
    scrollContextEnabled: PropTypes.bool,

    /** Container styles */
    style: stylePropTypes,

    /** Custom content to display in the footer after submit button */
    footerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Should validate function be called when input loose focus */
    shouldValidateOnBlur: PropTypes.bool,

    /** Should validate function be called when the value of the input is changed */
    shouldValidateOnChange: PropTypes.bool,
};

// In order to prevent Checkbox focus loss when the user are focusing a TextInput and proceeds to toggle a CheckBox in web and mobile web.
// 200ms delay was chosen as a result of empirical testing.
// More details: https://github.com/Expensify/App/pull/16444#issuecomment-1482983426
const VALIDATE_DELAY = 200;

const defaultProps = {
    isSubmitButtonVisible: true,
    formState: {
        isLoading: false,
    },
    draftValues: {},
    enabledWhenOffline: false,
    isSubmitActionDangerous: false,
    scrollContextEnabled: false,
    footerContent: null,
    style: [],
    validate: () => {},
    shouldValidateOnBlur: true,
    shouldValidateOnChange: true,
};

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

function FormProvider({validate, formID, shouldValidateOnBlur, shouldValidateOnChange, children, formState, network, enabledWhenOffline, draftValues, onSubmit, ...rest}) {
    const inputRefs = useRef({});
    const touchedInputs = useRef({});
    const [inputValues, setInputValues] = useState({});
    const [errors, setErrors] = useState({});
    const hasServerError = useMemo(() => Boolean(formState) && !_.isEmpty(formState.errors), [formState]);

    const onValidate = useCallback(
        (values, shouldClearServerError = true) => {
            const trimmedStringValues = ValidationUtils.prepareValues(values);

            if (shouldClearServerError) {
                FormActions.setErrors(formID, null);
            }
            FormActions.setErrorFields(formID, null);

            const validateErrors = validate(values) || {};

            // Validate the input for html tags. It should supercede any other error
            _.each(trimmedStringValues, (inputValue, inputID) => {
                // If the input value is empty OR is non-string, we don't need to validate it for HTML tags
                if (!inputValue || !_.isString(inputValue)) {
                    return;
                }
                const foundHtmlTagIndex = inputValue.search(CONST.VALIDATE_FOR_HTML_TAG_REGEX);
                const leadingSpaceIndex = inputValue.search(CONST.VALIDATE_FOR_LEADINGSPACES_HTML_TAG_REGEX);

                // Return early if there are no HTML characters
                if (leadingSpaceIndex === -1 && foundHtmlTagIndex === -1) {
                    return;
                }

                const matchedHtmlTags = inputValue.match(CONST.VALIDATE_FOR_HTML_TAG_REGEX);
                let isMatch = _.some(CONST.WHITELISTED_TAGS, (r) => r.test(inputValue));
                // Check for any matches that the original regex (foundHtmlTagIndex) matched
                if (matchedHtmlTags) {
                    // Check if any matched inputs does not match in WHITELISTED_TAGS list and return early if needed.
                    for (let i = 0; i < matchedHtmlTags.length; i++) {
                        const htmlTag = matchedHtmlTags[i];
                        isMatch = _.some(CONST.WHITELISTED_TAGS, (r) => r.test(htmlTag));
                        if (!isMatch) {
                            break;
                        }
                    }
                }
                // Add a validation error here because it is a string value that contains HTML characters
                validateErrors[inputID] = 'common.error.invalidCharacter';
            });

            if (!_.isObject(validateErrors)) {
                throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
            }

            const touchedInputErrors = _.pick(validateErrors, (inputValue, inputID) => Boolean(touchedInputs.current[inputID]));

            if (!_.isEqual(errors, touchedInputErrors)) {
                setErrors(touchedInputErrors);
            }

            return touchedInputErrors;
        },
        [errors, formID, validate],
    );

    /**
     * @param {String} inputID - The inputID of the input being touched
     */
    const setTouchedInput = useCallback(
        (inputID) => {
            touchedInputs.current[inputID] = true;
        },
        [touchedInputs],
    );

    const submit = useCallback(() => {
        // Return early if the form is already submitting to avoid duplicate submission
        if (formState.isLoading) {
            return;
        }

        // Prepare values before submitting
        const trimmedStringValues = ValidationUtils.prepareValues(inputValues);

        // Touches all form inputs so we can validate the entire form
        _.each(inputRefs.current, (inputRef, inputID) => (touchedInputs.current[inputID] = true));

        // Validate form and return early if any errors are found
        if (!_.isEmpty(onValidate(trimmedStringValues))) {
            return;
        }

        // Do not submit form if network is offline and the form is not enabled when offline
        if (network.isOffline && !enabledWhenOffline) {
            return;
        }

        onSubmit(trimmedStringValues);
    }, [enabledWhenOffline, formState.isLoading, inputValues, network.isOffline, onSubmit, onValidate]);

    const registerInput = useCallback(
        (inputID, propsToParse = {}) => {
            const newRef = inputRefs.current[inputID] || propsToParse.ref || createRef();
            if (inputRefs.current[inputID] !== newRef) {
                inputRefs.current[inputID] = newRef;
            }

            if (!_.isUndefined(propsToParse.value)) {
                inputValues[inputID] = propsToParse.value;
            } else if (propsToParse.shouldSaveDraft && !_.isUndefined(draftValues[inputID]) && _.isUndefined(inputValues[inputID])) {
                inputValues[inputID] = draftValues[inputID];
            } else if (propsToParse.shouldUseDefaultValue && _.isUndefined(inputValues[inputID])) {
                // We force the form to set the input value from the defaultValue props if there is a saved valid value
                inputValues[inputID] = propsToParse.defaultValue;
            } else if (_.isUndefined(inputValues[inputID])) {
                // We want to initialize the input value if it's undefined
                inputValues[inputID] = _.isUndefined(propsToParse.defaultValue) ? getInitialValueByType(propsToParse.valueType) : propsToParse.defaultValue;
            }

            const errorFields = lodashGet(formState, 'errorFields', {});
            const fieldErrorMessage =
                _.chain(errorFields[inputID])
                    .keys()
                    .sortBy()
                    .reverse()
                    .map((key) => errorFields[inputID][key])
                    .first()
                    .value() || '';

            return {
                ...propsToParse,
                ref:
                    typeof propsToParse.ref === 'function'
                        ? (node) => {
                              propsToParse.ref(node);
                              newRef.current = node;
                          }
                        : newRef,
                inputID,
                key: propsToParse.key || inputID,
                errorText: errors[inputID] || fieldErrorMessage,
                value: inputValues[inputID],
                // As the text input is controlled, we never set the defaultValue prop
                // as this is already happening by the value prop.
                defaultValue: undefined,
                onTouched: (event) => {
                    if (!propsToParse.shouldSetTouchedOnBlurOnly) {
                        setTimeout(() => {
                            setTouchedInput(inputID);
                        }, VALIDATE_DELAY);
                    }
                    if (_.isFunction(propsToParse.onTouched)) {
                        propsToParse.onTouched(event);
                    }
                },
                onPress: (event) => {
                    if (!propsToParse.shouldSetTouchedOnBlurOnly) {
                        setTimeout(() => {
                            setTouchedInput(inputID);
                        }, VALIDATE_DELAY);
                    }
                    if (_.isFunction(propsToParse.onPress)) {
                        propsToParse.onPress(event);
                    }
                },
                onPressOut: (event) => {
                    // To prevent validating just pressed inputs, we need to set the touched input right after
                    // onValidate and to do so, we need to delays setTouchedInput of the same amount of time
                    // as the onValidate is delayed
                    if (!propsToParse.shouldSetTouchedOnBlurOnly) {
                        setTimeout(() => {
                            setTouchedInput(inputID);
                        }, VALIDATE_DELAY);
                    }
                    if (_.isFunction(propsToParse.onPressIn)) {
                        propsToParse.onPressIn(event);
                    }
                },
                onBlur: (event) => {
                    // Only run validation when user proactively blurs the input.
                    if (Visibility.isVisible() && Visibility.hasFocus()) {
                        const relatedTargetId = lodashGet(event, 'nativeEvent.relatedTarget.id');
                        // We delay the validation in order to prevent Checkbox loss of focus when
                        // the user is focusing a TextInput and proceeds to toggle a CheckBox in
                        // web and mobile web platforms.

                        setTimeout(() => {
                            if (relatedTargetId && _.includes([CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID, CONST.OVERLAY.TOP_BUTTON_NATIVE_ID, CONST.BACK_BUTTON_NATIVE_ID], relatedTargetId)) {
                                return;
                            }
                            setTouchedInput(inputID);
                            if (shouldValidateOnBlur) {
                                onValidate(inputValues, !hasServerError);
                            }
                        }, VALIDATE_DELAY);
                    }

                    if (_.isFunction(propsToParse.onBlur)) {
                        propsToParse.onBlur(event);
                    }
                },
                onInputChange: (value, key) => {
                    const inputKey = key || inputID;
                    setInputValues((prevState) => {
                        const newState = {
                            ...prevState,
                            [inputKey]: value,
                        };

                        if (shouldValidateOnChange) {
                            onValidate(newState);
                        }
                        return newState;
                    });

                    if (propsToParse.shouldSaveDraft) {
                        FormActions.setDraftValues(formID, {[inputKey]: value});
                    }

                    if (_.isFunction(propsToParse.onValueChange)) {
                        propsToParse.onValueChange(value, inputKey);
                    }
                },
            };
        },
        [draftValues, formID, errors, formState, hasServerError, inputValues, onValidate, setTouchedInput, shouldValidateOnBlur, shouldValidateOnChange],
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
                {_.isFunction(children) ? children({inputValues}) : children}
            </FormWrapper>
        </FormContext.Provider>
    );
}

FormProvider.displayName = 'Form';
FormProvider.propTypes = propTypes;
FormProvider.defaultProps = defaultProps;

export default compose(
    withNetwork(),
    withOnyx({
        formState: {
            key: (props) => props.formID,
        },
        draftValues: {
            key: (props) => `${props.formID}Draft`,
        },
    }),
)(FormProvider);
