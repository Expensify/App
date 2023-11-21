import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import FormUtils from '@libs/FormUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import stylePropTypes from '@styles/stylePropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import FormSubmit from './FormSubmit';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollViewWithContext from './ScrollViewWithContext';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

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

    /** Whether the validate() method should run on input changes */
    shouldValidateOnChange: PropTypes.bool,

    /** Whether the validate() method should run on blur */
    shouldValidateOnBlur: PropTypes.bool,

    /** Whether ScrollWithContext should be used instead of regular ScrollView.
     *  Set to true when there's a nested Picker component in Form.
     */
    scrollContextEnabled: PropTypes.bool,

    /** Container styles */
    style: stylePropTypes,

    /** Submit button container styles */
    // eslint-disable-next-line react/forbid-prop-types
    submitButtonStyles: PropTypes.arrayOf(PropTypes.object),

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
    draftValues: {},
    enabledWhenOffline: false,
    isSubmitActionDangerous: false,
    scrollContextEnabled: false,
    shouldValidateOnChange: true,
    shouldValidateOnBlur: true,
    footerContent: null,
    style: [],
    submitButtonStyles: [],
    validate: () => ({}),
};

function Form(props) {
    const styles = useThemeStyles();
    const [errors, setErrors] = useState({});
    const [inputValues, setInputValues] = useState(() => ({...props.draftValues}));
    const formRef = useRef(null);
    const formContentRef = useRef(null);
    const inputRefs = useRef({});
    const touchedInputs = useRef({});
    const focusedInput = useRef(null);
    const isFirstRender = useRef(true);

    const {validate, onSubmit, children} = props;

    const hasServerError = useMemo(() => Boolean(props.formState) && !_.isEmpty(props.formState.errors), [props.formState]);

    /**
     * @param {Object} values - An object containing the value of each inputID, e.g. {inputID1: value1, inputID2: value2}
     * @returns {Object} - An object containing the errors for each inputID, e.g. {inputID1: error1, inputID2: error2}
     */
    const onValidate = useCallback(
        (values, shouldClearServerError = true) => {
            // Trim all string values
            const trimmedStringValues = ValidationUtils.prepareValues(values);

            if (shouldClearServerError) {
                FormActions.setErrors(props.formID, null);
            }
            FormActions.setErrorFields(props.formID, null);

            // Run any validations passed as a prop
            const validationErrors = validate(trimmedStringValues);

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

                if (isMatch && leadingSpaceIndex === -1) {
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

            return touchedInputErrors;
        },
        [props.formID, validate, errors],
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

        // Trim all string values
        const trimmedStringValues = ValidationUtils.prepareValues(inputValues);

        // Touches all form inputs so we can validate the entire form
        _.each(inputRefs.current, (inputRef, inputID) => (touchedInputs.current[inputID] = true));

        // Validate form and return early if any errors are found
        if (!_.isEmpty(onValidate(trimmedStringValues))) {
            return;
        }

        // Do not submit form if network is offline and the form is not enabled when offline
        if (props.network.isOffline && !props.enabledWhenOffline) {
            return;
        }

        // Call submit handler
        onSubmit(trimmedStringValues);
    }, [props.formState.isLoading, props.network.isOffline, props.enabledWhenOffline, inputValues, onValidate, onSubmit]);

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
                    // eslint-disable-next-line es/no-nullish-coalescing-operators
                    inputValues[inputID] = defaultValue ?? '';
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
                    // As the text input is controlled, we never set the defaultValue prop
                    // as this is already happening by the value prop.
                    defaultValue: undefined,
                    errorText: errors[inputID] || fieldErrorMessage,
                    onFocus: (event) => {
                        focusedInput.current = inputID;
                        if (_.isFunction(child.props.onFocus)) {
                            child.props.onFocus(event);
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
                                if (props.shouldValidateOnBlur) {
                                    onValidate(inputValues, !hasServerError);
                                }
                            }, 200);
                        }

                        if (_.isFunction(child.props.onBlur)) {
                            child.props.onBlur(event);
                        }
                    },
                    onTouched: () => {
                        setTouchedInput(inputID);
                    },
                    onInputChange: (value, key) => {
                        const inputKey = key || inputID;

                        if (focusedInput.current && focusedInput.current !== inputKey) {
                            setTouchedInput(focusedInput.current);
                        }

                        setInputValues((prevState) => {
                            const newState = {
                                ...prevState,
                                [inputKey]: value,
                            };

                            if (props.shouldValidateOnChange) {
                                onValidate(newState);
                            }
                            return newState;
                        });

                        if (child.props.shouldSaveDraft) {
                            FormActions.setDraftValues(props.formID, {[inputKey]: value});
                        }

                        if (child.props.onValueChange) {
                            child.props.onValueChange(value, inputKey);
                        }
                    },
                });
            });

            return childrenElements;
        },
        [
            errors,
            inputRefs,
            inputValues,
            onValidate,
            props.draftValues,
            props.formID,
            props.formState,
            setTouchedInput,
            props.shouldValidateOnBlur,
            props.shouldValidateOnChange,
            hasServerError,
        ],
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
                        containerStyles={[styles.mh0, styles.mt5, styles.flex1, ...props.submitButtonStyles]}
                        enabledWhenOffline={props.enabledWhenOffline}
                        isSubmitActionDangerous={props.isSubmitActionDangerous}
                        disablePressOnEnter
                    />
                )}
            </FormSubmit>
        ),

        [
            props.style,
            props.isSubmitButtonVisible,
            props.submitButtonText,
            props.formState.errorFields,
            props.formState.isLoading,
            props.footerContent,
            props.submitButtonStyles,
            props.enabledWhenOffline,
            props.isSubmitActionDangerous,
            submit,
            childrenWrapperWithProps,
            children,
            inputValues,
            errors,
            errorMessage,
            styles.mh0,
            styles.mt5,
            styles.flex1,
        ],
    );

    useEffect(() => {
        _.each(inputRefs.current, (inputRef, inputID) => {
            if (inputRef) {
                return;
            }

            delete inputRefs.current[inputID];
            delete touchedInputs.current[inputID];

            setInputValues((prevState) => {
                const copyPrevState = _.clone(prevState);

                delete copyPrevState[inputID];

                return copyPrevState;
            });
        });
        // We need to verify that all references and values are still actual.
        // We should not store it when e.g. some input has been unmounted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children]);

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
            key: (props) => FormUtils.getDraftKey(props.formID),
        },
    }),
)(Form);
