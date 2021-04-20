import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import styles from '../../styles/styles';
import PropTypes from 'prop-types';

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
