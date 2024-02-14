import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import AppleSignIn from '@components/SignInButtons/AppleSignIn';
import GoogleSignIn from '@components/SignInButtons/GoogleSignIn';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx';
import SignInPageLayout from './SignInPageLayout';

type ThirdPartySignInPageOnyxProps = {
    /** State for the account */
    account: OnyxEntry<Account>;
};

type ThirdPartySignInPageProps = ThirdPartySignInPageOnyxProps & {
    /** Which sign in provider we are using. */
    signInProvider: ValueOf<typeof CONST.SIGN_IN_METHOD>;
};

/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function ThirdPartySignInPage({account, signInProvider}: ThirdPartySignInPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const goBack = () => {
        Navigation.navigate(ROUTES.HOME);
    };

    return (
        <SafeAreaView style={[styles.signInPage]}>
            {account?.isLoading ? (
                <View style={styles.thirdPartyLoadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <SignInPageLayout
                    welcomeHeader={translate('welcomeText.getStarted')}
                    shouldShowWelcomeHeader
                >
                    {signInProvider === CONST.SIGN_IN_METHOD.APPLE ? <AppleSignIn isDesktopFlow /> : <GoogleSignIn isDesktopFlow />}
                    <Text style={[styles.mt5]}>{translate('thirdPartySignIn.redirectToDesktopMessage')}</Text>
                    <Text style={[styles.mt5]}>{translate('thirdPartySignIn.goBackMessage', {provider: signInProvider})}</Text>
                    <TextLink
                        style={[styles.link]}
                        onPress={goBack}
                    >
                        {translate('common.goBack')}.
                    </TextLink>
                    <Text style={[styles.textExtraSmallSupporting, styles.mt5, styles.mb5]}>
                        {translate('thirdPartySignIn.signInAgreementMessage')}
                        <TextLink
                            style={[styles.textExtraSmallSupporting, styles.link]}
                            href=""
                        >
                            {` ${translate('common.termsOfService')}`}
                        </TextLink>
                        {` ${translate('common.and')} `}
                        <TextLink
                            style={[styles.textExtraSmallSupporting, styles.link]}
                            href=""
                        >
                            {translate('common.privacy')}
                        </TextLink>
                        .
                    </Text>
                </SignInPageLayout>
            )}
        </SafeAreaView>
    );
}

ThirdPartySignInPage.displayName = 'ThirdPartySignInPage';

export default withOnyx<ThirdPartySignInPageProps, ThirdPartySignInPageOnyxProps>({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
})(ThirdPartySignInPage);
