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
     * Calls the submit callback when ENTER is pressed on a form element.
     * @param {Object} event
     */

    submitForm(event) {
        // ENTER is pressed with modifier key, do not submit the form
        if (event.shiftKey || event.key !== 'Enter') {
            return;
        }

        const tagName = lodashGet(event, 'target.tagName', '');

        // ENTER is pressed on INPUT or SELECT element, call the submit callback.
        if (tagName === 'INPUT' || tagName === 'SELECT') {
            this.props.onSubmit();
            return;
        }

        // FormSubmit Enter key handler does not have access to direct props.
        // `dataset.submitOnEnter` is used to indicate that pressing Enter on this input should call the submit callback.
        if (tagName === 'TEXTAREA' && lodashGet(event, 'target.dataset.submitOnEnter', 'false') === 'true') {
            this.props.onSubmit();
            return;
        }

        // ENTER is pressed on checkbox element, call the submit callback.
        if (lodashGet(event, 'target.role') === 'checkbox') {
            this.props.onSubmit();
        }
    }

    render() {
        return (

            // When Enter is pressed on `TextInput` the event is stopped (react-native-web).
            // We are using capture phase here to track the keyboard input, and call the submit callback.
            <View onKeyDownCapture={this.submitForm} style={this.props.style}>{this.props.children}</View>
        );
    }
}

FormSubmit.propTypes = formSubmitPropTypes.propTypes;
FormSubmit.defaultProps = formSubmitPropTypes.defaultProps;

export default FormSubmit;
