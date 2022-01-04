import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import * as FormAction from '../libs/actions/ExpensiForm';
import {ScrollView, View} from 'react-native';
import styles from '../styles/styles';
import {withOnyx} from 'react-native-onyx';

const propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    defaultValues: PropTypes.object,

    validate: PropTypes.func.isRequired,
    shouldSaveDraft: PropTypes.bool,
};

const defaultProps = {
    defaultValues: {},
    shouldSaveDraft: true,
};

class ExpensiForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            errors: {},
            alert: {},
        };

        this.inputRefs = {};

        this.getFormValues = this.getFormValues.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.clearInputErrors = this.clearInputErrors.bind(this);
        this.setLoading = this.setLoading.bind(this);
        this.setFormAlert = this.setFormAlert.bind(this);
    }

    getFormValues() {
        const formData = {};
        _.each(_.keys(this.inputRefs), (key) => {
            formData[key] = this.inputRefs[key].value;
        });
        return formData;
    }

    saveDraft(draft) {
        if (!this.props.shouldSaveDraft) {
            return;
        }
        FormAction.saveFormDraft(`${this.props.name}_draft`, {...draft});
    }

    validateInput(inputName) {
        const inputError = this.props.validate({[inputName]: this.inputRefs[inputName].value})[inputName];
        this.setState(prevState => ({
            errors: {
                ...prevState.errors,
                [inputName]: inputError,
            }
        }));
    }

    validateForm() {
        const values = this.getFormValues();
        // validate takes in form values and returns errors object in the format
        // {username: 'form.errors.required', name: 'form.errors.tooShort', ...}
        // how do we handle multiple errors in this case???
        const errors = this.props.validate(values);
        const alert = {};
        if (!_.isEmpty(errors)) {
            alert['firstErrorToFix'] = this.inputRefs[_.keys(errors)[0]];
        }
        this.setState({
            errors,
            alert,
        });
        return errors;
    }

    // Should be called onFocus
    clearInputErrors(inputName) {
        this.setState(prevState => ({
            errors: {
                ...prevState.errors,
                [inputName]: undefined,
            },
        }));
    }

    setLoading(value) {
        this.setState({isLoading: value})
    }

    setFormAlert(alert) {
        this.setState({alert});
    }

    onSubmit() {
        const values = this.getFormValues();
        const errors = this.validateForm();
        if (!_.isEmpty(errors)) {
            return;
        }
        this.props.onSubmit(values, {setLoading: this.setLoading, setFormAlert: this.setFormAlert})
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

                // We check if the component has the EXPENSIFORM_COMPATIBLE_INPUT static property enabled,
                // as we don't want to pass form props to non form components, e.g. View, Text, etc
                if (!child.type.EXPENSIFORM_COMPATIBLE_INPUT && !child.type.EXPENSIFORM_SUBMIT_INPUT) {
                    return child;
                }

                // // We clone the child passing down all submit input props
                if (child.type.EXPENSIFORM_SUBMIT_INPUT) {
                    return React.cloneElement(child, {
                        onSubmit: this.onSubmit,
                        alert: this.state.alert,
                        isLoading: this.state.isLoading,
                    });
                }

                // We clone the child passing down all form props
                // We should only pass refs to class components!
                return React.cloneElement(child, {
                    ref: node => this.inputRefs[child.props.name] = node,
                    saveDraft: this.saveDraft,
                    validateInput: this.validateInput,
                    clearInputErrors: this.clearInputErrors,
                    defaultValue: this.props.draft[child.props.name],
                    errorText: this.state.errors[child.props.name],
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
                    {/* Form elements */}
                    <View style={[this.props.style]}>
                        {childrenWrapperWithProps(this.props.children)}
                    </View>
                </ScrollView>
            </>
        );
    }
}

ExpensiForm.propTypes = propTypes;
ExpensiForm.defaultProps = defaultProps;

export default withOnyx({
    draft: {
        key: name => name,
    }
})(ExpensiForm);;