import {useCallback, useEffect, useRef} from 'react';
import useImportPlaidAccounts from '@hooks/useImportPlaidAccounts';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import CONST from '@src/CONST';
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
    const shouldBlockWindowOpen = useRef(false);

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
                const hasBrokenConnection = !!cardFeeds?.[feed]?.errors;
                if (hasBrokenConnection) {
                    onFailure?.();
                    return;
                }
                onSuccess?.();
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
            onSuccess?.(newFeed);
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
        onSuccess,
        onFailure,
        cardFeeds,
        shouldOpenWindow,
    ]);

    return {
        onOpenBankConnectionFlow,
        handleBackButtonPress,
    };
}
