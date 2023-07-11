import React from 'react';
// import PropTypes from 'prop-types';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import styles from '../../styles/styles';
// import compose from '../../libs/compose';
// import SignInPageLayout from './SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
// import Text from '../../components/Text';
// import TextLink from '../../components/TextLink';
// import AppleSignIn from '../../components/SignInButtons/AppleSignIn';
// import GoogleSignIn from '../../components/SignInButtons/GoogleSignIn';
// import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
// import ROUTES from '../../ROUTES';
// import Navigation from '../../libs/Navigation/Navigation';
// import CONST from '../../CONST';
// import * as Illustrations from '../../components/Icon/Illustrations';
// import Icon from '../../components/Icon';
// import * as Expensicons from '../../components/Icon/Expensicons';
// import variables from '../../styles/variables';
// import colors from '../../styles/colors';
import DeeplinkRedirectLoadingIndicator from '../../components/DeeplinkWrapper/DeeplinkRedirectLoadingIndicator';

const propTypes = {
    /** Which sign in provider we are using. */
    // signInProvider: PropTypes.oneOf([CONST.SIGN_IN_METHOD.APPLE, CONST.SIGN_IN_METHOD.GOOGLE]).isRequired,

    ...withLocalizePropTypes,

    // ...windowDimensionsPropTypes,
};

/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function DesktopRedirectPage(props) {
    // const goBack = () => {
    //     Navigation.navigate(ROUTES.HOME);
    // };

    return <DeeplinkRedirectLoadingIndicator linkText="deeplinkWrapper.continueInBrowser" />;
}

DesktopRedirectPage.propTypes = propTypes;
DesktopRedirectPage.displayName = 'DesktopRedirectPage';

export default withLocalize(DesktopRedirectPage);
