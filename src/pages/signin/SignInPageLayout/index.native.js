import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayout = ({children}) => (
    <View style={[styles.signInPageInnerNative]}>
        {children}
    </View>
);

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';


export default SignInPageLayout;
