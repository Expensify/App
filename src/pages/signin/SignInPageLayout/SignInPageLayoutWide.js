import React from 'react';
import {
    Image, Text, View
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import logo from '../../../../assets/images/expensify-logo-round.png';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot-wide.png';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayoutWide = ({children}) => (
    <View style={[styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow]}>
            <View style={[styles.flex1, styles.w50, styles.alignItemsCenter]}>
                <View>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinWelcomeScreenshotWide]}
                        source={welcomeScreenshot}
                    />
                </View>
            </View>
            <View style={[styles.flex1, styles.w50]}>
                <View style={[styles.signInPageLogo, styles.mt6, styles.mb5]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinLogo]}
                        source={logo}
                    />
                </View>

                <View style={[styles.mb5]}>
                    <Text style={[styles.h1]}>
                        Expensify.cash
                    </Text>
                </View>

                {children}
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';


export default SignInPageLayoutWide;
