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
import TermsAndLicenses from '../TermsAndLicenses';
import WelcomeText from '../../../components/WelcomeText';
import openURLInNewTab from '../../../libs/openURLInNewTab/index.native';
import CONST from '../../../CONST';

const propTypes = {

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
    <ScrollView keyboardShouldPersistTaps="handled">
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
                    <View>
                        <Text style={[styles.textLabel, styles.mt6]}>
                            Expensify.cash is open source. View
                            {' '}
                            <Text
                                style={[styles.link]}
                                onPress={() => openURLInNewTab(CONST.GITHUB_URL)}
                            >
                                the code
                            </Text>
                            . View
                            {' '}
                            <Text
                                style={[styles.link]}
                                onPress={() => openURLInNewTab(CONST.UPWORK_URL)}
                            >
                                open jobs
                            </Text>
                            .
                        </Text>
                    </View>
                </View>
                <TermsAndLicenses />
            </View>
        </View>
    </ScrollView>
);

SignInPageLayoutNarrow.propTypes = propTypes;
SignInPageLayoutNarrow.defaultProps = defaultProps;
SignInPageLayoutNarrow.displayName = 'SignInPageLayoutNarrow';


export default SignInPageLayoutNarrow;
