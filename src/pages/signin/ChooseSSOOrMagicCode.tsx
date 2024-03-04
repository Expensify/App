import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx';
import ValidateCodeForm from './ValidateCodeForm';

type ChooseSSOOrMagicCodeOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type ChooseSSOOrMagicCodeProps = ChooseSSOOrMagicCodeOnyxProps & {
    /** Determines if user is switched to using recovery code instead of 2fa code */
    isUsingRecoveryCode: boolean;

    /** Function to change `isUsingRecoveryCode` state when user toggles between 2fa code and recovery code */
    setIsUsingRecoveryCode: (value: boolean) => void;
};

function ChooseSSOOrMagicCode({account, isUsingRecoveryCode, setIsUsingRecoveryCode}: ChooseSSOOrMagicCodeProps) {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const loginTextAfterMagicCode = isUsingRecoveryCode ? translate('validateCodeForm.enterRecoveryCode') : translate('validateCodeForm.enterAuthenticatorCode');
    const loginText = account?.requiresTwoFactorAuth ? loginTextAfterMagicCode : translate('samlSignIn.orContinueWithMagicCode');

    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    return (
        <View>
            <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text>
            <Button
                isDisabled={isOffline}
                success
                style={[styles.mv3]}
                text={translate('samlSignIn.useSingleSignOn')}
                onPress={() => {
                    Navigation.navigate(ROUTES.SAML_SIGN_IN);
                }}
            />

            <View style={[styles.mt5]}>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{loginText}</Text>
            </View>

            <ValidateCodeForm
                isVisible
                isUsingRecoveryCode={isUsingRecoveryCode}
                setIsUsingRecoveryCode={setIsUsingRecoveryCode}
            />
        </View>
    );
}

ChooseSSOOrMagicCode.displayName = 'ChooseSSOOrMagicCode';

export default withOnyx<ChooseSSOOrMagicCodeProps, ChooseSSOOrMagicCodeOnyxProps>({account: {key: ONYXKEYS.ACCOUNT}})(ChooseSSOOrMagicCode);
