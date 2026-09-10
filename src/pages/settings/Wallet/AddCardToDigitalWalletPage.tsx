import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import LoadingIndicator from '@components/LoadingIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';

import {approveDigitalWalletCardAddition, clearCardListErrors, getExpensifyCardPendingWalletApproval} from '@libs/actions/Card';
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
    isApproved: boolean;
    walletNameKey: ReturnType<typeof getWalletProviderNameKey>;
};

function AddCardToDigitalWalletPage({
    route: {
        params: {cardID},
    },
}: AddCardToDigitalWalletPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CardIntoWallet', 'ThumbsUpStars', 'CardDenied']);
    const primaryLogin = usePrimaryContactMethod();

    const [card, cardMetadata] = useOnyx(ONYXKEYS.CARD_LIST, {selector: (cardList) => cardList?.[cardID]});
    const [isCheckingPendingApproval] = useOnyx(ONYXKEYS.RAM_ONLY_IS_CHECKING_PENDING_WALLET_APPROVAL);
    const currentCardID = card?.cardID;
    const latestError = getLatestErrorMessageField(card);

    const [isVerifying, setIsVerifying] = useState(false);
    const [submittedRequest, setSubmittedRequest] = useState<SubmittedWalletRequest>();

    const pendingApproval = card?.nameValuePairs?.pendingDigitalWalletApproval;

    // Last four digits the cardholder confirmed, or the card's own last four
    const lastFourDigits = pendingApproval?.cardLastFourDigits ?? card?.lastFourPAN ?? '';

    const currentWalletNameKey = getWalletProviderNameKey(pendingApproval?.walletProvider);
    const walletName = translate(`addCardToDigitalWallet.${submittedRequest?.walletNameKey ?? currentWalletNameKey}`);

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
        if (isCheckingPendingApproval !== undefined) {
            return;
        }
        getExpensifyCardPendingWalletApproval();
    }, [isCheckingPendingApproval]);

    useEffect(() => {
        if (!currentCardID) {
            return;
        }
        clearCardListErrors(currentCardID);
        return () => clearCardListErrors(currentCardID);
    }, [currentCardID]);

    const isWaitingForPendingApproval = !isOffline && isCheckingPendingApproval !== false && !hasPendingApproval && !submittedRequest;

    if (isWaitingForPendingApproval || (!card && isLoadingOnyxValue(cardMetadata))) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!card || (!hasPendingApproval && !submittedRequest)) {
        return <NotFoundPage />;
    }

    const denyRequest = () => {
        setSubmittedRequest({isApproved: false, walletNameKey: currentWalletNameKey});
        approveDigitalWalletCardAddition(card.cardID, false);
    };

    const confirmRequest = (validateCode: string) => {
        setSubmittedRequest({isApproved: true, walletNameKey: currentWalletNameKey});
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
                validateCodeReasonCode={CONST.EXPENSIFY_CARD.APPROVE_DIGITAL_WALLET_VALIDATE_CODE_REASON}
                validateError={latestError}
                clearError={() => clearCardListErrors(card.cardID)}
                onClose={() => setIsVerifying(false)}
            />
        );
    }

    if (requestStatus === 'resolved') {
        const isSuccess = !!submittedRequest?.isApproved;

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID="AddCardToDigitalWalletPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton title={translate('addCardToDigitalWallet.title', {walletName})} />
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
            testID="AddCardToDigitalWalletPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton title={translate('addCardToDigitalWallet.title', {walletName})} />
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
            >
                <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
                    <View style={styles.digitalWalletConfirmIllustration}>
                        <ImageSVG
                            src={illustrations.CardIntoWallet}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>{translate('addCardToDigitalWallet.confirmHeading')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.w100]}>{translate('addCardToDigitalWallet.confirmDescription', {walletName, lastFourDigits})}</Text>
                </View>
                <View style={[styles.ph5, styles.pb5]}>
                    <OfflineWithFeedback
                        shouldDisplayErrorAbove
                        errors={latestError}
                        errorRowStyles={[styles.digitalWalletConfirmError, styles.mb2, styles.textWrap]}
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
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AddCardToDigitalWalletPage;
