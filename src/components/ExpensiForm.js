import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import * as FormAction from '../libs/actions/ExpensiForm';

const propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    defaultValues: PropTypes.object,

    validate: PropTypes.func.isRequired,
    saveDraft: PropTypes.bool,
};

const defaultProps = {
    defaultValues: {},
    saveDraft: true,
};

class ExpensiForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            defaultValues: this.props.defaultValues,
            errors: {},
        };
        this.inputRefs = React.createRef();
        this.inputRefs.current = {};

        this.getFormValues = this.getFormValues.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
        this.clearInputErrors = this.clearInputErrors.bind(this);
    }

    getFormValues() {
        const formData = {};
        _.each(_.keys(this.inputRefs.current), (key) => {
            if (key && key !== 'undefined') {
                return;
            }
            formData[key] = this.inputRefs.current[key].value;
        });
        return formData;
    }

    // TODO: Skip saving draft for sensitive inputs, e.g. passwords
    // Should be called onChange
    saveDraft(draft) {
        if (!this.props.saveDraft) {
            return;
        }
        FormAction.saveFormDraft(this.props.name, {draft});
    }

    // Should be called onBlur and onSubmit
    validate(field) {
        const values = this.getFormValues();
        // validate takes in form values and returns errors object in the format
        // how do we handle multiple errors in this case???
        // {username: 'form.errors.required', name: 'form.errors.tooShort', ...}

        // We check if we are trying to validate a single field or the entire form
        const errors = this.props.validate(values);
        if (field) {
            this.setState({errors: errors[field]});
        } else {
            this.setState({errors});
        }
    }

    // Should be called onFocus
    clearInputErrors(field) {
        this.setState(prevState => ({
            errors: {
                ...prevState.errors,
                [field]: undefined,
            },
        }));
    }

    onSubmit(submit) {
        const values = this.getFormValues();
        this.validate(values);
        if (!_.isEmpty(this.state.errors)) {
            return;
        }
        FormAction.setLoading(this.props.name, true);

        submit(values).then(() => {
            FormAction.setLoading(this.props.name, false);
        });
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

                // We check if the component has the EXPENSIFORM static property enabled,
                // as we don't want to pass form props to non form components, e.g. View, Text, etc
                if (!child.type.EXPENSIFORM) {
                    return child;
                }

                // We clone the child passing down all form props
                const inputRef = node => this.inputRefs.current[child.props.name] = node;
                return React.cloneElement(child, {
                    ref: inputRef,
                    saveDraft: this.saveDraft,
                    validate: this.validate,
                    clearInputErrors: this.clearInputErrors,
                    onSubmit: this.onSubmit,
                    defaultValue: this.state.defaultValues[child.props.name],
                    error: this.state.errors[child.props.name],
                });
            })
        );

        return (
            <>
                {childrenWrapperWithProps(this.props.children)}
            </>
        );
    }
}

ExpensiForm.propTypes = propTypes;
ExpensiForm.defaultProps = defaultProps;

export default ExpensiForm;