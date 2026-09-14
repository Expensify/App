import ScrollView from '@components/ScrollView';

import useBackfillWhenNoVisibleActions from '@hooks/useBackfillWhenNoVisibleActions';
import useConciergeAskState from '@hooks/useConciergeAskState';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsListModel from '@hooks/useReportActionsListModel';
import useStartConciergeSession from '@hooks/useStartConciergeSession';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import AskConciergeEmptyState from './AskConciergeEmptyState';
import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';
import {computeReportActionsSkeletonState, ReportActionsListActionsContext, ReportActionsListStateContext} from './ReportActionsListContext';
import ReportActionsLoadingSkeleton from './ReportActionsLoadingSkeleton';

type ReportActionsSkeletonGuardProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** The report-actions list content, rendered only once content is ready */
    children: ReactNode;
};

/**
 * Skeleton gate for the report-actions list, modeled on `ReportNotFoundGuard`. Owns the data pipeline
 * (`useReportActionsListModel`) and the skeleton decision, returning either the skeleton or `children`
 * (wrapped in `ReportActionsListStateContext`/`ReportActionsListActionsContext` so they render from the same
 * pipeline). Skeleton-phase effects live in dedicated hooks here because `children` isn't mounted yet; the
 * list's UI-close hooks live in `children`, so they can't run while the skeleton shows.
 *
 */
function ReportActionsSkeletonGuard({reportID, children}: ReportActionsSkeletonGuardProps) {
    const styles = useThemeStyles();
    const isReportLoadPending = useIsReportLoadPending(reportID);
    const {shouldShowWelcome} = useConciergeAskState(reportID);
    const {readinessSignals, state, actions} = useReportActionsListModel(reportID, isReportLoadPending);
    const {shouldShowLoadingSkeleton, shouldShowDerivedTimingSkeleton} = computeReportActionsSkeletonState(readinessSignals);

    const {
        isConciergeMainDM,
        reportActionIDFromRoute,
        oldestUnreadReportAction,
        hasOnceLoadedReportActions,
        hasCachedReportActions,
        isMissingReportActions,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
    } = readinessSignals;

    // Side effects that must run whenever the chat list is shown, including while the skeleton renders.
    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);

    useStartConciergeSession({
        reportID,
        isConciergeMainDM,
        oldestUnreadReportAction,
        hasOnceLoadedReportActions,
        hasCachedReportActions,
    });

    useBackfillWhenNoVisibleActions({
        reportID,
        isMissingReportActions,
        hasOlderActions,
        hasNewerActions,
        isOffline,
        isReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        oldestReportActionID,
        loadOlderChats: actions.loadOlderChats,
    });

    if (shouldShowLoadingSkeleton || shouldShowDerivedTimingSkeleton) {
        if (shouldShowWelcome && !reportActionIDFromRoute) {
            return (
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter]}
                >
                    <View style={styles.conciergeAskColumn}>
                        <AskConciergeEmptyState />
                        <ConciergeChatHistoryToggle
                            reportID={reportID}
                            hasPreviousMessages={!!state.hasPreviousMessages}
                            shouldShowFullHistory={false}
                            onShowPreviousMessages={actions.handleShowPreviousMessages}
                            containerStyles={styles.pv5}
                        />
                    </View>
                </ScrollView>
            );
        }

        return (
            <ReportActionsLoadingSkeleton
                reportID={reportID}
                skeletonName={shouldShowLoadingSkeleton ? CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_LOADING : CONST.TELEMETRY.CANCELED_BY_SKELETON.SKELETON_GUARD_DERIVED_TIMING}
                shouldAnimate={shouldShowLoadingSkeleton}
            />
        );
    }

    return (
        <ReportActionsListActionsContext.Provider value={actions}>
            <ReportActionsListStateContext.Provider value={state}>{children}</ReportActionsListStateContext.Provider>
        </ReportActionsListActionsContext.Provider>
    );
}

export default ReportActionsSkeletonGuard;
