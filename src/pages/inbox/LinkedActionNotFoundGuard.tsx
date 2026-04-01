import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getFilteredReportActionsForReportView, isReportActionVisible, isWhisperAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';

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

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [isLoadingInitialReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const reportID = report?.reportID;
    const isReportArchived = useReportIsArchived(report?.reportID);

    const {reportActions: unfilteredReportActions, linkedAction, sortedAllReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    // --- Linked action status ---
    const actionReportID = linkedAction?.reportID ?? reportID;
    const hasNoActionReportID = !!linkedAction && !actionReportID;
    const isActionHidden =
        !!linkedAction && !!actionReportID && !isReportActionVisible(linkedAction, actionReportID, canUserPerformWriteAction(report, isReportArchived), visibleReportActionsData);
    const isLinkedActionDeleted = hasNoActionReportID || isActionHidden;

    const prevIsLinkedActionDeleted = usePrevious(linkedAction ? isLinkedActionDeleted : undefined);

    const isLinkedActionInaccessibleWhisper = !!linkedAction && isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID);

    const isNavigatedToDeletedAction = isLinkedActionDeleted && prevIsLinkedActionDeleted !== false;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isNavigatedToDeletedAction) ||
        (!isLoadingInitialReportActions && !!reportActionIDFromRoute && !!sortedAllReportActions && sortedAllReportActions?.length > 0 && reportActions.length === 0);

    // Action was deleted while we were viewing it — navigate away
    useEffect(() => {
        if (!isLinkedActionDeleted || prevIsLinkedActionDeleted !== false) {
            return;
        }
        Navigation.setParams({reportActionID: ''});
    }, [isLinkedActionDeleted, prevIsLinkedActionDeleted]);

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
