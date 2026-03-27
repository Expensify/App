import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
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

    return <LinkedActionNotFoundGate reportActionIDFromRoute={reportActionIDFromRoute}>{children}</LinkedActionNotFoundGate>;
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

    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);
    const [isNavigatingToDeletedAction, setIsNavigatingToDeletedAction] = useState(false);
    const [firstRender, setFirstRender] = useState(true);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const reportID = report?.reportID;
    const isReportArchived = useReportIsArchived(report?.reportID);

    const {reportActions: unfilteredReportActions, linkedAction, sortedAllReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    // --- Linked action status ---
    const actionReportID = linkedAction?.reportID ?? reportID;
    const isLinkedActionDeleted = (() => {
        if (!linkedAction) {
            return false;
        }
        if (!actionReportID) {
            return true;
        }
        return !isReportActionVisible(linkedAction, actionReportID, canUserPerformWriteAction(report, isReportArchived), visibleReportActionsData);
    })();

    const prevIsLinkedActionDeleted = usePrevious(linkedAction ? isLinkedActionDeleted : undefined);
    const lastReportActionIDFromRoute = usePrevious(!firstRender ? reportActionIDFromRoute : undefined);

    const isLinkedActionInaccessibleWhisper = !!linkedAction && isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isLinkedActionDeleted && isNavigatingToDeletedAction) ||
        (!reportMetadata?.isLoadingInitialReportActions &&
            !!reportActionIDFromRoute &&
            !!sortedAllReportActions &&
            sortedAllReportActions?.length > 0 &&
            reportActions.length === 0 &&
            !isLinkingToMessage);

    // Track firstRender
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFirstRender(false);
    }, []);

    // Reset isLinkingToMessage
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setIsLinkingToMessage(false);
        });
    }, [reportMetadata?.isLoadingInitialReportActions]);

    // Handle deleted linked action
    useEffect(() => {
        if (!isLinkedActionDeleted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsNavigatingToDeletedAction(false);
            return;
        }
        if (lastReportActionIDFromRoute !== reportActionIDFromRoute) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsNavigatingToDeletedAction(true);
            return;
        }
        if (!isNavigatingToDeletedAction && prevIsLinkedActionDeleted === false) {
            Navigation.setParams({reportActionID: ''});
        }
    }, [isLinkedActionDeleted, prevIsLinkedActionDeleted, lastReportActionIDFromRoute, reportActionIDFromRoute, isNavigatingToDeletedAction]);

    // Handle inaccessible whisper
    useEffect(() => {
        if (!isLinkedActionInaccessibleWhisper) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Navigation.setParams({reportActionID: ''});
        });
    }, [isLinkedActionInaccessibleWhisper]);

    const navigateToEndOfReport = () => {
        Navigation.setParams({reportActionID: ''});
    };

    const lastRoute = usePrevious(route);

    // Render-time guard: prevent flash while linking state syncs
    if ((lastRoute !== route || lastReportActionIDFromRoute !== reportActionIDFromRoute) && isLinkingToMessage !== !!reportActionIDFromRoute) {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
        return null;
    }

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
