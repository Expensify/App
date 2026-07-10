import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useImportPersonalPlaidAccounts from '@hooks/useImportPersonalPlaidAccounts';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getUAForWebView from '@libs/getUAForWebView';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import PersonalCardsErrorConfirmation from '@pages/settings/Wallet/PersonalCards/PersonalCardsErrorConfirmation';
import useGetNewPersonalCard from '@pages/settings/Wallet/PersonalCards/useGetNewPersonalCard';

import {getPersonalCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import {clearAddNewPersonalCardErrors, setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {WebViewNavigation} from 'react-native-webview';

import React, {useEffect, useRef, useState} from 'react';
import {WebView} from 'react-native-webview';

function BankConnection() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);
    const selectedBank = addNewCard?.data?.selectedBank;
    const bankName = addNewCard?.data?.plaidConnectedFeed ?? selectedBank;
    const plaidToken = addNewCard?.data?.publicToken;
    const isPlaid = !!plaidToken;
    const url = getPersonalCardBankConnection(bankName);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const headerTitle = translate('workspace.companyCards.addCards');
    const onImportPlaidAccounts = useImportPersonalPlaidAccounts();
    const newCard = useGetNewPersonalCard();
    const isNewCardError = !isEmptyObject(addNewCard?.errors);
    const fullscreenReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'PersonalCardBankConnection',
    };
    const activityReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'PersonalCardBankConnection',
        isConnectionCompleted,
        isPlaid,
        isNewCardError,
    };

    const renderLoading = () => <FullScreenLoadingIndicator reasonAttributes={fullscreenReasonAttributes} />;

    const handleBackButtonPress = () => {
        // Clear the previous attempt's errors so a retry can send a new AddPersonalPlaidCard request
        clearAddNewPersonalCardErrors();
        setAddNewPersonalCardStepAndData({step: CONST.PERSONAL_CARDS.STEP.SELECT_BANK});
    };

    useEffect(() => {
        if (!url && !isPlaid) {
            return;
        }

        if (isNewCardError) {
            return;
        }

        if (newCard && !isNewCardError) {
            setAddNewPersonalCardStepAndData({
                step: CONST.PERSONAL_CARDS.STEP.SUCCESS,
            });
        }
        if (isPlaid) {
            onImportPlaidAccounts();
        }
    }, [url, isPlaid, onImportPlaidAccounts, newCard, isNewCardError]);

    const checkIfConnectionCompleted = (navState: WebViewNavigation) => {
        if (!navState.url.includes(ROUTES.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };

    return (
        <ScreenWrapper
            testID="BankConnection"
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                {!!url && !isConnectionCompleted && !isPlaid && !isNewCardError && (
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: url,
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        userAgent={getUAForWebView()}
                        incognito
                        onNavigationStateChange={checkIfConnectionCompleted}
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                )}
                {(isConnectionCompleted || isPlaid) && !isNewCardError && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        reasonAttributes={activityReasonAttributes}
                    />
                )}
                {isNewCardError && <PersonalCardsErrorConfirmation />}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default BankConnection;
