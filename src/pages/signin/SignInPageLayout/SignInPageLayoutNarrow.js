import React from 'react';
import {
    Image,
    ScrollView, Text, View, SafeAreaView
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import ExpensifyCashLogo from '../../../../assets/images/expensify-cash.svg';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.png';
import TermsAndLicenses from '../TermsAndLicenses';
import {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import WelcomeText from '../../../components/WelcomeText';

const propTypes = {

    ...windowDimensionsPropTypes,

    // The children to show inside the layout
    children: PropTypes.node.isRequired,

    // Whether we should show the welcome elements
    shouldShowWelcomeText: PropTypes.bool,
    shouldShowWelcomeScreenshot: PropTypes.bool,
};

const defaultProps = {
    shouldShowWelcomeText: true,
    shouldShowWelcomeScreenshot: true,
};

const SignInPageLayoutNarrow = props => (
    <SafeAreaView>
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

                    <View style={[styles.signInPageFormContainer]}>
                        {props.children}

                        {props.shouldShowWelcomeScreenshot
                            && (
                            <View style={[styles.mt5, styles.mb5]}>
                                <Image
                                    resizeMode="contain"
                                    style={[styles.signinWelcomeScreenshot]}
                                    source={welcomeScreenshot}
                                />
                            </View>
                            )}

                        {props.shouldShowWelcomeText && <WelcomeText />}
                    </View>
                    <TermsAndLicenses />
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.defaultProps = defaultProps;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';


export default SignInPageLayoutNarrow;
