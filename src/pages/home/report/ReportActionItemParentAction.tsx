import {deepEqual} from 'fast-equals';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItem from './ReportActionItem';

type ReportActionItemParentActionOnyxProps = {
    /** The report currently being looked at */
    allReportActions: OnyxCollection<OnyxTypes.ReportActions>;

    /** The actions from the parent report */
    allReports: OnyxCollection<OnyxTypes.Report>;
};

type ReportActionItemParentActionProps = ReportActionItemParentActionOnyxProps & {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

    /** The id of the report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;

    /** The id of the parent report */
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportID: string;
};

function ReportActionItemParentAction({allReportActions = {}, allReports = {}, index = 0, shouldHideThreadDividerLine = false, reportID}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const allAncestors = ReportUtils.getAllAncestorReportActions(report, shouldHideThreadDividerLine, allReports, allReportActions);

    return (
        <>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth), styles.justifyContentEnd]}>
                <AnimatedEmptyStateBackground />
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]} />
                {allAncestors.map((ancestor) => (
                    <OfflineWithFeedback
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
    // We should subscribe all reports and report actions here to dynamic update when any parent report action is changed
    allReportActions: {
        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    },
    allReports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(
    memo(ReportActionItemParentAction, (prevProps, nextProps) => {
        const {allReportActions: prevAllReportActions, allReports: prevAllReports, ...prevPropsWithoutReportActionsAndReports} = prevProps;
        const {allReportActions: nextAllReportActions, allReports: nextAllReports, ...nextPropsWithoutReportActionsAndReports} = nextProps;

        const prevReport = prevAllReports?.[`${ONYXKEYS.COLLECTION.REPORT}${prevProps.reportID}`];
        const nextReport = nextAllReports?.[`${ONYXKEYS.COLLECTION.REPORT}${nextProps.reportID}`];
        const prevAllAncestors = ReportUtils.getAllAncestorReportActions(prevReport, prevProps.shouldHideThreadDividerLine ?? false, prevAllReports, prevAllReportActions);
        const nextAllAncestors = ReportUtils.getAllAncestorReportActions(nextReport, nextProps.shouldHideThreadDividerLine ?? false, nextAllReports, nextAllReportActions);

        if (prevReport !== nextReport || !deepEqual(prevAllAncestors, nextAllAncestors)) {
            return false;
        }

        return lodashIsEqual(prevPropsWithoutReportActionsAndReports, nextPropsWithoutReportActionsAndReports);
    }),
);
