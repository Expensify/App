import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import onyxSubscribe from '@libs/onyxSubscribe';
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
};

function ReportActionItemParentAction({
    report,
    transactionThreadReport,
    reportActions,
    parentReportAction,
    index = 0,
    shouldHideThreadDividerLine = false,
    shouldDisplayReplyDivider,
}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const ancestorIDs = useRef(ReportUtils.getAllAncestorReportActionIDs(report));
    const [allAncestors, setAllAncestors] = useState<ReportUtils.Ancestor[]>([]);

    useEffect(() => {
        const unsubscribeReports: Array<() => void> = [];
        const unsubscribeReportActions: Array<() => void> = [];
        ancestorIDs.current.reportIDs.forEach((ancestorReportID) => {
            unsubscribeReports.push(
                onyxSubscribe({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${ancestorReportID}`,
                    callback: () => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth)]}>
            <AnimatedEmptyStateBackground />
            <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]} />
            {allAncestors.map((ancestor) => (
                <OfflineWithFeedback
                    key={ancestor.reportAction.reportActionID}
                    shouldDisableOpacity={Boolean(ancestor.reportAction?.pendingAction)}
                    pendingAction={ancestor.report?.pendingFields?.addWorkspaceRoom ?? ancestor.report?.pendingFields?.createChat}
                    errors={ancestor.report?.errorFields?.addWorkspaceRoom ?? ancestor.report?.errorFields?.createChat}
                    errorRowStyles={[styles.ml10, styles.mr2]}
                    onClose={() => Report.navigateToConciergeChatAndDeleteReport(ancestor.report.reportID)}
                >
                    <ThreadDivider
                        ancestor={ancestor}
                        isLinkDisabled={!ReportUtils.canCurrentUserOpenReport(ReportUtils.getReport(ancestor?.report?.parentReportID))}
                    />
                    <ReportActionItem
                        onPress={
                            ReportUtils.canCurrentUserOpenReport(ReportUtils.getReport(ancestor?.report?.parentReportID))
                                ? () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.parentReportID ?? ''))
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
                    />
                </OfflineWithFeedback>
            ))}
            {shouldDisplayReplyDivider && <RepliesDivider shouldHideThreadDividerLine={shouldHideThreadDividerLine} />}
        </View>
    );
}

ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default ReportActionItemParentAction;
