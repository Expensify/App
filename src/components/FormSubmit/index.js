import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /* A function to execute when form is submitted with ENTER */
    onSubmit: PropTypes.func.isRequired,

    /** Children to wrap with FormSubmit. */
    children: PropTypes.node.isRequired,

    /** Container styles */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

class FormSubmit extends React.Component {
    constructor(props) {
        super(props);

        this.onKeyDownCapture = this.onKeyDownCapture.bind(this);
    }

    onKeyDownCapture(event) {
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
            <View onKeyDownCapture={this.onKeyDownCapture} style={this.props.style}>{this.props.children}</View>
        );
    }
}

FormSubmit.propTypes = propTypes;
FormSubmit.defaultProps = defaultProps;

export default FormSubmit;
