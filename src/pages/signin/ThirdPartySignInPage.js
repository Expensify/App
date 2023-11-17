import PropTypes from 'prop-types';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppleSignIn from '@components/SignInButtons/AppleSignIn';
import GoogleSignIn from '@components/SignInButtons/GoogleSignIn';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SignInPageLayout from './SignInPageLayout';

const propTypes = {
    /** Which sign in provider we are using. */
    signInProvider: PropTypes.oneOf([CONST.SIGN_IN_METHOD.APPLE, CONST.SIGN_IN_METHOD.GOOGLE]).isRequired,

    /** State for the account */
    account: PropTypes.shape({
        /** Whether or not the user is loading */
        isLoading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    account: {},
};

/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function ThirdPartySignInPage(props) {
    const styles = useThemeStyles();
    const goBack = () => {
        Navigation.navigate(ROUTES.HOME);
    };

    return (
        <SafeAreaView style={[styles.signInPage]}>
            {props.account.isLoading ? (
                <View style={styles.thirdPartyLoadingContainer}>
                    <ActivityIndicator
                        size="large"
                        welcomeHeader={props.translate('welcomeText.getStarted')}
                        shouldShowWelcomeHeader
                    />
                </View>
            ) : (
                <SignInPageLayout
                    welcomeHeader={props.translate('welcomeText.getStarted')}
                    shouldShowWelcomeHeader
                    shouldShowWelcomeText={false}
                    welcomeText=""
                >
                    {props.signInProvider === CONST.SIGN_IN_METHOD.APPLE ? <AppleSignIn isDesktopFlow /> : <GoogleSignIn isDesktopFlow />}
                    <Text style={[styles.mt5]}>{props.translate('thirdPartySignIn.redirectToDesktopMessage')}</Text>
                    <Text style={[styles.mt5]}>{props.translate('thirdPartySignIn.goBackMessage', {provider: props.signInProvider})}</Text>
                    <TextLink
                        style={[styles.link]}
                        onPress={goBack}
                    >
                        {props.translate('common.goBack')}.
                    </TextLink>
                    <Text style={[styles.textExtraSmallSupporting, styles.mt5, styles.mb5]}>
                        {props.translate('thirdPartySignIn.signInAgreementMessage')}
                        <TextLink
                            style={[styles.textExtraSmallSupporting, styles.link]}
                            href=""
                        >
                            {` ${props.translate('common.termsOfService')}`}
                        </TextLink>
                        {` ${props.translate('common.and')} `}
                        <TextLink
                            style={[styles.textExtraSmallSupporting, styles.link]}
                            href=""
                        >
                            {props.translate('common.privacy')}
                        </TextLink>
                        .
                    </Text>
                </SignInPageLayout>
            )}
        </SafeAreaView>
    );
}

ThirdPartySignInPage.propTypes = propTypes;
ThirdPartySignInPage.defaultProps = defaultProps;
ThirdPartySignInPage.displayName = 'ThirdPartySignInPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(ThirdPartySignInPage);
