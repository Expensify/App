import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {createTransactionThreadReport, openReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {GestureResponderEvent} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';

import {findFocusedRoute, useIsFocused} from '@react-navigation/native';
import React, {startTransition, useCallback, useEffect, useMemo, useRef} from 'react';

type MoneyRequestReportRHPNavigationButtonsProps = {
    currentTransactionID: string;
    isFromReviewDuplicates?: boolean;
};

function MoneyRequestReportTransactionsNavigation({currentTransactionID, isFromReviewDuplicates}: MoneyRequestReportRHPNavigationButtonsProps) {
    const [transactionIDsList = getEmptyArray<string>()] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);
    const [siblingDescriptorsByTransactionID] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const personalDetails = usePersonalDetails();

    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {markReportRHPWidth} = useWideRHPActions();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    // The sibling an arrow press is waiting on, with the route it was made from so a stale replay can be dropped.
    const pendingSiblingRef = useRef<{transactionID: string; originRoute: string} | null>(null);

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

    // Only the prev/next parent actions are ever read, so resolve them inside the selector instead of returning
    // a Map of every money request action on the three parent reports (fast-equals compares Maps in O(n^2)).
    const parentReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<OnyxTypes.ReportActions>) => {
            let prevParentReportAction: OnyxTypes.ReportAction | undefined;
            let nextParentReportAction: OnyxTypes.ReportAction | undefined;
            if (!prevTransactionID && !nextTransactionID) {
                return {prevParentReportAction, nextParentReportAction};
            }
            const parentReportIDs = new Set([currentTransaction?.reportID, prevTransaction?.reportID, nextTransaction?.reportID]);
            for (const parentReportID of parentReportIDs) {
                for (const action of Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`] ?? {})) {
                    const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
                    if (!transactionID) {
                        continue;
                    }
                    if (transactionID === prevTransactionID) {
                        prevParentReportAction = action;
                    }
                    if (transactionID === nextTransactionID) {
                        nextParentReportAction = action;
                    }
                }
            }
            return {prevParentReportAction, nextParentReportAction};
        },
        [currentTransaction?.reportID, nextTransaction?.reportID, nextTransactionID, prevTransaction?.reportID, prevTransactionID],
    );

    const [parentReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: parentReportActionsSelector,
    });

    const prevParentReportAction = parentReportActions?.prevParentReportAction;
    const nextParentReportAction = parentReportActions?.nextParentReportAction;

    const [prevParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevTransaction?.reportID}`);
    const [nextParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextTransaction?.reportID}`);
    const [prevThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${prevParentReportAction?.childReportID}`);
    const [nextThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nextParentReportAction?.childReportID}`);

    /**
     * We clear the sibling transactionThreadIDs when unmounting this component
     * only when the mount actually goes to a different SCREEN (and not a different version of the same SCREEN)
     */
    useEffect(() => {
        return () => {
            const focusedRoute = findFocusedRoute(navigationRef.getRootState());
            if (focusedRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || focusedRoute?.name === SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_REVIEW) {
                return;
            }
            clearActiveTransactionIDs();
        };
    }, []);

    // Holds the press rather than dropping it: fetching the sibling's parent report brings in the IOU action the
    // thread hangs off, and the effect below replays the press once it lands.
    const stageSiblingPress = (transactionID: string | undefined, parentReportID: string | undefined) => {
        // Offline there is no fetch to wait for, so the caller builds the thread optimistically instead.
        if (!transactionID || !parentReportID || isOffline) {
            return false;
        }
        pendingSiblingRef.current = {transactionID, originRoute: Navigation.getActiveRoute()};
        openReport({reportID: parentReportID, introSelected, conciergeChat, betas, currentUserAccountID, hasReportActions: true});
        return true;
    };

    const onNext = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }

        // Snapshot-backed flows (e.g. Home "Recently added") seed a descriptor per sibling because the sibling
        // transactions may be absent from the main Onyx collections. Resolve the target sibling lazily here so
        // we only ever create a thread for the expense the user actually navigates to, then let OpenReport
        // hydrate it on arrival.
        const nextDescriptor = nextTransactionID ? siblingDescriptorsByTransactionID?.[nextTransactionID] : undefined;
        if (nextDescriptor) {
            requestAnimationFrame(() => {
                const nextReportID = getReportIDToOpenForExpense(nextDescriptor, {
                    introSelected,
                    conciergeChat,
                    betas,
                    currentUserEmail,
                    currentUserAccountID,
                    personalDetails,
                });
                markReportRHPWidth(nextReportID, 'wide');
                requestAnimationFrame(() =>
                    startTransition(() =>
                        Navigation.setParams({
                            reportID: nextReportID,
                            reportActionID: undefined,
                            backTo,
                        }),
                    ),
                );
            });
            return;
        }

        // A thread created before the parent action loads would have no parent, so wait for the fetch.
        if (!nextParentReportAction && stageSiblingPress(nextTransactionID, nextTransaction?.reportID)) {
            return;
        }

        const nextThreadReportID = nextParentReportAction?.childReportID;
        const navigationParams = {
            reportID: nextThreadReportID,
            reportActionID: undefined,
            backTo,
        };

        requestAnimationFrame(() => {
            if (nextThreadReportID) {
                markReportRHPWidth(nextThreadReportID, 'wide');
            }
            // We know that the next thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
            if (!nextThreadReport && nextThreadReportID) {
                setOptimisticTransactionThread(nextThreadReportID, nextParentReport?.reportID, nextParentReportAction?.reportActionID, nextParentReport?.policyID);
            }
            // The transaction thread doesn't exist yet, so we should create it
            if (!nextThreadReportID) {
                const transactionThreadReport = createTransactionThreadReport({
                    introSelected,
                    conciergeChat,
                    currentUserLogin: currentUserEmail ?? '',
                    currentUserAccountID,
                    betas,
                    iouReport: nextParentReport,
                    iouReportAction: nextParentReportAction,
                    transaction: nextTransaction,
                    personalDetails,
                });
                navigationParams.reportID = transactionThreadReport?.reportID;
            }
            // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating
            requestAnimationFrame(() => startTransition(() => Navigation.setParams(navigationParams)));
        });
    };

    const onPrevious = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        e?.preventDefault();

        let backTo = Navigation.getActiveRoute();
        if (isFromReviewDuplicates) {
            const currentRoute = navigationRef.getCurrentRoute();
            const params = currentRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined;
            backTo = params?.backTo ?? backTo;
        }

        // See onNext: resolve the target sibling lazily from its descriptor when present.
        const prevDescriptor = prevTransactionID ? siblingDescriptorsByTransactionID?.[prevTransactionID] : undefined;
        if (prevDescriptor) {
            requestAnimationFrame(() => {
                const prevReportID = getReportIDToOpenForExpense(prevDescriptor, {
                    introSelected,
                    conciergeChat,
                    betas,
                    currentUserEmail,
                    currentUserAccountID,
                    personalDetails,
                });
                markReportRHPWidth(prevReportID, 'wide');
                requestAnimationFrame(() =>
                    startTransition(() =>
                        Navigation.setParams({
                            reportID: prevReportID,
                            reportActionID: undefined,
                            backTo,
                        }),
                    ),
                );
            });
            return;
        }

        // A thread created before the parent action loads would have no parent, so wait for the fetch.
        if (!prevParentReportAction && stageSiblingPress(prevTransactionID, prevTransaction?.reportID)) {
            return;
        }

        const prevThreadReportID = prevParentReportAction?.childReportID;
        const navigationParams = {
            reportID: prevThreadReportID,
            reportActionID: undefined,
            backTo,
        };

        requestAnimationFrame(() => {
            if (prevThreadReportID) {
                markReportRHPWidth(prevThreadReportID, 'wide');
            }
            // We know that the previous thread report exists, it just wasn't fetched to Onyx yet, so we set it optimistically.
            if (!prevThreadReport && prevThreadReportID) {
                setOptimisticTransactionThread(prevThreadReportID, prevParentReport?.reportID, prevParentReportAction?.reportActionID, prevParentReport?.policyID);
            }
            // The transaction thread doesn't exist yet, so we should create it
            if (!prevThreadReportID) {
                const transactionThreadReport = createTransactionThreadReport({
                    introSelected,
                    conciergeChat,
                    currentUserLogin: currentUserEmail ?? '',
                    currentUserAccountID,
                    betas,
                    iouReport: prevParentReport,
                    iouReportAction: prevParentReportAction,
                    transaction: prevTransaction,
                    personalDetails,
                });
                navigationParams.reportID = transactionThreadReport?.reportID;
            }
            // Wait for the next frame to ensure Onyx has processed the optimistic data updates from setOptimisticTransactionThread or createTransactionThreadReport before navigating
            requestAnimationFrame(() => startTransition(() => Navigation.setParams(navigationParams)));
        });
    };

    // Replays a staged press once its parent action arrives, but only if the user is still where they pressed —
    // this screen stays mounted under a pushed RHP, and resuming from there would yank them out with a stale backTo.
    useEffect(() => {
        const pending = pendingSiblingRef.current;
        if (!pending) {
            return;
        }
        if (!isFocused || Navigation.getActiveRoute() !== pending.originRoute) {
            pendingSiblingRef.current = null;
            return;
        }
        if (pending.transactionID === nextTransactionID && nextParentReportAction) {
            pendingSiblingRef.current = null;
            onNext(undefined);
            return;
        }
        if (pending.transactionID === prevTransactionID && prevParentReportAction) {
            pendingSiblingRef.current = null;
            onPrevious(undefined);
        }
    });

    if (transactionIDsList.length < 2) {
        return;
    }

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
