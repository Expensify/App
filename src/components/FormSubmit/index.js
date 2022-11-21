import React from 'react';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import * as formSubmitPropTypes from './formSubmitPropTypes';

// This is a wrapper component to handle the ENTER key press, and submit the form.
class FormSubmit extends React.Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);
    }

    /**
     * Submits the form when ENTER is pressed on form element.
     * @param {SyntheticEvent} event
     */

    submitForm(event) {
        // ENTER is pressed with modifier key, do not submit the form
        if (event.shiftKey || event.key !== 'Enter') {
            return;
        }

        const tagName = lodashGet(event, 'target.tagName', '');

        // ENTER is pressed on INPUT or SELECT element, submit the form
        if (tagName === 'INPUT' || tagName === 'SELECT') {
            this.props.onSubmit();
            return;
        }

        // We usually do not submit the form on TEXTAREA element, when ENTER is pressed.
        // As there is a prop on react native `blurOnSubmit`, we indeed want to submit it here.
        // Element dataset is used here to store `blurOnSubmit` prop.
        if (tagName === 'TEXTAREA' && lodashGet(event, 'target.dataset.blurOnSubmit', 'false') === 'true') {
            this.props.onSubmit();
            return;
        }

        // ENTER is pressed on checkbox element, submit the form
        if (lodashGet(event, 'target.role') === 'checkbox') {
            this.props.onSubmit();
        }
    }

    render() {
        return (
            <View onKeyDownCapture={this.submitForm} style={this.props.style}>{this.props.children}</View>
        );
    }
}

FormSubmit.propTypes = formSubmitPropTypes.propTypes;
FormSubmit.defaultProps = formSubmitPropTypes.defaultProps;

export default FormSubmit;
