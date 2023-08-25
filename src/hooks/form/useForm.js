import React, {createRef, useCallback, useRef, useState} from 'react';
import _ from 'underscore';
import FormWrapper from './FormWrapper';
import Visibility from '../../libs/Visibility';
import * as FormActions from '../../libs/actions/FormActions';

/* eslint-disable react/jsx-props-no-spreading */
function useForm({validate, shouldValidateOnBlur = true, shouldValidateOnChange = true}) {
    const refs = useRef({});
    const touchedInputs = useRef({});
    const [inputValues, setInputValues] = useState({});
    const [errors, setErrors] = useState([]);

    const onValidate = (values) => {
        const validateErrors = validate(values);
        setErrors(validateErrors);
    };
    /**
     * @param {String} inputID - The inputID of the input being touched
     */
    const setTouchedInput = useCallback(
        (inputID) => {
            touchedInputs.current[inputID] = true;
        },
        [touchedInputs],
    );

    const registerInput = (inputID, props = {}) => {
        const newRef = props.ref || createRef();
        refs[inputID] = newRef;

        // We want to initialize the input value if it's undefined
        if (_.isUndefined(inputValues[inputID])) {
            inputValues[inputID] = props.defaultValue || '';
        }

        // We force the form to set the input value from the defaultValue props if there is a saved valid value
        if (props.shouldUseDefaultValue) {
            inputValues[inputID] = props.defaultValue;
        }

        if (!_.isUndefined(props.value)) {
            inputValues[inputID] = props.value;
        }

        return {
            ...props,
            ref: newRef,
            inputID,
            errorText: errors[inputID],
            value: inputValues[inputID],
            // As the text input is controlled, we never set the defaultValue prop
            // as this is already happening by the value prop.
            defaultValue: undefined,
            onTouched: (event) => {
                setTouchedInput(inputID);
                if (_.isFunction(props.onTouched)) {
                    props.onTouched(event);
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

                if (_.isFunction(props.onBlur)) {
                    props.onBlur(event);
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

                if (props.shouldSaveDraft) {
                    FormActions.setDraftValues(props.formID, {[inputKey]: value});
                }

                if (_.isFunction(props.onValueChange)) {
                    props.onValueChange(value, inputKey);
                }
            },
        };
    };

    const Form = useCallback((props) => {
        const {children, ...rest} = props;
        return <FormWrapper {...rest}>{children}</FormWrapper>;
    }, []);

    return {registerInput, Form};
}

export default useForm;
