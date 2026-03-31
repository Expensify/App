import {findFocusedRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import {getPreloadedBlobURLs, preloadAuthImages, revokeCachedAuthImage} from '@hooks/useCachedImageSource';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    isFromReviewDuplicates?: boolean;
};

const parentReportActionIDsSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) => {
    const parentActions = new Map<string, OnyxTypes.ReportAction>();
    for (const action of Object.values(reportActions ?? {})) {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (!transactionID) {
            continue;
        }
        parentActions.set(transactionID, action);
    }
    return parentActions;
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const session = useSession();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {markReportIDAsExpense} = useWideRHPActions();

    const {prevTransactionID, nextTransactionID} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevTransactionID: undefined, nextTransactionID: undefined};
        }

        const currentTransactionIndex = transactionIDsList.findIndex((id) => id === currentTransactionID);

        const prevID = currentTransactionIndex > 0 ? transactionIDsList.at(currentTransactionIndex - 1) : undefined;
        const nextID = transactionIDsList.at(currentTransactionIndex + 1);

        return {
            prevTransactionID: prevID,
            nextTransactionID: nextID,
        };
    }, [currentTransactionID, transactionIDsList]);

    const prevNextTransactionsSelector = useCallback(
        (allTransactions: OnyxCollection<OnyxTypes.Transaction>) =>
            [currentTransactionID, prevTransactionID, nextTransactionID].map((transactionID) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]),
        [currentTransactionID, nextTransactionID, prevTransactionID],
    );

    const [[currentTransaction, prevTransaction, nextTransaction] = getEmptyArray<OnyxTypes.Transaction>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: prevNextTransactionsSelector,
    });

    const parentReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            let reportActions = {};
            for (const transaction of [currentTransaction, prevTransaction, nextTransaction]) {
                reportActions = {...reportActions, ...allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`]};
            }
            return parentReportActionIDsSelector(reportActions);
        },
        [currentTransaction, nextTransaction, prevTransaction],
    );

    const [parentReportActions = new Map<string, OnyxTypes.ReportAction>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: parentReportActionsSelector,
    });

    const {prevParentReportAction, nextParentReportAction} = useMemo(() => {
        if (!transactionIDsList || transactionIDsList.length < 2) {
            return {prevParentReportAction: undefined, nextParentReportAction: undefined};
        }

        return {
            prevParentReportAction: prevTransactionID ? parentReportActions.get(prevTransactionID) : undefined,
            nextParentReportAction: nextTransactionID ? parentReportActions.get(nextTransactionID) : undefined,
        };
    }, [nextTransactionID, parentReportActions, prevTransactionID, transactionIDsList]);

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`);
    const [prevThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`);
    const [nextThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`);

    const prepareReceiptsToPreload = (sources: Array<ReceiptSource | undefined>): string[] => {
        return sources
            .map((source: ReceiptSource | undefined) => {
                if (!source) {
                    return;
                }
                const uri = tryResolveUrlFromApiRoot(source);
                return typeof uri === 'string' ? uri : undefined;
            })
            .filter((uri): uri is string => !!uri);
    };

    /* TODO: make the hook WEB only! */
    /**
     * Preload receipt images for the current, previous, and next transactions into blob URLs
     * so that useCachedImageSource can resolve them synchronously (avoiding a loading flash on navigation).
     * Also revokes blob URLs for images that have left the prev/current/next window.
     * Full cleanup happens in clearActiveTransactionIDs when the user leaves the transaction view.
     * */
    useEffect(() => {
        const authToken = session?.encryptedAuthToken;
        if (!authToken) {
            return;
        }

        const headers = {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken};
        const urisToPreload: Array<ReceiptSource | undefined> = [];

        for (const transaction of [currentTransaction, prevTransaction, nextTransaction]) {
            if (!transaction) {
                continue;
            }
            const receiptURIs = getThumbnailAndImageURIs(transaction);
            if (!receiptURIs.isLocalFile) {
                urisToPreload.push(receiptURIs.image, receiptURIs.thumbnail);
            }
        }

        const preloadedURLs = getPreloadedBlobURLs();
        const receiptsToPreload = prepareReceiptsToPreload(urisToPreload);

        // Revoke blob URLs for images that left the prev/next window
        for (const oldURI of preloadedURLs.keys()) {
            if (!receiptsToPreload.includes(oldURI)) {
                revokeCachedAuthImage(oldURI);
            }
        }

        preloadAuthImages(receiptsToPreload, headers);
    }, [prevTransaction, nextTransaction, currentTransaction, session?.encryptedAuthToken]);

    /**
     * We clear the sibling transactionThreadIDs when unmounting this component
     * only when the mount actually goes to a different SCREEN (and not a different version of the same SCREEN)
     */
    useEffect(() => {
        return () => {
            const focusedRoute = findFocusedRoute(navigationRef.getRootState());
            if (focusedRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || focusedRoute?.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW) {
                return;
            }
            clearActiveTransactionIDs();
        };
    }, []);

    if (transactionIDsList.length < 2) {
        return;
    }

    const onNext = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }
        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {reportID: nextThreadReportID, backTo};

        if (nextThreadReportID) {
            markReportIDAsExpense(nextThreadReportID);
        }
        // We know that the next thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
        if (!nextThreadReport && nextThreadReportID) {
            setOptimisticTransactionThread(nextThreadReportID, parentReport?.reportID, nextParentReportAction?.reportActionID, parentReport?.policyID);
        }
        // The transaction thread doesn't exist yet, so we should create it
        if (!nextThreadReportID) {
            const transactionThreadReport = createTransactionThreadReport(
                introSelected,
                currentUserEmail ?? '',
                currentUserAccountID,
                betas,
                parentReport,
                nextParentReportAction,
                nextTransaction,
            );
            navigationParams.reportID = transactionThreadReport?.reportID;
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating
        requestAnimationFrame(() => Navigation.setParams(navigationParams));
    };

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }
        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {reportID: prevThreadReportID, backTo};

        if (prevThreadReportID) {
            markReportIDAsExpense(prevThreadReportID);
        }
        // We know that the previous thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
        if (!prevThreadReport && prevThreadReportID) {
            setOptimisticTransactionThread(prevThreadReportID, parentReport?.reportID, prevParentReportAction?.reportActionID, parentReport?.policyID);
        }
        // The transaction thread doesn't exist yet, so we should create it
        if (!prevThreadReportID) {
            const transactionThreadReport = createTransactionThreadReport(
                introSelected,
                currentUserEmail ?? '',
                currentUserAccountID,
                betas,
                parentReport,
                prevParentReportAction,
                prevTransaction,
            );
            navigationParams.reportID = transactionThreadReport?.reportID;
        }
        // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating
        requestAnimationFrame(() => Navigation.setParams(navigationParams));
    };

    return (
        <PrevNextButtons
            isPrevButtonDisabled={!prevTransactionID}
            isNextButtonDisabled={!nextTransactionID}
            onNext={onNext}
            onPrevious={onPrevious}
        />
    );
}

export default MoneyRequestReportTransactionsNavigation;
