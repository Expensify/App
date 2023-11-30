import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import withLocalize from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import ReportActionItem from './ReportActionItem';
import reportActionPropTypes from './reportActionPropTypes';

const propTypes = {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: PropTypes.bool,

    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** The id of the parent report */
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportID: PropTypes.string.isRequired,

    /** ONYX PROPS */

    /** The report currently being looked at */
    report: reportPropTypes,

    /** The actions from the parent report */
    // TO DO: Replace with HOC https://github.com/Expensify/App/issues/18769.
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    ...windowDimensionsPropTypes,
};
const defaultProps = {
    report: {},
    parentReportActions: {},
    shouldHideThreadDividerLine: false,
};

function ReportActionItemParentAction(props) {
    const styles = useThemeStyles();
    const parentReportAction = props.parentReportActions[`${props.report.parentReportActionID}`];

    // In case of transaction threads, we do not want to render the parent report action.
    if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
        return null;
    }
    return (
        <OfflineWithFeedback
            shouldDisableOpacity={Boolean(lodashGet(parentReportAction, 'pendingAction'))}
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)}>
                <AnimatedEmptyStateBackground />
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]} />
                {parentReportAction && (
                    <ReportActionItem
                        report={props.report}
                        action={parentReportAction}
                        displayAsGroup={false}
                        isMostRecentIOUReportAction={false}
                        shouldDisplayNewMarker={props.shouldDisplayNewMarker}
                        index={0}
                    />
                )}
            </View>
            {!props.shouldHideThreadDividerLine && <View style={[styles.threadDividerLine]} />}
        </OfflineWithFeedback>
    );
}

ReportActionItemParentAction.defaultProps = defaultProps;
ReportActionItemParentAction.propTypes = propTypes;
ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        parentReportActions: {
            key: ({parentReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            canEvict: false,
        },
    }),
)(ReportActionItemParentAction);
