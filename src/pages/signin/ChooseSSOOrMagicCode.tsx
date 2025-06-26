import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account, Credentials} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

type ChooseSSOOrMagicCodeOnyxProps = {
    /** The credentials of the logged in person */
    credentials: OnyxEntry<Credentials>;

    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type ChooseSSOOrMagicCodeProps = ChooseSSOOrMagicCodeOnyxProps & {
    /** Function that returns whether the user is using SAML or magic codes to log in */
    setIsUsingMagicCode: (value: boolean) => void;
};

function ChooseSSOOrMagicCode({credentials, account, setIsUsingMagicCode}: ChooseSSOOrMagicCodeProps) {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    return (
        <>
            <View>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text>
                <Button
                    isDisabled={isOffline}
                    success
                    large
                    style={[styles.mv3]}
                    text={translate('samlSignIn.useSingleSignOn')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        Navigation.navigate(ROUTES.SAML_SIGN_IN);
                    }}
                />

                <View style={[styles.mt5]}>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>
                        {translate('samlSignIn.orContinueWithMagicCode')}
                    </Text>
                </View>

                <Button
                    isDisabled={isOffline}
                    style={[styles.mv3]}
                    large
                    text={translate('samlSignIn.useMagicCode')}
                    isLoading={account?.isLoading && account?.loadingForm === (account?.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)}
                    onPress={() => {
                        Session.resendValidateCode(credentials?.login);
                        setIsUsingMagicCode(true);
                    }}
                />
                {!!account && !isEmptyObject(account.errors) && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(account)} />}
                <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

ChooseSSOOrMagicCode.displayName = 'ChooseSSOOrMagicCode';

export default withOnyx<ChooseSSOOrMagicCodeProps, ChooseSSOOrMagicCodeOnyxProps>({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(ChooseSSOOrMagicCode);
