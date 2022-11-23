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

        // Pressing Enter on TEXTAREA element adds a new line. When `dataset.submitOnEnter` prop is passed, call the submit callback.
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

            // React-native-web prevents event bubbling on TextInput for key presses
            // https://github.com/necolas/react-native-web/blob/fa47f80d34ee6cde2536b2a2241e326f84b633c4/packages/react-native-web/src/exports/TextInput/index.js#L272
            // Thus use capture phase.
            <View onKeyDownCapture={this.submitForm} style={this.props.style}>{this.props.children}</View>
        );
    }
}

FormSubmit.propTypes = formSubmitPropTypes.propTypes;
FormSubmit.defaultProps = formSubmitPropTypes.defaultProps;

export default FormSubmit;
