import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOneTransactionThreadReportID, isReportActionVisible, isWhisperAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {getReportActionByIDSelector} from '@src/selectors/ReportAction';
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
import type {ReportActions} from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

import cleanStaleReportActionBackToParam from './cleanStaleReportActionBackToParam';
import useAutoNavigateForDeletedLinkedAction from './hooks/useAutoNavigateForDeletedLinkedAction';

type LinkedActionNotFoundGuardProps = {
    children: ReactNode;
};

function LinkedActionNotFoundGuard({children}: LinkedActionNotFoundGuardProps) {
    const route = useRoute();
    const routeParams = route.params as {reportActionID?: string} | undefined;
    const reportActionIDFromRoute = routeParams?.reportActionID;

    if (!reportActionIDFromRoute) {
        return children;
    }

    return (
        <LinkedActionNotFoundGate
            key={reportActionIDFromRoute}
            reportActionIDFromRoute={reportActionIDFromRoute}
        >
            {children}
        </LinkedActionNotFoundGate>
    );
}

type LinkedActionNotFoundGateProps = {
    reportActionIDFromRoute: string;
    children: ReactNode;
};

function LinkedActionNotFoundGate({reportActionIDFromRoute, children}: LinkedActionNotFoundGateProps) {
    const route = useRoute();
    const navigation = useNavigation();
    const navigatorKey = navigation.getState()?.key;
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);
    const [isLoadingInitialReportActions = true] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDFromRoute}`);
    const [linkedActionInRoute] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDFromRoute}`, {
        selector: (actions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(actions, reportActionIDFromRoute),
    });

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? {}, isOffline);
    const [linkedActionInTransactionThread] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(transactionThreadReportID)}`, {
        selector: (actions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(actions, reportActionIDFromRoute),
    });

    const linkedAction = linkedActionInRoute ?? linkedActionInTransactionThread;
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const isReportArchived = useReportIsArchived(reportIDFromRoute);

    // --- Linked action status ---
    const actionReportID = linkedAction?.reportID ?? reportIDFromRoute;
    const hasNoActionReportID = !!linkedAction && !actionReportID;
    const isActionHidden =
        !!linkedAction && !!actionReportID && !isReportActionVisible(linkedAction, actionReportID, canUserPerformWriteAction(report, isReportArchived), visibleReportActionsData);
    const isLinkedActionDeleted = hasNoActionReportID || isActionHidden;

    const isLinkedActionInaccessibleWhisper = !!linkedAction && isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID);

    // Track whether the linked action was ever loaded and visible during this mount.
    // Set during render (React-supported pattern for adjusting state based on props).
    // The key={reportActionIDFromRoute} on the gate ensures this resets on navigation to a different action.
    const [wasEverVisible, setWasEverVisible] = useState(false);
    if (linkedAction && !isLinkedActionDeleted && !wasEverVisible) {
        setWasEverVisible(true);
    }

    // Track whether isLoadingInitialReportActions has been true at least once during this mount.
    // For previously loaded reports, stale metadata may already have isLoadingInitialReportActions: false
    // before openReport() fires its optimistic update — without this guard we'd navigate away prematurely.
    const [hasSeenLoadingCycle, setHasSeenLoadingCycle] = useState(false);
    if (isLoadingInitialReportActions && !hasSeenLoadingCycle) {
        setHasSeenLoadingCycle(true);
    }

    // Auto-recover to the end of the report when the linked action was NEVER visible during this mount:
    // 1. The action exists but is deleted/hidden (and was never visible)
    // 2. The action doesn't exist in the collection after loading completes (and was never visible)
    //
    // When wasEverVisible is true and the action disappears, the cleanup effect below
    // handles navigation via setParams instead.
    //
    // Note: the inaccessible whisper case is handled separately by the whisper effect.
    const isLinkedActionUnavailable =
        !wasEverVisible && !isLinkedActionInaccessibleWhisper && (isLinkedActionDeleted || (hasSeenLoadingCycle && !isLoadingInitialReportActions && !linkedAction));

    // Action was deleted or completely removed while we were viewing it — navigate away.
    // This handles both: (1) action exists but is hidden/deleted, and (2) action was
    // removed from Onyx entirely (e.g. REPORT_PREVIEW nulled out when moving IOU to workspace).
    useEffect(() => {
        if (!wasEverVisible) {
            return;
        }
        const isActionGone = isLinkedActionDeleted || (!linkedAction && !isLoadingInitialReportActions);
        if (!isActionGone) {
            return;
        }
        Navigation.setParams({reportActionID: undefined}, route.key, navigatorKey);
        // Also strip the stale reportActionID from any `backTo` params on sibling routes
        // (e.g. the IOU report screen that was navigated to FROM this deep link).
        if (reportIDFromRoute) {
            cleanStaleReportActionBackToParam(reportIDFromRoute, reportActionIDFromRoute);
        }
    }, [isLinkedActionDeleted, wasEverVisible, linkedAction, isLoadingInitialReportActions, route.key, navigatorKey, reportIDFromRoute, reportActionIDFromRoute]);

    // Handle inaccessible whisper
    useEffect(() => {
        if (!isLinkedActionInaccessibleWhisper) {
            return;
        }
        let ignore = false;
        Navigation.isNavigationReady().then(() => {
            if (ignore) {
                return;
            }
            Navigation.setParams({reportActionID: undefined}, route.key, navigatorKey);
        });
        return () => {
            ignore = true;
        };
    }, [isLinkedActionInaccessibleWhisper, route.key, navigatorKey]);

    const navigateToEndOfReport = () => {
        Navigation.setParams({reportActionID: undefined}, route.key, navigatorKey);
    };

    useAutoNavigateForDeletedLinkedAction(isLinkedActionUnavailable, navigateToEndOfReport);

    return children;
}

LinkedActionNotFoundGuard.displayName = 'LinkedActionNotFoundGuard';

export default LinkedActionNotFoundGuard;
