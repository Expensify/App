import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as FormActions from '../libs/actions/FormActions';
import * as ErrorUtils from '../libs/ErrorUtils';
import styles from '../styles/styles';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollViewWithContext from './ScrollViewWithContext';

const propTypes = {
    /** A unique Onyx key identifying the form */
    formID: PropTypes.string.isRequired,

    /** Text to be displayed in the submit button */
    submitButtonText: PropTypes.string.isRequired,

    /** Controls the submit button's visibility */
    isSubmitButtonVisible: PropTypes.bool,

    /** Callback to validate the form */
    validate: PropTypes.func.isRequired,

    /** Callback to submit the form */
    onSubmit: PropTypes.func.isRequired,

    children: PropTypes.node.isRequired,

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

    /** Whether the ScrollView overflow content is scrollable.
     *   Set to true to avoid nested Picker components at the bottom of the Form from rendering the popup selector over Picker
     *   e.g. https://github.com/Expensify/App/issues/13909#issuecomment-1396859008
     */
    scrollToOverflowEnabled: PropTypes.bool,

    /** Whether ScrollWithContext should be used instead of regular ScrollView.
     *  Set to true when there's a nested Picker component in Form.
     */
    scrollContextEnabled: PropTypes.bool,

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
    scrollToOverflowEnabled: false,
    scrollContextEnabled: false,
};

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: {},
            inputValues: {},
        };

        this.formRef = React.createRef(null);
        this.inputRefs = {};
        this.touchedInputs = {};

        this.setTouchedInput = this.setTouchedInput.bind(this);
        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.preferredLocale === this.props.preferredLocale) {
            return;
        }

        // Update the error messages if the language changes
        this.validate(this.state.inputValues);
    }

    getErrorMessage() {
        const latestErrorMessage = ErrorUtils.getLatestErrorMessage(this.props.formState);
        return this.props.formState.error || (typeof latestErrorMessage === 'string' ? latestErrorMessage : '');
    }

    getFirstErroredInput() {
        const hasStateErrors = !_.isEmpty(this.state.errors);
        const hasErrorFields = !_.isEmpty(this.props.formState.errorFields);

        if (!hasStateErrors && !hasErrorFields) {
            return;
        }

        return _.first(_.keys(hasStateErrors ? this.state.erorrs : this.props.formState.errorFields));
    }

    /**
     * @param {String} inputID - The inputID of the input being touched
     */
    setTouchedInput(inputID) {
        this.touchedInputs[inputID] = true;
    }

    submit() {
        // Return early if the form is already submitting to avoid duplicate submission
        if (this.props.formState.isLoading) {
            return;
        }

        // Touches all form inputs so we can validate the entire form
        _.each(this.inputRefs, (inputRef, inputID) => (
            this.touchedInputs[inputID] = true
        ));

        // Validate form and return early if any errors are found
        if (!_.isEmpty(this.validate(this.state.inputValues))) {
            return;
        }

        // Call submit handler
        this.props.onSubmit(this.state.inputValues);
    }

    /**
     * @param {Object} values - An object containing the value of each inputID, e.g. {inputID1: value1, inputID2: value2}
     * @returns {Object} - An object containing the errors for each inputID, e.g. {inputID1: error1, inputID2: error2}
     */
    validate(values) {
        FormActions.setErrors(this.props.formID, null);
        FormActions.setErrorFields(this.props.formID, null);
        const validationErrors = this.props.validate(values);

        if (!_.isObject(validationErrors)) {
            throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
        }

        const errors = _.pick(validationErrors, (inputValue, inputID) => (
            Boolean(this.touchedInputs[inputID])
        ));

        if (!_.isEqual(errors, this.state.errors)) {
            this.setState({errors});
        }

        return errors;
    }

    /**
     * Loops over Form's children and automatically supplies Form props to them
     *
     * @param {Array} children - An array containing all Form children
     * @returns {React.Component}
     */
    childrenWrapperWithProps(children) {
        return React.Children.map(children, (child) => {
            // Just render the child if it is not a valid React element, e.g. text within a <Text> component
            if (!React.isValidElement(child)) {
                return child;
            }

            // Depth first traversal of the render tree as the input element is likely to be the last node
            if (child.props.children) {
                return React.cloneElement(child, {
                    children: this.childrenWrapperWithProps(child.props.children),
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
                    return this.childrenWrapperWithProps(nestedChildren);
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
            const defaultValue = this.props.draftValues[inputID] || child.props.defaultValue;

            // We want to initialize the input value if it's undefined
            if (_.isUndefined(this.state.inputValues[inputID])) {
                this.state.inputValues[inputID] = defaultValue;
            }

            if (!_.isUndefined(child.props.value)) {
                this.state.inputValues[inputID] = child.props.value;
            }

            const errorFields = lodashGet(this.props.formState, 'errorFields', {});
            const fieldErrorMessage = _.chain(errorFields[inputID])
                .keys()
                .sortBy()
                .reverse()
                .map(key => errorFields[inputID][key])
                .first()
                .value() || '';

            return React.cloneElement(child, {
                ref: node => this.inputRefs[inputID] = node,
                value: this.state.inputValues[inputID],
                errorText: this.state.errors[inputID] || fieldErrorMessage,
                onBlur: () => {
                    this.setTouchedInput(inputID);
                    this.validate(this.state.inputValues);
                },
                onInputChange: (value, key) => {
                    const inputKey = key || inputID;
                    this.setState(prevState => ({
                        inputValues: {
                            ...prevState.inputValues,
                            [inputKey]: value,
                        },
                    }), () => this.validate(this.state.inputValues));

                    if (child.props.shouldSaveDraft) {
                        FormActions.setDraftValues(this.props.formID, {[inputKey]: value});
                    }

                    if (child.props.onValueChange) {
                        child.props.onValueChange(value);
                    }
                },
            });
        });
    }

    render() {
        const scrollViewContent = safeAreaPaddingBottomStyle => (
            <View style={[this.props.style, safeAreaPaddingBottomStyle]}>
                {this.childrenWrapperWithProps(this.props.children)}
                {this.props.isSubmitButtonVisible && (
                <FormAlertWithSubmitButton
                    buttonText={this.props.submitButtonText}
                    isAlertVisible={_.size(this.state.errors) > 0 || Boolean(this.getErrorMessage()) || !_.isEmpty(this.props.formState.errorFields)}
                    isLoading={this.props.formState.isLoading}
                    message={_.isEmpty(this.props.formState.errorFields) ? this.getErrorMessage() : null}
                    onSubmit={this.submit}
                    onFixTheErrorsLinkPressed={() => {
                        const errors = !_.isEmpty(this.state.errors) ? this.state.errors : this.props.formState.errorFields;
                        const focusKey = _.find(_.keys(this.inputRefs), key => _.keys(errors).includes(key));
                        const focusInput = this.inputRefs[focusKey];
                        if (focusInput.focus && typeof focusInput.focus === 'function') {
                            focusInput.focus();
                        }

                        // We subtract 10 to scroll slightly above the input
                        if (focusInput.measureLayout && typeof focusInput.measureLayout === 'function') {
                            focusInput.measureLayout(this.form, (x, y) => this.form.scrollTo({y: y - 10, animated: false}));
                        }
                    }}
                    containerStyles={[styles.mh0, styles.mt5, styles.flex1]}
                    enabledWhenOffline={this.props.enabledWhenOffline}
                    isSubmitActionDangerous={this.props.isSubmitActionDangerous}
                />
                )}
            </View>
        );

        return (
            <SafeAreaConsumer>
                {({safeAreaPaddingBottomStyle}) => (this.props.scrollContextEnabled ? (
                    <ScrollViewWithContext
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        scrollToOverflowEnabled={this.props.scrollToOverflowEnabled}
                        ref={this.formRef}
                    >
                        {scrollViewContent(safeAreaPaddingBottomStyle)}
                    </ScrollViewWithContext>
                ) : (
                    <ScrollView
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        scrollToOverflowEnabled={this.props.scrollToOverflowEnabled}
                        ref={this.formRef}
                    >
                        {scrollViewContent(safeAreaPaddingBottomStyle)}
                    </ScrollView>
                ))}
            </SafeAreaConsumer>
        );
    }
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        formState: {
            key: props => props.formID,
        },
        draftValues: {
            key: props => `${props.formID}Draft`,
        },
    }),
)(Form);
