import React, {createRef, useCallback, useRef, useState} from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Visibility from '../../libs/Visibility';
import * as FormActions from '../../libs/actions/FormActions';
import FormContext from './FormContext';
import FormWrapper from './FormWrapper';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {withNetwork} from '../../components/OnyxProvider';
import stylePropTypes from '../../styles/stylePropTypes';
import networkPropTypes from '../../components/networkPropTypes';

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

    /** Should the button be enabled when offline */
    enabledWhenOffline: PropTypes.bool,

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous: PropTypes.bool,

    /** Whether ScrollWithContext should be used instead of regular ScrollView.
     *  Set to true when there's a nested Picker component in Form.
     */
    scrollContextEnabled: PropTypes.bool,

    /** Container styles */
    style: stylePropTypes,

    /** Custom content to display in the footer after submit button */
    footerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isSubmitButtonVisible: true,
    formState: {
        isLoading: false,
    },
    enabledWhenOffline: false,
    isSubmitActionDangerous: false,
    scrollContextEnabled: false,
    footerContent: null,
    style: [],
    validate: () => ({}),
};

function FormProvider({validate, shouldValidateOnBlur, shouldValidateOnChange, children, formState, network, enabledWhenOffline, onSubmit, ...rest}) {
    const inputRefs = useRef({});
    const touchedInputs = useRef({});
    const [inputValues, setInputValues] = useState({});
    const [errors, setErrors] = useState([]);

    const onValidate = useCallback(
        (values) => {
            const validateErrors = validate(values);
            setErrors(validateErrors);
        },
        [validate],
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

        // Touches all form inputs so we can validate the entire form
        _.each(inputRefs.current, (inputRef, inputID) => (touchedInputs.current[inputID] = true));

        // Validate form and return early if any errors are found
        if (!_.isEmpty(onValidate(inputValues))) {
            return;
        }

        // Do not submit form if network is offline and the form is not enabled when offline
        if (network.isOffline && !enabledWhenOffline) {
            return;
        }
        // Call submit handler
        onSubmit(inputValues);
    }, [enabledWhenOffline, formState.isLoading, inputValues, network.isOffline, onSubmit, onValidate]);

    const registerInput = useCallback(
        (inputID, propsToParse = {}) => {
            const newRef = propsToParse.ref || createRef();
            inputRefs[inputID] = newRef;

            // We want to initialize the input value if it's undefined
            if (_.isUndefined(inputValues[inputID])) {
                inputValues[inputID] = propsToParse.defaultValue || '';
            }

            // We force the form to set the input value from the defaultValue props if there is a saved valid value
            if (propsToParse.shouldUseDefaultValue) {
                inputValues[inputID] = propsToParse.defaultValue;
            }

            if (!_.isUndefined(propsToParse.value)) {
                inputValues[inputID] = propsToParse.value;
            }

            return {
                ...propsToParse,
                ref: newRef,
                inputID,
                key: propsToParse.key || inputID,
                errorText: errors[inputID],
                value: inputValues[inputID],
                // As the text input is controlled, we never set the defaultValue prop
                // as this is already happening by the value prop.
                defaultValue: undefined,
                onTouched: (event) => {
                    setTouchedInput(inputID);
                    if (_.isFunction(propsToParse.onTouched)) {
                        propsToParse.onTouched(event);
                    }
                },
                onBlur: (event) => {
                    // Only run validation when user proactively blurs the input.
                    if (Visibility.isVisible() && Visibility.hasFocus()) {
                        // We delay the validation in order to prevent Checkbox loss of focus when
                        // the user are focusing a TextInput and proceeds to toggle a CheckBox in
                        // web and mobile web platforms.
                        setTimeout(() => {
                            setTouchedInput(inputID);
                            if (shouldValidateOnBlur) {
                                onValidate(inputValues);
                            }
                        }, 200);
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
                        FormActions.setDraftValues(propsToParse.formID, {[inputKey]: value});
                    }

                    if (_.isFunction(propsToParse.onValueChange)) {
                        propsToParse.onValueChange(value, inputKey);
                    }
                },
            };
        },
        [errors, inputValues, onValidate, setTouchedInput, shouldValidateOnBlur, shouldValidateOnChange],
    );

    return (
        <FormContext.Provider value={{registerInput}}>
            {/* eslint-disable react/jsx-props-no-spreading */}
            <FormWrapper
                {...rest}
                onSubmit={submit}
            >
                {children}
            </FormWrapper>
        </FormContext.Provider>
    );
}

FormProvider.displayName = 'Form';
FormProvider.propTypes = propTypes;
FormProvider.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        formState: {
            key: (props) => props.formID,
        },
    }),
)(FormProvider);
