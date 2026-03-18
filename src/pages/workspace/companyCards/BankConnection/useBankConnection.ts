import {useCallback, useEffect, useMemo, useRef} from 'react';
import useCardFeeds from '@hooks/useCardFeeds';
import useImportPlaidAccounts from '@hooks/useImportPlaidAccounts';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useUpdateFeedBrokenConnection from '@hooks/useUpdateFeedBrokenConnection';
import {checkIfNewFeedConnected, getBankName, getCompanyCardFeed, isSelectedFeedExpired} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCompanyCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import openBankConnection from './openBankConnection';

type UseBankConnectionProps = {
    policyID?: string;
    feed?: CompanyCardFeedWithDomainID;
    bankNameFromRoute?: string | null;
    onSuccess?: (newFeed?: CompanyCardFeedWithDomainID) => void;
    onFailure?: () => void;
    onBackButtonPress?: () => void;
    isRefreshConnectionFlow?: boolean;
    shouldOpenWindow?: boolean;
};

let customWindow: Window | null = null;

function closeCustomWindow() {
    customWindow?.close();
}

export default function useBankConnection({
    policyID,
    feed,
    bankNameFromRoute,
    onSuccess,
    onFailure,
    onBackButtonPress,
    isRefreshConnectionFlow,
    shouldOpenWindow = true,
}: UseBankConnectionProps) {
    const {isOffline} = useNetwork();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [cardFeeds] = useCardFeeds(policyID);
    const prevFeedsData = usePrevious(cardFeeds);
    const onImportPlaidAccounts = useImportPlaidAccounts(policyID);
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);
    const {isFeedConnectionBroken} = useUpdateFeedBrokenConnection({policyID, feed});
    const shouldBlockWindowOpen = useRef(false);
    const refreshSuccessHandled = useRef(false);

    const addNewCardData = addNewCard?.data;
    const bankName = feed ? getBankName(getCompanyCardFeed(feed)) : (bankNameFromRoute ?? addNewCardData?.plaidConnectedFeed ?? addNewCardData?.selectedBank);
    const bankDisplayName = addNewCardData?.plaidConnectedFeedName ?? bankName;
    const plaidToken = addNewCardData?.publicToken ?? assignCard?.cardToAssign?.plaidAccessToken;
    const isPlaid = !!plaidToken;
    const url = getCompanyCardBankConnection(policyID, bankName);
    const isFeedExpired = feed ? !!isSelectedFeedExpired(cardFeeds?.[feed]) : false;
    const prevIsFeedExpired = usePrevious(isFeedExpired);
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds ?? {}, addNewCardData?.plaidConnectedFeed),
        [addNewCardData?.plaidConnectedFeed, cardFeeds, prevFeedsData],
    );
    const isNewFeedHasError = !!(newFeed && cardFeeds?.[newFeed]?.errors);
    const hasConnectionSource = !!url || isPlaid;
    const shouldWaitForData = isOffline || isNewFeedHasError || isAllFeedsResultLoading || (isBlockedToAddNewFeeds && !feed);

    const isRefreshComplete = useMemo(() => {
        if (!isRefreshConnectionFlow || !feed || !hasConnectionSource || shouldWaitForData) {
            return false;
        }
        return !!prevIsFeedExpired && !isFeedExpired && !isFeedConnectionBroken;
    }, [isRefreshConnectionFlow, feed, hasConnectionSource, shouldWaitForData, prevIsFeedExpired, isFeedExpired, isFeedConnectionBroken]);

    const fallbackNavigation = useCallback(() => {
        Navigation.goBack(policyID ? ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID) : undefined);
    }, [policyID]);

    const handleSuccess = useCallback(
        (connectedFeed?: CompanyCardFeedWithDomainID) => {
            if (onSuccess) {
                onSuccess(connectedFeed);
                return;
            }
            fallbackNavigation();
        },
        [onSuccess, fallbackNavigation],
    );

    const handleFailure = useMemo(() => onFailure ?? fallbackNavigation, [onFailure, fallbackNavigation]);

    const onOpenBankConnectionFlow = useCallback(() => {
        if (!url || !shouldOpenWindow) {
            return;
        }
        customWindow = openBankConnection(url);
    }, [url, shouldOpenWindow]);

    const handleBackButtonPress = useCallback(() => {
        if (shouldOpenWindow) {
            closeCustomWindow();
        }

        if (onBackButtonPress) {
            onBackButtonPress();
            return;
        }

        Navigation.goBack();
    }, [shouldOpenWindow, onBackButtonPress]);

    useEffect(() => {
        if (!isRefreshComplete || refreshSuccessHandled.current) {
            return;
        }
        refreshSuccessHandled.current = true;
        onSuccess?.();
    }, [isRefreshComplete, onSuccess]);

    useEffect(() => {
        if (!policyID || !isBlockedToAddNewFeeds || feed) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)), {
            forceReplace: true,
        });
    }, [isBlockedToAddNewFeeds, policyID, feed]);

    useEffect(() => {
        if (!hasConnectionSource || shouldWaitForData) {
            return;
        }

        // Handle existing feed flow
        if (feed) {
            if (!isFeedExpired) {
                if (shouldOpenWindow) {
                    closeCustomWindow();
                }
                if (isFeedConnectionBroken) {
                    handleFailure();
                    return;
                }
                if (!isRefreshConnectionFlow) {
                    handleSuccess();
                }
                return;
            }
            if (!isPlaid && url && shouldOpenWindow) {
                customWindow = openBankConnection(url);
            }
            return;
        }

        // Handle new feed flow
        if (isNewFeedConnected) {
            shouldBlockWindowOpen.current = true;
            if (shouldOpenWindow) {
                closeCustomWindow();
            }
            handleSuccess(newFeed);
            return;
        }

        if (!shouldBlockWindowOpen.current) {
            if (isPlaid) {
                onImportPlaidAccounts();
                return;
            }
            if (url && shouldOpenWindow) {
                customWindow = openBankConnection(url);
            }
        }
    }, [
        hasConnectionSource,
        shouldWaitForData,
        isNewFeedConnected,
        newFeed,
        policyID,
        url,
        feed,
        isFeedExpired,
        isPlaid,
        onImportPlaidAccounts,
        isFeedConnectionBroken,
        handleSuccess,
        handleFailure,
        shouldOpenWindow,
        isRefreshConnectionFlow,
    ]);

    return {
        onOpenBankConnectionFlow,
        handleBackButtonPress,
        bankName,
        bankDisplayName,
        url,
        isPlaid,
        isNewFeedHasError,
        newFeed,
        isAllFeedsResultLoading,
        isBlockedToAddNewFeeds,
        isRefreshComplete,
    };
}
