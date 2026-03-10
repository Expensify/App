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
    shouldOpenWindow?: boolean;
};

let customWindow: Window | null = null;

export default function useBankConnection({
    policyID,
    feed,
    bankNameFromRoute,
    onSuccess,
    onFailure,
    onBackButtonPress,
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

    const selectedBank = addNewCard?.data?.selectedBank;
    const bankName = feed ? getBankName(getCompanyCardFeed(feed)) : (bankNameFromRoute ?? addNewCard?.data?.plaidConnectedFeed ?? selectedBank);
    const bankDisplayName = addNewCard?.data?.plaidConnectedFeedName ?? bankName;
    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.cardToAssign?.plaidAccessToken;
    const isPlaid = !!plaidToken;
    const url = getCompanyCardBankConnection(policyID, bankName);
    const isFeedExpired = feed ? !!isSelectedFeedExpired(cardFeeds?.[feed]) : false;
    const {isNewFeedConnected, newFeed} = useMemo(
        () => checkIfNewFeedConnected(prevFeedsData ?? {}, cardFeeds ?? {}, addNewCard?.data?.plaidConnectedFeed),
        [addNewCard?.data?.plaidConnectedFeed, cardFeeds, prevFeedsData],
    );
    const isNewFeedHasError = !!(newFeed && cardFeeds?.[newFeed]?.errors);

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
        const shouldWaitForData = isOffline || isNewFeedHasError || isAllFeedsResultLoading || (isBlockedToAddNewFeeds && !feed);
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
        shouldOpenWindow,
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
    };
}
