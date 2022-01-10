import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ExpensiFormActions from '../libs/actions/ExpensiFormActions';
import {ScrollView, View} from 'react-native';
import styles from '../styles/styles';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';

const propTypes = {
    /** A unique Onyx key identifying the form */
    name: PropTypes.string.isRequired,

    /** Text to be displayed in the submit button */    
    buttonText: PropTypes.string.isRequired,

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
    draftValues: PropTypes.object(),

    ...withLocalizePropTypes,
};

const defaultProps = {
    formState: {
        isSubmitting: false,
        serverErrorMessage: '',
    },
    draftValues: {},
};

class ExpensiForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: {},
        };

        this.inputRefs = {};
        this.touchedInputs = {};

        this.getValues = this.getValues.bind(this);
        this.getErrorText = this.getErrorText.bind(this);
        this.setTouchedInput = this.setTouchedInput.bind(this);
        this.validate = this.validate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    getValues() {
        const values = {};
        _.each(_.keys(this.inputRefs), (key) => {
            values[key] = this.inputRefs[key].value;
        });
        return values;
    }

    getErrorText(inputName) {
        if (_.isEmpty(this.state.errors[inputName])) {
            return '';
        }

        const translatedErrors = _.map(this.state.errors[inputName], (translationKey) => (
            this.props.translate(translationKey)
        ));
        return _.join(translatedErrors, ' ');
    }

    setTouchedInput(inputName) {
        this.touchedInputs = {
            ...this.touchedInputs,
            [inputName]: true,
        }
    }

    validate(values) {
        ExpensiFormActions.setServerErrorMessage(this.props.name, '');
        const validationErrors = this.props.validate(values);
        const errors = _.filter(_.keys(validationErrors), (inputName) => (
            Boolean(this.touchedInputs[inputName])
        ));
        this.setState({errors});
        return errors;
    }

    onSubmit() {
        // Return early if the form is already submitting to avoid duplicate submission
        if (this.props.formState.isSubmitting) {
            return;
        }

        // Touches all form inputs so we can validate the entire form
        _.each(_.keys(this.inputRefs), (inputName) => (
            this.touchedInput[inputName] = true
        ));

        // Validate form and return early if any errors are found
        const values = this.getValues();
        if (!_.isEmpty(this.validate(values))) {
            return;
        }

        // Set loading state and call submit handler
        ExpensiFormActions.setIsSubmitting(this.props.name, true);
        this.props.onSubmit(values);
    }

    render() {
        const childrenWrapperWithProps = children => (
            React.Children.map(children, (child) => {
                // Do nothing if child is not a valid React element
                if (!React.isValidElement(child)) {
                    return child;
                }

                // Depth first traversal of the render tree as the form element is likely to be the last node
                if (child.props.children) {
                    child = React.cloneElement(child, {
                        children: childrenWrapperWithProps(child.props.children),
                    });
                }

                // We check if the child has the isExpensiFormInput prop,
                // since we we don't want to pass form props to non form components, e.g. View, Text, etc
                if (!child.props.isExpensiFormInput) {
                    return child;
                }

                // We clone the child passing down all form props
                // We should only pass refs to class components!
                const inputName = child.props.name;
                return React.cloneElement(child, {
                    ref: node => this.inputRefs[inputName] = node,
                    defaultValue: this.props.draftValues[inputName] || child.props.defaultValue,
                    errorText: this.getErrorText(inputName),
                    onBlur: (inputName) => {
                        this.setTouchedInput(inputName);
                        this.validate(this.getValues());
                    },
                    onChange: (value) => {
                        if (child.props.shouldSaveDraft) {
                            ExpensiFormActions.setDraftValues(this.props.name, {[inputName]: value})
                        }
                        if (this.touchedInputs[inputName]) {
                            this.validate(this.getValues());
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
                            buttonText={this.props.buttonText}
                            isAlertVisible={_.size(this.state.errors) > 0 || Boolean(this.props.formState.serverErrorMessage)}
                            isLoading={this.props.formState.isSubmitting}
                            message={this.props.formState.serverErrorMessage}
                            onSubmit={this.onSubmit}
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

ExpensiForm.propTypes = propTypes;
ExpensiForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        formState: {
            key: props => props.name,
        },
        draftValues: {
            key: props => `${props.name}DraftValues`,
        }
    }),
)(ExpensiForm);