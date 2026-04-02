import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {isReportActionVisible, isWhisperAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {getReportActionByIDSelector} from '@src/selectors/ReportAction';
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
import type {ReportActions} from '@src/types/onyx';

type LinkedActionNotFoundGuardProps = {
    children: ReactNode;
};

// eslint-disable-next-line rulesdir/no-negated-variables
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

// eslint-disable-next-line rulesdir/no-negated-variables
function LinkedActionNotFoundGate({reportActionIDFromRoute, children}: LinkedActionNotFoundGateProps) {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const styles = useThemeStyles();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [isLoadingInitialReportActions = true] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const [linkedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDFromRoute}`, {
        selector: (actions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(actions, reportActionIDFromRoute),
    });
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
    // before openReport() fires its optimistic update — without this guard we'd flash "not found".
    const [hasSeenLoadingCycle, setHasSeenLoadingCycle] = useState(false);
    if (isLoadingInitialReportActions && !hasSeenLoadingCycle) {
        setHasSeenLoadingCycle(true);
    }

    // Show "comment not found" when:
    // 1. The linked action doesn't exist in the report's actions collection (after loading completes)
    // 2. The linked action exists but is deleted/hidden, and was never visible during this mount
    //    (if it gets deleted while viewing, the effect below navigates away instead)
    // Note: the inaccessible whisper case is handled separately by the whisper effect.
    //
    // This intentionally does NOT guard against "report actions exist but the filtered/paginated
    // view is empty" — that's a report view concern, not a linked-action-not-found concern.
    // Showing "comment not found" for an action that exists in the collection is incorrect.
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isLinkedActionDeleted && !wasEverVisible) || (hasSeenLoadingCycle && !isLoadingInitialReportActions && !linkedAction);

    useEffect(() => {
        if (!shouldShowNotFoundLinkedAction) {
            return;
        }

        Log.info('[ReportScreen] Displaying NotFound Page for linked action', false, {
            reportIDFromRoute,
            reportActionIDFromRoute,
            isLoadingInitialReportActions,
            hasSeenLoadingCycle,
            isLinkedActionDeleted,
            isLinkedActionInaccessibleWhisper,
            wasEverVisible,
            linkedActionExists: !!linkedAction,
        });
    }, [
        shouldShowNotFoundLinkedAction,
        reportIDFromRoute,
        reportActionIDFromRoute,
        isLoadingInitialReportActions,
        hasSeenLoadingCycle,
        isLinkedActionDeleted,
        isLinkedActionInaccessibleWhisper,
        wasEverVisible,
        linkedAction,
    ]);

    // Action was deleted while we were viewing it — navigate away
    useEffect(() => {
        if (!isLinkedActionDeleted || !wasEverVisible) {
            return;
        }
        Navigation.setParams({reportActionID: ''});
    }, [isLinkedActionDeleted, wasEverVisible]);

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
            Navigation.setParams({reportActionID: ''});
        });
        return () => {
            ignore = true;
        };
    }, [isLinkedActionInaccessibleWhisper]);

    const navigateToEndOfReport = () => {
        Navigation.setParams({reportActionID: ''});
    };

    return (
        <FullPageNotFoundView
            shouldShow={shouldShowNotFoundLinkedAction}
            subtitleKey="notFound.commentYouLookingForCannotBeFound"
            subtitleStyle={[styles.textSupporting]}
            shouldShowBackButton={shouldUseNarrowLayout}
            onBackButtonPress={navigateToEndOfReport}
            shouldShowLink
            linkTranslationKey="notFound.goToChatInstead"
            subtitleKeyBelowLink="notFound.contactConcierge"
            onLinkPress={navigateToEndOfReport}
            shouldDisplaySearchRouter
        >
            {children}
        </FullPageNotFoundView>
    );
}

LinkedActionNotFoundGuard.displayName = 'LinkedActionNotFoundGuard';

export default LinkedActionNotFoundGuard;
