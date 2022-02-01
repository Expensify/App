import React from 'react';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as FormActions from '../libs/actions/FormActions';
import styles from '../styles/styles';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';

const propTypes = {
    /** A unique Onyx key identifying the form */
    formID: PropTypes.string.isRequired,

    /** Text to be displayed in the submit button */
    submitButtonText: PropTypes.string.isRequired,

    /** Callback to validate the form */
    validate: PropTypes.func.isRequired,

    /** Callback to submit the form */
    onSubmit: PropTypes.func.isRequired,

    children: PropTypes.node.isRequired,

    /* Onyx Props */

    /** Contains the form state that must be accessed outside of the component */
    formState: PropTypes.shape({

        /** Controls the loading state of the form */
        isSubmitting: PropTypes.bool,

        /** Server side error message */
        serverErrorMessage: PropTypes.string,
    }),

    /** Contains draft values for each input in the form */
    // eslint-disable-next-line react/forbid-prop-types
    draftValues: PropTypes.object,

    ...withLocalizePropTypes,
};

const defaultProps = {
    formState: {
        isSubmitting: false,
        serverErrorMessage: '',
    },
    draftValues: {},
};

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: {},
        };

        this.inputRefs = {};
        this.inputValues = {};
        this.touchedInputs = {};

        this.setTouchedInput = this.setTouchedInput.bind(this);
        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
    }

    /**
     * @param {String} inputID - The inputID of the input being touched
     */
    setTouchedInput(inputID) {
        this.touchedInputs[inputID] = true;
    }

    submit() {
        // Return early if the form is already submitting to avoid duplicate submission
        if (this.props.formState.isSubmitting) {
            return;
        }

        // Touches all form inputs so we can validate the entire form
        _.each(this.inputRefs, (inputRef, inputID) => (
            this.touchedInputs[inputID] = true
        ));

        // Validate form and return early if any errors are found
        if (!_.isEmpty(this.validate(this.inputValues))) {
            return;
        }

        // Set loading state and call submit handler
        FormActions.setIsSubmitting(this.props.formID, true);
        this.props.onSubmit(values);
    }

    /**
     * @param {Object} values - An object containing the value of each inputID, e.g. {inputID1: value1, inputID2: value2}
     * @returns {Object} - An object containing the errors for each inputID, e.g. {inputID1: error1, inputID2: error2}
     */
    validate(values) {
        FormActions.setServerErrorMessage(this.props.formID, '');
        const validationErrors = this.props.validate(values);

        if (!_.isObject(validationErrors)) {
            throw new Error('Validate callback must return an empty object or an object with shape {inputID: error}');
        }

        const errors = _.pick(validationErrors, (inputValue, inputID) => (
            Boolean(this.touchedInputs[inputID])
        ));
        this.setState({errors});
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

            // We check if the child has the isFormInput prop.
            // We don't want to pass form props to non form components, e.g. View, Text, etc
            if (!child.props.isFormInput) {
                return child;
            }

            // We clone the child passing down all form props
            const inputID = child.props.inputID;
            const defaultValue = this.props.draftValues[inputID] || child.props.defaultValue;
            this.inputValues[inputID] = defaultValue;

            return React.cloneElement(child, {
                ref: node => this.inputRefs[inputID] = node,
                defaultValue,
                errorText: this.state.errors[inputID] || '',
                onBlur: () => {
                    this.setTouchedInput(inputID);
                    this.validate(this.inputValues);
                },
                onChange: (value) => {
                    this.inputValues[inputID] = value;
                    if (child.props.shouldSaveDraft) {
                        FormActions.setDraftValues(this.props.formID, {[inputID]: value});
                    }
                    this.validate(this.inputValues);
                },
            });
        });
    }

    render() {
        return (
            <>
                <ScrollView
                    style={[styles.w100, styles.flex1]}
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[this.props.style]}>
                        {this.childrenWrapperWithProps(this.props.children)}
                        <FormAlertWithSubmitButton
                            buttonText={this.props.submitButtonText}
                            isAlertVisible={_.size(this.state.errors) > 0 || Boolean(this.props.formState.serverErrorMessage)}
                            isLoading={this.props.formState.isSubmitting}
                            message={this.props.formState.serverErrorMessage}
                            onSubmit={this.submit}
                            onFixTheErrorsLinkPressed={() => {
                                this.inputRefs[_.first(_.keys(this.state.errors))].focus();
                            }}
                            containerStyles={[styles.mh0, styles.mt5]}
                        />
                    </View>
                </ScrollView>
            </>
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
            key: props => `${props.formID}DraftValues`,
        },
    }),
)(Form);
