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
import {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {

    ...windowDimensionsPropTypes,

    // The children to show inside the layout
    children: PropTypes.node.isRequired,

    // Whether we should show the welcome elements
    showWelcomeText: PropTypes.Boolean,
    showWelcomeScreenshot: PropTypes.Boolean,
};

const defaultProps = {
    showWelcomeText: true,
    showWelcomeScreenshot: true,
};

const SignInPageLayoutNarrow = props => (
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
                    {props.children}

                    {props.showWelcomeScreenshot
                        && (
                        <View style={[styles.mt5, styles.mb5]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinWelcomeScreenshot]}
                                source={welcomeScreenshot}
                            />
                        </View>
                        )}

                    {props.showWelcomeText
                        && (
                        <View>
                            <Text style={[styles.textLabel, styles.textStrong, styles.mb1]}>
                                With Expensify.cash, chat and payments are the same thing.
                            </Text>
                            <Text style={[styles.textLabel]}>
                                Money talks. And now that chat and payments are in one place, it&apos;s also easy.
                                {' '}
                                Your payments get to you as fast as you can get your point across.
                            </Text>
                        </View>
                        )}

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
