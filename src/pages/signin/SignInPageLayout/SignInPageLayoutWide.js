import React from 'react';
import {
    Image,
    Text,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ExpensifyCashLogo from '../../../../assets/images/expensify-cash.svg';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot-wide.png';
import variables from '../../../styles/variables';
import TermsAndLicenses from '../TermsAndLicenses';
import WelcomeText from '../../../components/WelcomeText';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,

    // Whether we should show the welcome elements
    // (the welcome screenshot always displays on wide views)
    showWelcomeText: PropTypes.Boolean,
};

const defaultProps = {
    showWelcomeText: true,
};

const SignInPageLayoutWide = props => (
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
                    <ExpensifyCashLogo width={variables.componentSizeLarge} height={variables.componentSizeLarge} />
                </View>

                <View style={[styles.mb5]}>
                    <Text style={[styles.h1]}>
                        Expensify.cash
                    </Text>
                </View>
                <View style={[styles.loginFormContainer]}>
                    {props.children}
                </View>
                {props.showWelcomeText
                    && (
                    <View style={[styles.mt6, styles.mb6]}>
                        <WelcomeText textSize="large" />
                    </View>
                    )}
                <TermsAndLicenses />
            </View>
        </View>
    </View>
);

SignInPageLayoutWide.propTypes = propTypes;
SignInPageLayoutWide.defaultProps = defaultProps;
SignInPageLayoutWide.displayName = 'SignInPageLayoutWide';


export default SignInPageLayoutWide;
