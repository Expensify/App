import {useCallback, useEffect, useMemo, useRef} from 'react';
import useImportPlaidAccounts from '@hooks/useImportPlaidAccounts';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useNetwork from '@hooks/useNetwork';
import useUpdateFeedBrokenConnection from '@hooks/useUpdateFeedBrokenConnection';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {CombinedCardFeeds, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import openBankConnection from './openBankConnection';

type UseBankConnectionProps = {
    policyID?: string;
    feed?: CompanyCardFeedWithDomainID;
    isPlaid?: boolean;
    url?: string | null;
    isNewFeedConnected?: boolean;
    newFeed?: CompanyCardFeedWithDomainID;
    isFeedExpired?: boolean;
    isNewFeedHasError?: boolean;
    onSuccess?: (newFeed?: CompanyCardFeedWithDomainID) => void;
    onFailure?: () => void;
    onBackButtonPress?: () => void;
    cardFeeds?: CombinedCardFeeds;
    shouldOpenWindow?: boolean;
};

let customWindow: Window | null = null;

export default function useBankConnection({
    policyID,
    feed,
    isPlaid,
    url,
    isNewFeedConnected,
    newFeed,
    isFeedExpired,
    isNewFeedHasError,
    onSuccess,
    onFailure,
    onBackButtonPress,
    cardFeeds,
    shouldOpenWindow = true,
}: UseBankConnectionProps) {
    const {isOffline} = useNetwork();
    const onImportPlaidAccounts = useImportPlaidAccounts(policyID);
    const {isBlockedToAddNewFeeds, isAllFeedsResultLoading} = useIsBlockedToAddFeed(policyID);
    const {isFeedConnectionBroken} = useUpdateFeedBrokenConnection({policyID, feed});
    const shouldBlockWindowOpen = useRef(false);

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
            customWindow?.close();
        }

        if (onBackButtonPress) {
            onBackButtonPress();
            return;
        }

        Navigation.goBack();
    }, [shouldOpenWindow, onBackButtonPress]);

    useEffect(() => {
        if (!policyID || !isBlockedToAddNewFeeds || feed) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)), {
            forceReplace: true,
        });
    }, [isBlockedToAddNewFeeds, policyID, feed]);

    useEffect(() => {
        const hasConnectionSource = !!url || isPlaid;
        const shouldWaitForData = isOffline || (isNewFeedHasError ?? false) || isAllFeedsResultLoading || (isBlockedToAddNewFeeds && !feed);
        if (!hasConnectionSource || shouldWaitForData) {
            return;
        }

        // Handle existing feed flow
        if (feed) {
            if (!isFeedExpired) {
                if (shouldOpenWindow) {
                    customWindow?.close();
                }
                if (isFeedConnectionBroken) {
                    handleFailure();
                    return;
                }
                handleSuccess();
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
                customWindow?.close();
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
        isNewFeedConnected,
        isAllFeedsResultLoading,
        isBlockedToAddNewFeeds,
        newFeed,
        policyID,
        url,
        feed,
        isFeedExpired,
        isOffline,
        isPlaid,
        onImportPlaidAccounts,
        isNewFeedHasError,
        isFeedConnectionBroken,
        handleSuccess,
        handleFailure,
        cardFeeds,
        shouldOpenWindow,
    ]);

    return {
        onOpenBankConnectionFlow,
        handleBackButtonPress,
    };
}
