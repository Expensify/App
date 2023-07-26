import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import lodashGet from 'lodash/get';
import {Keyboard, ScrollView, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as FormActions from '../libs/actions/FormActions';
import * as ErrorUtils from '../libs/ErrorUtils';
import styles from '../styles/styles';
import CONST from '../CONST';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import FormSubmit from './FormSubmit';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollViewWithContext from './ScrollViewWithContext';
import stylePropTypes from '../styles/stylePropTypes';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';

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
    // eslint-disable-next-line react/forbid-prop-types
    draftValues: PropTypes.object,

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
        errors: null,
    },
    draftValues: {},
    enabledWhenOffline: false,
    isSubmitActionDangerous: false,
    scrollContextEnabled: false,
    footerContent: null,
    style: [],
    validate: () => ({}),
};

function Form(props) {
    const [errors, setErrors] = useState({});
    const [inputValues, setInputValues] = useState({...props.draftValues});
    const formRef = useRef(null);
    const formContentRef = useRef(null);
    const inputRefs = useRef({});
    const touchedInputs = useRef({});
    const isFirstRender = useRef(true);
    const lastValidatedValues = useRef({...props.draftValues});

    const {validate, onSubmit, children} = props;

    /**
     * @param {Object} values - An object containing the value of each inputID, e.g. {inputID1: value1, inputID2: value2}
     * @returns {Object} - An object containing the errors for each inputID, e.g. {inputID1: error1, inputID2: error2}
     */
    const onValidate = useCallback(
        (values) => {
            const trimmedStringValues = {};
            _.each(values, (inputValue, inputID) => {
                if (_.isString(inputValue)) {
                    trimmedStringValues[inputID] = inputValue.trim();
                } else {
                    trimmedStringValues[inputID] = inputValue;
                }
            });

            FormActions.setErrors(props.formID, null);
            FormActions.setErrorFields(props.formID, null);

            // Run any validations passed as a prop
            const validationErrors = validate(trimmedStringValues);

            // Validate the input for html tags. It should supercede any other error
            _.each(trimmedStringValues, (inputValue, inputID) => {
                // Return early if there is no value OR the value is not a string OR there are no HTML characters
                if (!inputValue || !_.isString(inputValue) || inputValue.search(CONST.VALIDATE_FOR_HTML_TAG_REGEX) === -1) {
                    return;
                }

                // Add a validation error here because it is a string value that contains HTML characters
                validationErrors[inputID] = 'common.error.invalidCharacter';
            });

            if (!_.isObject(validationErrors)) {
                throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
            }

            const touchedInputErrors = _.pick(validationErrors, (inputValue, inputID) => Boolean(touchedInputs.current[inputID]));

            if (!_.isEqual(errors, touchedInputErrors)) {
                setErrors(touchedInputErrors);
            }

            lastValidatedValues.current = values;

            return touchedInputErrors;
        },
        [errors, touchedInputs, props.formID, validate],
    );

    useEffect(() => {
        // We want to skip Form validation on initial render.
        // This also avoids a bug where we immediately clear server errors when the loading indicator unmounts and Form remounts with server errors.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        onValidate(inputValues);

        // eslint-disable-next-line react-hooks/exhaustive-deps -- we just want to revalidate the form on update if the preferred locale changed on another device so that errors get translated
    }, [props.preferredLocale]);

    const errorMessage = useMemo(() => {
        const latestErrorMessage = ErrorUtils.getLatestErrorMessage(props.formState);
        return typeof latestErrorMessage === 'string' ? latestErrorMessage : '';
    }, [props.formState]);

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
        if (props.formState.isLoading) {
            return;
        }

        // Touches all form inputs so we can validate the entire form
        _.each(inputRefs.current, (inputRef, inputID) => (touchedInputs.current[inputID] = true));

        // Validate form and return early if any errors are found
        if (!_.isEmpty(onValidate(inputValues))) {
            return;
        }

        // Do not submit form if network is offline and the form is not enabled when offline
        if (props.network.isOffline && !props.enabledWhenOffline) {
            return;
        }

        // Call submit handler
        onSubmit(inputValues);
    }, [props.formState, onSubmit, inputRefs, inputValues, onValidate, touchedInputs, props.network.isOffline, props.enabledWhenOffline]);

    /**
     * Loops over Form's children and automatically supplies Form props to them
     *
     * @param {Array | Function | Node} children - An array containing all Form children
     * @returns {React.Component}
     */
    const childrenWrapperWithProps = useCallback(
        (childNodes) => {
            const childrenElements = React.Children.map(childNodes, (child) => {
                // Just render the child if it is not a valid React element, e.g. text within a <Text> component
                if (!React.isValidElement(child)) {
                    return child;
                }

                // Depth first traversal of the render tree as the input element is likely to be the last node
                if (child.props.children) {
                    return React.cloneElement(child, {
                        children: childrenWrapperWithProps(child.props.children),
                    });
                }

                // Look for any inputs nested in a custom component, e.g AddressForm or IdentityForm
                if (_.isFunction(child.type)) {
                    const childNode = new child.type(child.props);

                    // If the custom component has a render method, use it to get the nested children
                    const nestedChildren = _.isFunction(childNode.render) ? childNode.render() : childNode;

                    // Render the custom component if it's a valid React element
                    // If the custom component has nested children, Loop over them and supply From props
                    if (React.isValidElement(nestedChildren) || lodashGet(nestedChildren, 'props.children')) {
                        return childrenWrapperWithProps(nestedChildren);
                    }

                    // Just render the child if it's custom component not a valid React element, or if it hasn't children
                    return child;
                }

                // We check if the child has the inputID prop.
                // We don't want to pass form props to non form components, e.g. View, Text, etc
                if (!child.props.inputID) {
                    return child;
                }

                // We clone the child passing down all form props
                const inputID = child.props.inputID;
                let defaultValue;

                // We need to make sure that checkboxes have correct
                // value assigned from the list of draft values
                // https://github.com/Expensify/App/issues/16885#issuecomment-1520846065
                if (_.isBoolean(props.draftValues[inputID])) {
                    defaultValue = props.draftValues[inputID];
                } else {
                    defaultValue = props.draftValues[inputID] || child.props.defaultValue;
                }

                // We want to initialize the input value if it's undefined
                if (_.isUndefined(inputValues[inputID])) {
                    inputValues[inputID] = defaultValue;
                }

                // We force the form to set the input value from the defaultValue props if there is a saved valid value
                if (child.props.shouldUseDefaultValue) {
                    inputValues[inputID] = child.props.defaultValue;
                }

                if (!_.isUndefined(child.props.value)) {
                    inputValues[inputID] = child.props.value;
                }

                const errorFields = lodashGet(props.formState, 'errorFields', {});
                const fieldErrorMessage =
                    _.chain(errorFields[inputID])
                        .keys()
                        .sortBy()
                        .reverse()
                        .map((key) => errorFields[inputID][key])
                        .first()
                        .value() || '';

                return React.cloneElement(child, {
                    ref: (node) => {
                        inputRefs.current[inputID] = node;

                        const {ref} = child;
                        if (_.isFunction(ref)) {
                            ref(node);
                        }
                    },
                    value: inputValues[inputID],
                    errorText: errors[inputID] || fieldErrorMessage,
                    onBlur: (event) => {
                        // We delay the validation in order to prevent Checkbox loss of focus when
                        // the user are focusing a TextInput and proceeds to toggle a CheckBox in
                        // web and mobile web platforms.
                        setTimeout(() => {
                            setTouchedInput(inputID);

                            // To prevent server errors from being cleared inadvertently, we only run validation on blur if any form values have changed since the last validation/submit
                            const shouldValidate = !_.isEqual(inputValues, lastValidatedValues.current);
                            if (shouldValidate) {
                                onValidate(inputValues);
                            }
                        }, 200);

                        if (_.isFunction(child.props.onBlur)) {
                            child.props.onBlur(event);
                        }
                    },
                    onTouched: () => {
                        setTouchedInput(inputID);
                    },
                    onInputChange: (value, key) => {
                        const inputKey = key || inputID;
                        setInputValues((prevState) => {
                            const newState = {
                                ...prevState,
                                [inputKey]: value,
                            };
                            onValidate(newState);
                            return newState;
                        });

                        if (child.props.shouldSaveDraft) {
                            FormActions.setDraftValues(props.formID, {[inputKey]: value});
                        }

                        if (child.props.onValueChange) {
                            child.props.onValueChange(value);
                        }
                    },
                });
            });

            // We need to verify that all references and values are still actual.
            // We should not store it when e.g. some input has been unmounted
            _.each(inputRefs.current, (inputRef, inputID) => {
                if (inputRef) {
                    return;
                }

                delete inputRefs.current[inputID];

                setInputValues((prevState) => {
                    const copyPrevState = _.clone(prevState);

                    delete copyPrevState[inputID];

                    return copyPrevState;
                });
            });

            return childrenElements;
        },
        [errors, inputRefs, inputValues, onValidate, props.draftValues, props.formID, props.formState, setTouchedInput],
    );

    const scrollViewContent = useCallback(
        (safeAreaPaddingBottomStyle) => (
            <FormSubmit
                ref={formContentRef}
                style={StyleSheet.flatten([props.style, safeAreaPaddingBottomStyle])}
                onSubmit={submit}
            >
                {childrenWrapperWithProps(_.isFunction(children) ? children({inputValues}) : children)}
                {props.isSubmitButtonVisible && (
                    <FormAlertWithSubmitButton
                        buttonText={props.submitButtonText}
                        isAlertVisible={_.size(errors) > 0 || Boolean(errorMessage) || !_.isEmpty(props.formState.errorFields)}
                        isLoading={props.formState.isLoading}
                        message={_.isEmpty(props.formState.errorFields) ? errorMessage : null}
                        onSubmit={submit}
                        footerContent={props.footerContent}
                        onFixTheErrorsLinkPressed={() => {
                            const errorFields = !_.isEmpty(errors) ? errors : props.formState.errorFields;
                            const focusKey = _.find(_.keys(inputRefs.current), (key) => _.keys(errorFields).includes(key));
                            const focusInput = inputRefs.current[focusKey];

                            // Dismiss the keyboard for non-text fields by checking if the component has the isFocused method, as only TextInput has this method.
                            if (typeof focusInput.isFocused !== 'function') {
                                Keyboard.dismiss();
                            }

                            // We subtract 10 to scroll slightly above the input
                            if (focusInput.measureLayout && typeof focusInput.measureLayout === 'function') {
                                // We measure relative to the content root, not the scroll view, as that gives
                                // consistent results across mobile and web
                                focusInput.measureLayout(formContentRef.current, (x, y) => formRef.current.scrollTo({y: y - 10, animated: false}));
                            }

                            // Focus the input after scrolling, as on the Web it gives a slightly better visual result
                            if (focusInput.focus && typeof focusInput.focus === 'function') {
                                focusInput.focus();
                            }
                        }}
                        containerStyles={[styles.mh0, styles.mt5, styles.flex1]}
                        enabledWhenOffline={props.enabledWhenOffline}
                        isSubmitActionDangerous={props.isSubmitActionDangerous}
                        disablePressOnEnter
                    />
                )}
            </FormSubmit>
        ),
        [
            childrenWrapperWithProps,
            errors,
            formContentRef,
            formRef,
            errorMessage,
            inputRefs,
            inputValues,
            submit,
            props.style,
            children,
            props.formState,
            props.footerContent,
            props.enabledWhenOffline,
            props.isSubmitActionDangerous,
            props.isSubmitButtonVisible,
            props.submitButtonText,
        ],
    );

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) =>
                props.scrollContextEnabled ? (
                    <ScrollViewWithContext
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        ref={formRef}
                    >
                        {scrollViewContent(safeAreaPaddingBottomStyle)}
                    </ScrollViewWithContext>
                ) : (
                    <ScrollView
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        ref={formRef}
                    >
                        {scrollViewContent(safeAreaPaddingBottomStyle)}
                    </ScrollView>
                )
            }
        </SafeAreaConsumer>
    );
}

Form.displayName = 'Form';
Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        formState: {
            key: (props) => props.formID,
        },
        draftValues: {
            key: (props) => `${props.formID}Draft`,
        },
    }),
)(Form);
