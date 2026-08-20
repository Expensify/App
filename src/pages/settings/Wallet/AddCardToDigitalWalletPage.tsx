import Button from '@components/ButtonComposed';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';

import {approveDigitalWalletCardAddition, clearCardListErrors} from '@libs/actions/Card';
import {requestValidateCodeAction} from '@libs/actions/User';
import {isCardPendingDigitalWalletApproval} from '@libs/CardUtils';
import {getLatestErrorMessage, getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type AddCardToDigitalWalletPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_ADD_TO_DIGITAL_WALLET>;

type Step = 'confirm' | 'verify' | 'success' | 'denied';

function AddCardToDigitalWalletPage({
    route: {
        params: {cardID},
    },
}: AddCardToDigitalWalletPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CardIntoWallet', 'ThumbsUpStars', 'CardDenied']);
    const primaryLogin = usePrimaryContactMethod();

    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const card = cardList?.[cardID];
    const validateError = getLatestErrorMessageField(card);
    const latestErrorMessage = getLatestErrorMessage(card);

    const [step, setStep] = useState<Step>('confirm');
    const [submittedAnswer, setSubmittedAnswer] = useState<'approve' | 'deny'>();

    const pendingApproval = card?.nameValuePairs?.pendingDigitalWalletApproval;

    // The digits the cardholder confirmed over the phone, falling back to the card's own last four
    const lastFourDigits = pendingApproval?.cardLastFourDigits ?? card?.lastFourPAN ?? '';

    // The card provider reports Google Wallet as ANDROID_PAY, and doesn't always tell us which wallet asked
    const walletProvider = pendingApproval?.walletProvider;
    let walletName = translate('addCardToDigitalWallet.digitalWallet');
    if (walletProvider === CONST.EXPENSIFY_CARD.WALLET_PROVIDER.APPLE_PAY) {
        walletName = translate('addCardToDigitalWallet.appleWallet');
    } else if (walletProvider === CONST.EXPENSIFY_CARD.WALLET_PROVIDER.ANDROID_PAY) {
        walletName = translate('addCardToDigitalWallet.googleWallet');
    }

    // The backend clears the pending approval once it resolves the request, so that's when we know the answer landed
    const hasPendingApproval = isCardPendingDigitalWalletApproval(card);
    useEffect(() => {
        if (!submittedAnswer || hasPendingApproval || card?.isLoading) {
            return;
        }

        setStep(submittedAnswer === 'approve' ? 'success' : 'denied');
    }, [submittedAnswer, hasPendingApproval, card?.isLoading]);

    const isResolvingRequest = !!submittedAnswer && !!card?.isLoading;

    const denyRequest = () => {
        setSubmittedAnswer('deny');
        approveDigitalWalletCardAddition(Number(cardID), false);
    };

    const confirmRequest = (validateCode: string) => {
        setSubmittedAnswer('approve');
        approveDigitalWalletCardAddition(Number(cardID), true, validateCode);
    };

    if (step === 'verify') {
        return (
            <ValidateCodeActionContent
                validateCodeActionErrorField="approveDigitalWalletCardAddition"
                handleSubmitForm={confirmRequest}
                isLoading={card?.isLoading}
                title={translate('addCardToDigitalWallet.verifyTitle')}
                descriptionPrimary={translate('addCardToDigitalWallet.enterSecurityCode', primaryLogin ?? '')}
                sendValidateCode={() => requestValidateCodeAction({reasonCode: CONST.EXPENSIFY_CARD.APPROVE_DIGITAL_WALLET_VALIDATE_CODE_REASON, reasonCardID: Number(cardID)})}
                validateError={validateError}
                clearError={() => clearCardListErrors(Number(cardID))}
                onClose={() => setStep('confirm')}
            />
        );
    }

    if (step === 'success' || step === 'denied') {
        const isSuccess = step === 'success';

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID={AddCardToDigitalWalletPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('addCardToDigitalWallet.title', {walletName})}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ConfirmationPage
                    heading={translate(isSuccess ? 'addCardToDigitalWallet.successHeading' : 'addCardToDigitalWallet.deniedHeading')}
                    description={translate(isSuccess ? 'addCardToDigitalWallet.successDescription' : 'addCardToDigitalWallet.deniedDescription', {walletName})}
                    illustration={isSuccess ? illustrations.ThumbsUpStars : illustrations.CardDenied}
                    descriptionStyle={styles.textSupporting}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.goBack()}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={AddCardToDigitalWalletPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('addCardToDigitalWallet.title', {walletName})}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ConfirmationPage
                heading={translate('addCardToDigitalWallet.confirmHeading')}
                description={translate('addCardToDigitalWallet.confirmDescription', {walletName, lastFourDigits})}
                illustration={illustrations.CardIntoWallet}
                descriptionStyle={styles.textSupporting}
            />
            {!!latestErrorMessage && (
                <FormHelpMessage
                    style={[styles.ph5, styles.mb3]}
                    isError
                    message={latestErrorMessage}
                />
            )}
            <FixedFooter style={[styles.flexRow, styles.gap2]}>
                {isResolvingRequest ? (
                    <View style={[styles.w100, styles.justifyContentCenter, {height: variables.componentSizeLarge}]}>
                        <LoadingIndicator iconSize={28} />
                    </View>
                ) : (
                    <>
                        <Button
                            variant={CONST.BUTTON_VARIANT.DANGER}
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={styles.flex1}
                            onPress={denyRequest}
                        >
                            <Button.Text>{translate('addCardToDigitalWallet.deny')}</Button.Text>
                        </Button>
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={styles.flex1}
                            onPress={() => setStep('verify')}
                        >
                            <Button.Text>{translate('addCardToDigitalWallet.confirm')}</Button.Text>
                        </Button>
                    </>
                )}
            </FixedFooter>
        </ScreenWrapper>
    );
}

AddCardToDigitalWalletPage.displayName = 'AddCardToDigitalWalletPage';

export default AddCardToDigitalWalletPage;
