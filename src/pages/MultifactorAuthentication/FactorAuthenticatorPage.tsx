import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationFactorAuthenticatorForm from '@components/MultifactorAuthentication/FactorAuthenticatorForm';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {isMobileSafari} from '@libs/Browser';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isValidTwoFactorCode} from '@libs/ValidationUtils';
import {clearAccountMessages} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function MultifactorAuthenticationFactorAuthenticatorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string}>({});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const inputRef = useRef<MagicCodeInputHandle | null>(null);
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const {update} = useMultifactorAuthenticationContext();

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

        update({otp: Number(sanitizedTwoFactorCode)});
    }, [translate, twoFactorAuthCode, update]);

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

    const errorMessage = useMemo(() => getLatestErrorMessage(account), [account]);

    const formErrorText = formError.twoFactorAuthCode ?? errorMessage;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID={MultifactorAuthenticationFactorAuthenticatorPage.displayName}
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <FullPageOfflineBlockingView>
                <MultifactorAuthenticationFactorAuthenticatorForm
                    twoFactorAuthCode={twoFactorAuthCode}
                    formError={formErrorText}
                    inputRef={inputRef}
                    isValidateCodeFormSubmitting={isValidateCodeFormSubmitting}
                    onCodeInput={onCodeInput}
                    validateAndSubmitForm={validateAndSubmitForm}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationFactorAuthenticatorPage.displayName = 'MultifactorAuthenticationFactorAuthenticatorPage';

export default MultifactorAuthenticationFactorAuthenticatorPage;
