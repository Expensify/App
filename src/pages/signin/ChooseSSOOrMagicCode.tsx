import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {clearSignInData, resendValidateCode} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

type ChooseSSOOrMagicCodeProps = {
    /** Function that returns whether the user is using SAML or magic codes to log in */
    setIsUsingMagicCode: (value: boolean) => void;
};

function ChooseSSOOrMagicCode({setIsUsingMagicCode}: ChooseSSOOrMagicCodeProps) {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

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
                        resendValidateCode(credentials?.login);
                        setIsUsingMagicCode(true);
                    }}
                />
                {!!account && !isEmptyObject(account.errors) && <FormHelpMessage message={getLatestErrorMessage(account)} />}
                <ChangeExpensifyLoginLink onPress={() => clearSignInData()} />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

export default ChooseSSOOrMagicCode;
