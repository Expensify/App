import React from 'react';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import {propTypes, defaultProps} from './formSubmitPropTypes';

class FormSubmit extends React.Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);
    }

    submitForm(event) {
        if (event.shiftKey || event.key !== 'Enter') {
            return;
        }

        const tagName = lodashGet(event, 'target.tagName', '');

        if (tagName === 'INPUT' || tagName === 'SELECT') {
            this.props.onSubmit();
            return;
        }

        if (tagName === 'TEXTAREA' && lodashGet(event, 'target.dataset.blurOnSubmit', 'false') === 'true') {
            this.props.onSubmit();
            return;
        }

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

FormSubmit.propTypes = propTypes;
FormSubmit.defaultProps = defaultProps;

export default FormSubmit;
