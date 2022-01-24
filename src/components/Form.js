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

    /** Callback validate the form */
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
        this.touchedInputs = {};

        this.getValues = this.getValues.bind(this);
        this.setTouchedInput = this.setTouchedInput.bind(this);
        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
    }

    setTouchedInput(inputID) {
        this.touchedInputs = {
            ...this.touchedInputs,
            [inputID]: true,
        };
    }

    /**
     * @returns {Object} - An object containing the values for each inputID
     */
    getValues() {
        const values = {};
        _.each(_.keys(this.inputRefs), (inputID) => {
            values[inputID] = this.inputRefs[inputID].value;
        });
        return values;
    }

    submit() {
        // Return early if the form is already submitting to avoid duplicate submission
        if (this.props.formState.isSubmitting) {
            return;
        }

        // Touches all form inputs so we can validate the entire form
        _.each(_.keys(this.inputRefs), inputID => (
            this.touchedInput[inputID] = true
        ));

        // Validate form and return early if any errors are found
        const values = this.getValues();
        if (!_.isEmpty(this.validate(values))) {
            return;
        }

        // Set loading state and call submit handler
        FormActions.setIsSubmitting(this.props.formID, true);
        this.props.onSubmit(values);
    }

    /**
     * @param {Object} values - An object containing the value of each inputID
     * @returns {Object} - An object containeing the errors for each inputID
     */
    validate(values) {
        FormActions.setServerErrorMessage(this.props.formID, '');
        const validationErrors = this.props.validate(values);
        const errors = _.filter(_.keys(validationErrors), inputID => (
            Boolean(this.touchedInputs[inputID])
        ));
        this.setState({errors});
        return errors;
    }

    render() {
        const childrenWrapperWithProps = children => (
            // eslint-disable-next-line rulesdir/prefer-underscore-method
            React.Children.map(children, (child) => {
                // Do nothing if child is not a valid React element, e.g. text within a <Text> component
                if (!React.isValidElement(child)) {
                    return child;
                }

                // Depth first traversal of the render tree as the form element is likely to be the last node
                if (child.props.children) {
                    return React.cloneElement(child, {
                        children: childrenWrapperWithProps(child.props.children),
                    });
                }

                // We check if the child has the isFormInput prop.
                // We don't want to pass form props to non form components, e.g. View, Text, etc
                if (!child.props.isFormInput) {
                    return child;
                }

                // We clone the child passing down all form props
                // We should only pass refs to class components!
                const inputID = child.props.inputID;
                return React.cloneElement(child, {
                    ref: node => this.inputRefs[inputID] = node,
                    defaultValue: this.props.draftValues[inputID] || child.props.defaultValue,
                    errorText: this.state.errors[inputID] || '',
                    onBlur: (key) => {
                        this.setTouchedInput(key);
                        this.validate(this.getValues());
                        if (child.props.onBlur) {
                            child.props.onBlur();
                        }
                    },
                    onChange: (value) => {
                        if (child.props.shouldSaveDraft) {
                            FormActions.setDraftValues(this.props.formID, {[inputID]: value});
                        }
                        if (this.touchedInputs[inputID]) {
                            this.validate(this.getValues());
                        }
                        if (child.props.onChange) {
                            child.props.onChange();
                        }
                    },
                });
            })
        );

        return (
            <>
                <ScrollView
                    style={[styles.w100, styles.flex1]}
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[this.props.style]}>
                        {childrenWrapperWithProps(this.props.children)}
                        <FormAlertWithSubmitButton
                            buttonText={this.props.submitButtonText}
                            isAlertVisible={_.size(this.state.errors) > 0 || Boolean(this.props.formState.serverErrorMessage)}
                            isLoading={this.props.formState.isSubmitting}
                            message={this.props.formState.serverErrorMessage}
                            onSubmit={this.submit}
                            onFixTheErrorsLinkPressed={() => {
                                this.inputRefs[_.first(_.keys(this.state.errors))].focus();
                            }}
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
