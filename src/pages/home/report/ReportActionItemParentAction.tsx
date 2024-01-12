import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {WithLocalizeProps} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import type {WindowDimensionsProps} from '@components/withWindowDimensions/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItem from './ReportActionItem';
import reportActionPropTypes from './reportActionPropTypes';

type ReportActionItemParentActionProps = WithLocalizeProps &
    WindowDimensionsProps &
    ReportActionItemParentActionOnyxProps & {
        /** Flag to show, hide the thread divider line */
        shouldHideThreadDividerLine: boolean;

        /** Flag to display the new marker on top of the comment */
        shouldDisplayNewMarker: boolean;

        /** The id of the report */
        reportID: string;

        /** The id of the parent report */
        // eslint-disable-next-line react/no-unused-prop-types
        parentReportID: string;
    };
type ReportActionItemParentActionOnyxProps = {
    /** ONYX PROPS */

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The actions from the parent report */
    // TO DO: Replace with HOC https://github.com/Expensify/App/issues/18769.
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;
};

function ReportActionItemParentAction({report, parentReportActions, isSmallScreenWidth, shouldHideThreadDividerLine, shouldDisplayNewMarker}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    if (!parentReportActions) {
        return;
    }
    if (!report) {
        return;
    }
    const parentReportAction = parentReportActions[`${report?.parentReportActionID}`];

    // In case of transaction threads, we do not want to render the parent report action.
    if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
        return null;
    }
    return (
        <OfflineWithFeedback
            shouldDisableOpacity={Boolean(lodashGet(parentReportAction, 'pendingAction'))}
            pendingAction={lodashGet(report, 'pendingFields.addWorkspaceRoom') || lodashGet(report, 'pendingFields.createChat')}
            errors={lodashGet(report, 'errorFields.addWorkspaceRoom') || lodashGet(report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(report.reportID)}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(isSmallScreenWidth)}>
                <AnimatedEmptyStateBackground />
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]} />
                {parentReportAction && (
                    <ReportActionItem
                        report={report}
                        action={parentReportAction}
                        displayAsGroup={false}
                        isMostRecentIOUReportAction={false}
                        shouldDisplayNewMarker={shouldDisplayNewMarker}
                        index={0}
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
