import React from 'react';
import {
    Image, SafeAreaView, View,
} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash.get';
import styles from '../../styles/styles';
import SignInPageLayout from '../signin/SignInPageLayout';
import welcomeScreenshot from '../../../assets/images/welcome-screenshot.png';
import withWindowDimensions from '../../components/withWindowDimensions';
import SetPasswordForm from './SetPasswordForm';
import WelcomeText from '../../components/WelcomeText';

const propTypes = {
    // Is this displaying on a device with a narrower screen width?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    route: PropTypes.shape({
        params: PropTypes.shape({
            validateCode: PropTypes.string,
        }),
    }),
};
const defaultProps = {
    route: {
        params: {},
    },
};

const SetPasswordPage = props => (
    <SafeAreaView style={[styles.signInPage]}>
        <SignInPageLayout>
            <View style={[styles.loginFormContainer]}>
                <SetPasswordForm
                    validateCode={lodashGet(props.route, 'params.validateCode', '')}
                />
                {props.isSmallScreenWidth && (
                    <View style={[styles.mt5, styles.mb5]}>
                        <Image
                            resizeMode="contain"
                            style={[styles.signinWelcomeScreenshot]}
                            source={welcomeScreenshot}
                        />
                    </View>
                )}
            </View>
            <WelcomeText />
        </SignInPageLayout>
    </SafeAreaView>
);

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default withWindowDimensions((SetPasswordPage));
