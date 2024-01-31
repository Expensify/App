import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItem from './ReportActionItem';

type ReportActionItemParentActionOnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The actions from the parent report */
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;
};

type ReportActionItemParentActionProps = ReportActionItemParentActionOnyxProps & {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Flag to display the new marker on top of the comment */
    shouldDisplayNewMarker: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

    /** The id of the report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;

    /** The id of the parent report */
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportID: string;
};

function ReportActionItemParentAction({report, parentReportActions = {}, index = 0, shouldHideThreadDividerLine = false, shouldDisplayNewMarker}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const parentReportAction = parentReportActions?.[`${report?.parentReportActionID ?? ''}`] ?? null;

    // In case of transaction threads, we do not want to render the parent report action.
    if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
        return null;
    }
    return (
        <OfflineWithFeedback
            shouldDisableOpacity={Boolean(parentReportAction?.pendingAction ?? false)}
            pendingAction={report?.pendingFields?.addWorkspaceRoom ?? report?.pendingFields?.createChat}
            errors={report?.errorFields?.addWorkspaceRoom ?? report?.errorFields?.createChat}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(report?.reportID ?? '0')}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth)}>
                <AnimatedEmptyStateBackground />
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]} />
                {parentReportAction && (
                    <ReportActionItem
                        // @ts-expect-error TODO: Remove the comment after ReportActionItem is migrated to TypeScript.
                        report={report}
                        action={parentReportAction}
                        displayAsGroup={false}
                        isMostRecentIOUReportAction={false}
                        shouldDisplayNewMarker={shouldDisplayNewMarker}
                        index={index}
                    />
                )}
            </View>
            {!shouldHideThreadDividerLine && <View style={[styles.threadDividerLine]} />}
        </OfflineWithFeedback>
    );
}

ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default withOnyx<ReportActionItemParentActionProps, ReportActionItemParentActionOnyxProps>({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
    parentReportActions: {
        key: ({parentReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        canEvict: false,
    },
})(ReportActionItemParentAction);
