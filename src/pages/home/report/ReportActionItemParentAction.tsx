import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import onyxSubscribe from '@libs/onyxSubscribe';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItem from './ReportActionItem';

type ReportActionItemParentActionOnyxProps = {
    /** The current report is displayed */
    report: OnyxEntry<OnyxTypes.Report>;
};

type ReportActionItemParentActionProps = ReportActionItemParentActionOnyxProps & {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

    /** The id of the report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;
};

function ReportActionItemParentAction({report, index = 0, shouldHideThreadDividerLine = false}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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
                        setAllAncestors(ReportUtils.getAllAncestorReportActions(report, shouldHideThreadDividerLine));
                    },
                }),
            );
            unsubscribeReportActions.push(
                onyxSubscribe({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReportID}`,
                    callback: () => {
                        setAllAncestors(ReportUtils.getAllAncestorReportActions(report, shouldHideThreadDividerLine));
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
        <>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(shouldUseNarrowLayout)]}>
                <AnimatedEmptyStateBackground />
                <View style={[StyleUtils.getReportWelcomeTopMarginStyle(shouldUseNarrowLayout)]} />
                {allAncestors.map((ancestor) => (
                    <OfflineWithFeedback
                        key={ancestor.reportAction.reportActionID}
                        shouldDisableOpacity={Boolean(ancestor.reportAction?.pendingAction)}
                        pendingAction={ancestor.report?.pendingFields?.addWorkspaceRoom ?? ancestor.report?.pendingFields?.createChat}
                        errors={ancestor.report?.errorFields?.addWorkspaceRoom ?? ancestor.report?.errorFields?.createChat}
                        errorRowStyles={[styles.ml10, styles.mr2]}
                        onClose={() => Report.navigateToConciergeChatAndDeleteReport(ancestor.report.reportID)}
                    >
                        <ReportActionItem
                            // @ts-expect-error TODO: Remove this once ReportActionItem (https://github.com/Expensify/App/issues/31982) is migrated to TypeScript.
                            onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.reportID))}
                            report={ancestor.report}
                            action={ancestor.reportAction}
                            displayAsGroup={false}
                            isMostRecentIOUReportAction={false}
                            shouldDisplayNewMarker={ancestor.shouldDisplayNewMarker}
                            index={index}
                        />
                        {!ancestor.shouldHideThreadDividerLine && <View style={[styles.threadDividerLine]} />}
                    </OfflineWithFeedback>
                ))}
            </View>
        </>
    );
}

ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default withOnyx<ReportActionItemParentActionProps, ReportActionItemParentActionOnyxProps>({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
})(ReportActionItemParentAction);
