import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {isMobileSafari} from '@libs/Browser';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidTwoFactorCode} from '@libs/ValidationUtils';
import {clearAccountMessages, validateTwoFactorAuth} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useThemeStyles from '@hooks/useThemeStyles';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Navigation from '@libs/Navigation/Navigation';
import ScrollView from '@components/ScrollView';
import { View } from 'react-native';
import Text from '@components/Text';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import useNetwork from '@hooks/useNetwork';

function MFAFactorAuthenticatorPage() {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string}>({});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const inputRef = useRef<MagicCodeInputHandle | null>(null);
    const shouldClearData = account?.needsTwoFactorAuthSetup ?? false;

    const clearAccountErrorsIfPresent = useCallback(() => {
        if (!account?.errors) {
            return;
        }
        clearAccountMessages();
    }, [account?.errors]);

    const onCodeInput = useCallback(
        (text: string) => {
            setTwoFactorAuthCode(text);
            setFormError((prev) => ({...prev, twoFactorAuthCode: undefined}));
            clearAccountErrorsIfPresent();
        },
        [clearAccountErrorsIfPresent],
    );

    const validateAndSubmitForm = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
        const sanitizedTwoFactorCode = twoFactorAuthCode.trim();
        if (!sanitizedTwoFactorCode) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth')});
            return;
        }

        if (!isValidTwoFactorCode(sanitizedTwoFactorCode)) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa')});
            return;
        }

        setFormError({});

        validateTwoFactorAuth(sanitizedTwoFactorCode, shouldClearData); // TODO: zweryfikowac czy jest to odpowiedni endpoint i czy powinien byc handlowany w taki sposob
        Navigation.dismissModal(); // TODO: Jakies szmery bajery tutaj - wiemy ze jesli tutaj jestesmy to jest to nasz drugi factor czyli pewnie jakies handlowanie contextu i nawigacja do powiadomienia
    }, [translate, twoFactorAuthCode, shouldClearData]);

    useFocusEffect(
        useCallback(() => {
            if (!inputRef.current) {
                return;
            }
            // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
            if (!isMobileSafari()) {
                setTimeout(() => {
                    inputRef.current?.focusLastSelected();
                }, CONST.ANIMATED_TRANSITION);
            } else {
                inputRef.current?.focusLastSelected();
            }
        }, []),
    );

    const errorMessage = getLatestErrorMessage(account);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID={MFAFactorAuthenticatorPage.displayName}
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <FullPageOfflineBlockingView>
                <ScrollView
                    style={[styles.w100, styles.h100, styles.flex1]}
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.ph5, styles.mt3, styles.mb5, styles.flex1]}>
                        <Text style={styles.mb3}>{translate('multiFactorAuthentication.biometrics.fallbackPage2FAContent')}</Text>
                        <MagicCodeInput
                            autoComplete='one-time-code'
                            name="twoFactorAuthCode"
                            value={twoFactorAuthCode}
                            onChangeText={onCodeInput}
                            onFulfill={validateAndSubmitForm}
                            errorText={formError.twoFactorAuthCode ?? errorMessage}
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
                            // isLoading={isValidateCodeFormSubmitting || isVerifying}
                            isDisabled={isOffline}
                        />
                    </View>
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFAFactorAuthenticatorPage.displayName = 'MFAFactorAuthenticatorPage'

export default MFAFactorAuthenticatorPage;