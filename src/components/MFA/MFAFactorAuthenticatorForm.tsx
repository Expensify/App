import React, {memo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

type MFAFactorAuthenticatorFormProps = {
    twoFactorAuthCode: string;
    formError: string | undefined;
    inputRef: React.RefObject<MagicCodeInputHandle>;
    isValidateCodeFormSubmitting: boolean;
    onCodeInput: (text: string) => void;
    validateAndSubmitForm: () => void;
};

function MFAFactorAuthenticatorForm({twoFactorAuthCode, formError, inputRef, isValidateCodeFormSubmitting, onCodeInput, validateAndSubmitForm}: MFAFactorAuthenticatorFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    return (
        <ScrollView
            style={[styles.w100, styles.h100, styles.flex1]}
            contentContainerStyle={styles.flexGrow1}
            keyboardShouldPersistTaps="handled"
        >
            <View style={[styles.ph5, styles.mt3, styles.mb5, styles.flex1]}>
                <Text style={styles.mb3}>{translate('multiFactorAuthentication.biometrics.fallbackPage2FAContent')}</Text>
                <MagicCodeInput
                    autoComplete="one-time-code"
                    name="twoFactorAuthCode"
                    value={twoFactorAuthCode}
                    onChangeText={onCodeInput}
                    onFulfill={validateAndSubmitForm}
                    errorText={formError}
                    ref={inputRef}
                    autoFocus={false}
                    testID="twoFactorAuthCodeInput"
                />
                <Button
                    success
                    large
                    style={[styles.w100, styles.p5, styles.mtAuto]}
                    onPress={validateAndSubmitForm}
                    text={translate('common.verify')}
                    isLoading={isValidateCodeFormSubmitting}
                    isDisabled={isOffline}
                />
            </View>
        </ScrollView>
    );
}

MFAFactorAuthenticatorForm.displayName = 'MFAFactorAuthenticatorForm';

export default memo(MFAFactorAuthenticatorForm);
