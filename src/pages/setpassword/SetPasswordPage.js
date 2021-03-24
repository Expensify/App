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
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // An error message to display to the user
        error: PropTypes.string,

        // Whether or not a sign on form is loading (being submitted)
        loading: PropTypes.bool,
    }),

    // The credentials of the logged in person
    credentials: PropTypes.shape({
        // The email the user logged in with
        login: PropTypes.string,

        // The password used to log in the user
        password: PropTypes.string,
    }),

    // Is this displaying on a device with a narrower screen width?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    route: PropTypes.shape({
        params: PropTypes.shape({
            validateCode: PropTypes.string,
        }),
    }),
};
const defaultProps = {
    account: {},
    credentials: {},
    route: {
        params: {},
    },
};

const SetPasswordPage = (props) => {
    return (
        <SafeAreaView style={[styles.signInPage]}>
            <SignInPageLayout>
                <View style={[styles.loginFormContainer]}>
                    <SetPasswordForm
                        validateCode={lodashGet(props.route, 'params.validateCode', '')}
                        account={props.account}
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
};

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;


export default withWindowDimensions(
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(SetPasswordPage);
