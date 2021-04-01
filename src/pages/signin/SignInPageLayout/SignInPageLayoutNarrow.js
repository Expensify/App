import React from 'react';
import {
    Image,
    ScrollView, Text, View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../../assets/images/expensify-cash.svg';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.png';
import WelcomeText from '../../../components/WelcomeText';
import TermsAndLicenses from '../TermsAndLicenses';

const propTypes = {
    // The children to show inside the layout
    children: PropTypes.node.isRequired,
};

const SignInPageLayoutNarrow = ({children}) => (
    <ScrollView>
        <View>
            <View style={[styles.signInPageInnerNative]}>
                <View style={[styles.signInPageLogoNative]}>
                    <ExpensifyCashLogo width={variables.componentSizeLarge} height={variables.componentSizeLarge} />
                </View>

                <View style={[styles.mb6, styles.alignItemsCenter]}>
                    <Text style={[styles.h1]}>
                        Expensify.cash
                    </Text>
                </View>

                <View style={[styles.loginFormContainer]}>
                    {children}
                    <View style={[styles.mt5, styles.mb5]}>
                        <Image
                            resizeMode="contain"
                            style={[styles.signinWelcomeScreenshot]}
                            source={welcomeScreenshot}
                        />
                    </View>
                    <WelcomeText />
                </View>
                <TermsAndLicenses />
            </View>
        </View>
    </ScrollView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';


export default SignInPageLayoutNarrow;
