import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import onyxSubscribe from '@libs/onyxSubscribe';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const ancestorIDs = useRef(ReportUtils.getAllAncestorReportActionIDs(report));
    const ancestorReports = useRef<Record<string, OnyxEntry<OnyxTypes.Report>>>({});
    const [allAncestors, setAllAncestors] = useState<ReportUtils.Ancestor[]>([]);
    const {isOffline} = useNetwork();

    useEffect(() => {
        const unsubscribeReports: Array<() => void> = [];
        const unsubscribeReportActions: Array<() => void> = [];
        ancestorIDs.current.reportIDs.forEach((ancestorReportID) => {
            unsubscribeReports.push(
                onyxSubscribe({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${ancestorReportID}`,
                    callback: (val) => {
                        ancestorReports.current[ancestorReportID] = val;
                        setAllAncestors(ReportUtils.getAllAncestorReportActions(report));
                    },
                }),
            );
            unsubscribeReportActions.push(
                onyxSubscribe({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReportID}`,
                    callback: () => {
                        setAllAncestors(ReportUtils.getAllAncestorReportActions(report));
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
            {allAncestors.map((ancestor) => (
                <OfflineWithFeedback
                    key={ancestor.reportAction.reportActionID}
                    shouldDisableOpacity={!!ancestor.reportAction?.pendingAction}
                    pendingAction={ancestor.report?.pendingFields?.addWorkspaceRoom ?? ancestor.report?.pendingFields?.createChat}
                    errors={ancestor.report?.errorFields?.addWorkspaceRoom ?? ancestor.report?.errorFields?.createChat}
                    errorRowStyles={[styles.ml10, styles.mr2]}
                    onClose={() => Report.navigateToConciergeChatAndDeleteReport(ancestor.report.reportID)}
                >
                    <ThreadDivider
                        ancestor={ancestor}
                        isLinkDisabled={!ReportUtils.canCurrentUserOpenReport(ancestorReports.current?.[ancestor?.report?.parentReportID ?? '-1'])}
                    />
                    <ReportActionItem
                        onPress={
                            ReportUtils.canCurrentUserOpenReport(ancestorReports.current?.[ancestor?.report?.parentReportID ?? '-1'])
                                ? () => {
                                      const isVisibleAction = ReportActionsUtils.shouldReportActionBeVisible(ancestor.reportAction, ancestor.reportAction.reportActionID ?? '-1');
                                      // Pop the thread report screen before navigating to the chat report.
                                      Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.parentReportID ?? '-1'));
                                      if (isVisibleAction && !isOffline) {
                                          // Pop the chat report screen before navigating to the linked report action.
                                          Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.parentReportID ?? '-1', ancestor.reportAction.reportActionID));
                                      }
                                  }
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
                    />
                </OfflineWithFeedback>
            ))}
            {shouldDisplayReplyDivider && <RepliesDivider shouldHideThreadDividerLine={shouldHideThreadDividerLine} />}
        </View>
    );
}

ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default ReportActionItemParentAction;
