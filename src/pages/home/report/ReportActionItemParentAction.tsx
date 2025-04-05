import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import onyxSubscribe from '@libs/onyxSubscribe';
import {isTripPreview} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {
    canCurrentUserOpenReport,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getAllAncestorReportActionIDs,
    getAllAncestorReportActions,
    navigateToLinkedReportAction,
} from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';
import ReportActionItem from './ReportActionItem';
import ThreadDivider from './ThreadDivider';

type ReportActionItemParentActionProps = {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

    /** The id of the report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;

    /** The current report is displayed */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Array of report actions for this report */
    reportActions: OnyxTypes.ReportAction[];

    /** Report actions belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** Whether we should display "Replies" divider */
    shouldDisplayReplyDivider: boolean;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /** If the thread divider line will be used */
    shouldUseThreadDividerLine?: boolean;
};

function ReportActionItemParentAction({
    report,
    transactionThreadReport,
    reportActions,
    parentReportAction,
    index = 0,
    shouldHideThreadDividerLine = false,
    shouldDisplayReplyDivider,
    isFirstVisibleReportAction = false,
    shouldUseThreadDividerLine = false,
}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const ancestorIDs = useRef(getAllAncestorReportActionIDs(report));
    const ancestorReports = useRef<Record<string, OnyxEntry<OnyxTypes.Report>>>({});
    const [allAncestors, setAllAncestors] = useState<Ancestor[]>([]);
    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();

    useEffect(() => {
        const unsubscribeReports: Array<() => void> = [];
        const unsubscribeReportActions: Array<() => void> = [];
        ancestorIDs.current.reportIDs.forEach((ancestorReportID) => {
            unsubscribeReports.push(
                onyxSubscribe({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${ancestorReportID}`,
                    callback: (val) => {
                        ancestorReports.current[ancestorReportID] = val;
                        //  getAllAncestorReportActions use getReportOrDraftReport to get parent reports which gets the report from allReports that
                        // holds the report collection. However, allReports is not updated by the time this current callback is called.
                        // Therefore we need to pass the up-to-date report to getAllAncestorReportActions so that it uses the up-to-date report value
                        // to calculate, for instance, unread marker.
                        setAllAncestors(getAllAncestorReportActions(report, val));
                    },
                }),
            );
            unsubscribeReportActions.push(
                onyxSubscribe({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReportID}`,
                    callback: () => {
                        setAllAncestors(getAllAncestorReportActions(report));
                    },
                }),
            );
        });

        return () => {
            unsubscribeReports.forEach((unsubscribeReport) => unsubscribeReport());
            unsubscribeReportActions.forEach((unsubscribeReportAction) => unsubscribeReportAction());
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground />
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            {allAncestors.map((ancestor) => {
                const ancestorReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${ancestor.report.reportID}`];
                const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(ancestorReport);
                const shouldDisplayThreadDivider = !isTripPreview(ancestor.reportAction);

                return (
                    <OfflineWithFeedback
                        key={ancestor.reportAction.reportActionID}
                        shouldDisableOpacity={!!ancestor.reportAction?.pendingAction}
                        pendingAction={ancestor.report?.pendingFields?.addWorkspaceRoom ?? ancestor.report?.pendingFields?.createChat}
                        errors={ancestor.report?.errorFields?.addWorkspaceRoom ?? ancestor.report?.errorFields?.createChat}
                        errorRowStyles={[styles.ml10, styles.mr2]}
                        onClose={() => navigateToConciergeChatAndDeleteReport(ancestor.report.reportID)}
                    >
                        {shouldDisplayThreadDivider && (
                            <ThreadDivider
                                ancestor={ancestor}
                                isLinkDisabled={!canCurrentUserOpenReport(ancestorReports.current?.[ancestor?.report?.reportID])}
                            />
                        )}
                        <ReportActionItem
                            onPress={
                                canCurrentUserOpenReport(ancestorReports.current?.[ancestor?.report?.reportID])
                                    ? () => navigateToLinkedReportAction(ancestor, isInNarrowPaneModal, canUserPerformWriteAction, isOffline)
                                    : undefined
                            }
                            parentReportAction={parentReportAction}
                            report={ancestor.report}
                            reportActions={reportActions}
                            transactionThreadReport={transactionThreadReport}
                            action={ancestor.reportAction}
                            displayAsGroup={false}
                            isMostRecentIOUReportAction={false}
                            shouldDisplayNewMarker={ancestor.shouldDisplayNewMarker}
                            index={index}
                            isFirstVisibleReportAction={isFirstVisibleReportAction}
                            shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                            isThreadReportParentAction
                        />
                    </OfflineWithFeedback>
                );
            })}
            {shouldDisplayReplyDivider && <RepliesDivider shouldHideThreadDividerLine={shouldHideThreadDividerLine} />}
        </View>
    );
}

ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default ReportActionItemParentAction;
