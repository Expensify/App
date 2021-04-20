import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

function KeyboardAvoidingView({children}) {
    return (
        <KeyboardAvoidingViewComponent
            enabled={false}
            behavior="height"
            style={[styles.w100, styles.h100]}
        >
            {children}
        </KeyboardAvoidingViewComponent>
    );
}
KeyboardAvoidingView.propTypes = {
    children: PropTypes.node,
};
KeyboardAvoidingView.defaultProps = {
    children: null,
};
export default KeyboardAvoidingView;
