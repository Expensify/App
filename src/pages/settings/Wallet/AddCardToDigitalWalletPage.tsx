import ButtonDisabledWhenOffline from '@components/Button/ButtonDisabledWhenOffline';
import Button from '@components/ButtonComposed';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';

import {approveDigitalWalletCardAddition, clearCardListErrors} from '@libs/actions/Card';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getWalletProviderNameKey, isCardPendingDigitalWalletApproval} from '@libs/CardUtils';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type AddCardToDigitalWalletPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_ADD_TO_DIGITAL_WALLET>;

type SubmittedWalletRequest = {
    answer: 'approve' | 'deny';
    walletName: string;
};

function AddCardToDigitalWalletPage({
    route: {
        params: {cardID},
    },
}: AddCardToDigitalWalletPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CardIntoWallet', 'ThumbsUpStars', 'CardDenied']);
    const primaryLogin = usePrimaryContactMethod();

    const [cardList, cardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const card = cardList?.[cardID];
    const latestError = getLatestErrorMessageField(card);

    const [isVerifying, setIsVerifying] = useState(false);
    const [submittedRequest, setSubmittedRequest] = useState<SubmittedWalletRequest>();

    const pendingApproval = card?.nameValuePairs?.pendingDigitalWalletApproval;

    // Last four digits the cardholder confirmed, or the card's own last four
    const lastFourDigits = pendingApproval?.cardLastFourDigits ?? card?.lastFourPAN ?? '';

    const currentWalletName = translate(`addCardToDigitalWallet.${getWalletProviderNameKey(pendingApproval?.walletProvider)}`);
    const walletName = submittedRequest?.walletName ?? currentWalletName;

    // The backend drops the pending approval after the request is resolved, so a still-pending card means it failed
    const hasPendingApproval = isCardPendingDigitalWalletApproval(card);
    const requestStatus = (() => {
        if (!submittedRequest) {
            return 'idle';
        }
        if (card?.isLoading) {
            return 'submitting';
        }
        return hasPendingApproval ? 'failed' : 'resolved';
    })();

    useEffect(() => {
        if (!card?.cardID) {
            return;
        }
        clearCardListErrors(card.cardID);
    }, [card?.cardID]);

    if (!card && isLoadingOnyxValue(cardListMetadata)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!card || (!hasPendingApproval && !submittedRequest)) {
        return <NotFoundPage />;
    }

    const denyRequest = () => {
        setSubmittedRequest({answer: 'deny', walletName: currentWalletName});
        approveDigitalWalletCardAddition(card.cardID, false);
    };

    const confirmRequest = (validateCode: string) => {
        setSubmittedRequest({answer: 'approve', walletName: currentWalletName});
        approveDigitalWalletCardAddition(card.cardID, true, validateCode);
    };

    if (isVerifying && requestStatus !== 'resolved') {
        return (
            <ValidateCodeActionContent
                validateCodeActionErrorField="approveDigitalWalletCardAddition"
                handleSubmitForm={confirmRequest}
                isLoading={requestStatus === 'submitting'}
                title={translate('addCardToDigitalWallet.verifyTitle')}
                descriptionPrimary={translate('addCardToDigitalWallet.enterSecurityCode', primaryLogin ?? '')}
                sendValidateCode={() => requestValidateCodeAction({reasonCode: CONST.EXPENSIFY_CARD.APPROVE_DIGITAL_WALLET_VALIDATE_CODE_REASON, reasonCardID: card.cardID})}
                validateError={latestError}
                clearError={() => clearCardListErrors(card.cardID)}
                onClose={() => setIsVerifying(false)}
            />
        );
    }

    if (requestStatus === 'resolved') {
        const isSuccess = submittedRequest?.answer === 'approve';

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
                    illustrationStyle={styles.digitalWalletResultIllustration}
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
                illustrationStyle={styles.digitalWalletConfirmIllustration}
                descriptionStyle={styles.textSupporting}
            />
            {/* The footer is out of the layout flow so showing an error grows it without shrinking the page above and nudging the illustration up */}
            <FixedFooter shouldStickToBottom>
                <OfflineWithFeedback
                    shouldDisplayErrorAbove
                    errors={latestError}
                    errorRowStyles={styles.mb3}
                    onClose={() => clearCardListErrors(card.cardID)}
                >
                    {requestStatus === 'submitting' ? (
                        <View style={[styles.w100, styles.justifyContentCenter, styles.componentHeightLarge]}>
                            <LoadingIndicator iconSize={28} />
                        </View>
                    ) : (
                        <View style={[styles.flexRow, styles.gap2]}>
                            <ButtonDisabledWhenOffline
                                variant={CONST.BUTTON_VARIANT.DANGER}
                                size={CONST.BUTTON_SIZE.LARGE}
                                style={styles.flex1}
                                onPress={denyRequest}
                            >
                                <Button.Text>{translate('addCardToDigitalWallet.deny')}</Button.Text>
                            </ButtonDisabledWhenOffline>
                            <ButtonDisabledWhenOffline
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                size={CONST.BUTTON_SIZE.LARGE}
                                style={styles.flex1}
                                onPress={() => setIsVerifying(true)}
                            >
                                <Button.Text>{translate('addCardToDigitalWallet.confirm')}</Button.Text>
                            </ButtonDisabledWhenOffline>
                        </View>
                    )}
                </OfflineWithFeedback>
            </FixedFooter>
        </ScreenWrapper>
    );
}

AddCardToDigitalWalletPage.displayName = 'AddCardToDigitalWalletPage';

export default AddCardToDigitalWalletPage;
