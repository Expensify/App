import React from 'react';
import {Image, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import logo from '../../../../assets/images/expensify-logo-coin-2x.png';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayoutNarrow = ({children}) => (
    <View style={[styles.signInPageInnerNative]}>
        <View style={[styles.signInPageLogoNative]}>
            <Image
                resizeMode="contain"
                style={[styles.signinLogo]}
                source={logo}
            />
        </View>

        <View style={[styles.mt5, styles.mb4]}>
            <Text style={[styles.h1]}>
                Expensify.cash
            </Text>
        </View>

        {children}
    </View>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';


export default SignInPageLayoutNarrow;
