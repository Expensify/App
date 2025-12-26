import React from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import AppleSignIn from '@components/SignInButtons/AppleSignIn';
import GoogleSignIn from '@components/SignInButtons/GoogleSignIn';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SignInPageLayout from './SignInPageLayout';
import Terms from './Terms';

type ThirdPartySignInPageProps = {
    /** Which sign in provider we are using. */
    signInProvider: ValueOf<typeof CONST.SIGN_IN_METHOD>;
};

/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function ThirdPartySignInPage({signInProvider}: ThirdPartySignInPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const goBack = () => {
        Navigation.navigate(ROUTES.HOME);
    };
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    return (
        <SafeAreaView style={[styles.signInPage]}>
            {account?.isLoading ? (
                <View style={styles.thirdPartyLoadingContainer}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        color={undefined}
                    />
                </View>
            ) : (
                <SignInPageLayout
                    welcomeHeader={translate('welcomeText.getStarted')}
                    shouldShowWelcomeHeader
                >
                    {signInProvider === CONST.SIGN_IN_METHOD.APPLE ? <AppleSignIn isDesktopFlow /> : <GoogleSignIn isDesktopFlow />}
                    <Text style={[styles.mt5]}>{translate('thirdPartySignIn.redirectToDesktopMessage')}</Text>
                    <Text style={[styles.mt5]}>{translate('thirdPartySignIn.goBackMessage', signInProvider)}</Text>
                    <TextLink
                        style={[styles.link]}
                        onPress={goBack}
                    >
                        {translate('common.goBack')}.
                    </TextLink>
                    <View style={[styles.mt5]}>
                        <Terms />
                    </View>
                </SignInPageLayout>
            )}
        </SafeAreaView>
    );
}

export default ThirdPartySignInPage;
