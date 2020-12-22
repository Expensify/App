import React from 'react';
import {
    Image, Text, View
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import logo from '../../../../assets/images/expensify-logo-coin-2x.png';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.jpg';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayout = ({children}) => (
    <View style={[styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow]}>
            <View style={[styles.flex1, styles.width50p, styles.alignItemsCenter]}>
                <View style={[styles.mt5, styles.mb5]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinWelcomeScreenshot]}
                        source={welcomeScreenshot}
                    />
                </View>
            </View>
            <View style={[styles.flex1, styles.width50p]}>
                <View style={[styles.signInPageLogo]}>
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
        </View>
    </View>
);

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';


export default SignInPageLayout;
