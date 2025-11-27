import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {WebViewNavigation} from 'react-native-webview';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCardFeeds from '@hooks/useCardFeeds';
import useImportPlaidAccounts from '@hooks/useImportPlaidAccounts';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateFeedBrokenConnection from '@hooks/useUpdateFeedBrokenConnection';
import {updateSelectedFeed} from '@libs/actions/Card';
import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import {checkIfNewFeedConnected, getBankName, getCompanyCardFeed, isSelectedFeedExpired} from '@libs/CardUtils';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceCompanyCardsErrorConfirmation from '@pages/workspace/companyCards/WorkspaceCompanyCardsErrorConfirmation';
import {setAddNewCompanyCardStepAndData} from '@userActions/CompanyCards';
import {getCompanyCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

type BankConnectionProps = {
    /** ID of the policy */
    policyID?: string;

    /** Selected feed for assign card flow */
    feed?: CompanyCardFeedWithDomainID;

    /** Route params for add new card flow */
    route?: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION>;
};

function BankConnection({policyID: policyIDFromProps, feed, route}: BankConnectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const authToken = session?.authToken ?? null;
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const selectedBank = addNewCard?.data?.selectedBank;
    const {bankName: bankNameFromRoute, backTo, policyID: policyIDFromRoute} = route?.params ?? {};
    const policyID = policyIDFromProps ?? policyIDFromRoute;
    const bankName = feed ? getBankName(getCompanyCardFeed(feed)) : (bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank);
    const {isBetaEnabled} = usePermissions();
    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.data?.plaidAccessToken;
    const isPlaid = isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && !!plaidToken;

    const url = getCompanyCardBankConnection(policyID, bankName);
    const [cardFeeds] = useCardFeeds(policyID);
    const [isConnectionCompleted, setConnectionCompleted] = useState(false);
    const prevFeedsData = usePrevious(cardFeeds);
    const isFeedExpired = feed ? isSelectedFeedExpired(cardFeeds?.[feed]) : false;
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds ?? {}, addNewCard?.data?.plaidConnectedFeed),
        [addNewCard?.data?.plaidConnectedFeed, cardFeeds, prevFeedsData],
    );
    const headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    const headerTitle = feed ? translate('workspace.companyCards.assignCard') : headerTitleAddCards;
    const onImportPlaidAccounts = useImportPlaidAccounts(policyID);
    const {updateBrokenConnection, isFeedConnectionBroken} = useUpdateFeedBrokenConnection({policyID, feed});
    const isNewFeedHasError = !!(newFeed && cardFeeds?.[newFeed]?.errors);
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);

    const renderLoading = () => <FullScreenLoadingIndicator />;

    useEffect(() => {
        if (!policyID || !isBlockedToAddNewFeeds) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)), {
            forceReplace: true,
        });
    }, [isBlockedToAddNewFeeds, policyID]);

    const handleBackButtonPress = () => {
        // Handle assign card flow
        if (feed) {
            Navigation.goBack();
            return;
        }

        // Handle add new card flow
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.BREX || isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS)) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.AMEX) {
            setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED});
            return;
        }
        setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    useEffect(() => {
        if ((!url && !isPlaid) || isNewFeedHasError) {
            return;
        }

        // Handle assign card flow
        if (feed && !isFeedExpired) {
            if (isFeedConnectionBroken) {
                updateBrokenConnection();
                Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
                return;
            }
            setAssignCardStepAndData({
                currentStep: assignCard?.data?.dateOption ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.ASSIGNEE,
                isEditing: false,
            });
            return;
        }

        // Handle add new card flow
        if (isNewFeedConnected) {
            if (newFeed) {
                updateSelectedFeed(newFeed, policyID);
            }

            // Direct feeds (except those added via Plaid) are created with default statement period end date.
            // Redirect the user to set a custom date.
            if (policyID && !isPlaid) {
                setAddNewCompanyCardStepAndData({
                    step: CONST.COMPANY_CARDS.STEP.SELECT_DIRECT_STATEMENT_CLOSE_DATE,
                });
            } else {
                Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
            }
        }
        if (isPlaid) {
            onImportPlaidAccounts();
        }
    }, [
        isNewFeedConnected,
        newFeed,
        policyID,
        url,
        feed,
        isFeedExpired,
        assignCard?.data?.dateOption,
        isPlaid,
        onImportPlaidAccounts,
        isFeedConnectionBroken,
        updateBrokenConnection,
        isNewFeedHasError,
    ]);

    const checkIfConnectionCompleted = (navState: WebViewNavigation) => {
        if (!navState.url.includes(ROUTES.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };

    return (
        <ScreenWrapper
            testID={BankConnection.displayName}
            shouldShowOfflineIndicator={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                {!!url && !isConnectionCompleted && !isPlaid && !isNewFeedHasError && !isAllFeedsResultLoading && !isBlockedToAddNewFeeds && (
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
                {(isAllFeedsResultLoading || isBlockedToAddNewFeeds || isConnectionCompleted || isPlaid) && !isNewFeedHasError && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                    />
                )}
                {isNewFeedHasError && (
                    <WorkspaceCompanyCardsErrorConfirmation
                        policyID={policyID}
                        newFeed={newFeed}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
