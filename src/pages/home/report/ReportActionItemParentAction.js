import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import withLocalize from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';
import ReportActionItem from './ReportActionItem';

const propTypes = {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: PropTypes.bool,

    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** Position index of the report parent action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** ONYX PROPS */

    /** List of reports */
    /* eslint-disable-next-line react/no-unused-prop-types */
    allReports: PropTypes.objectOf(reportPropTypes),

    /** All report actions for all reports */
    /* eslint-disable-next-line react/no-unused-prop-types */
    allReportActions: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                error: PropTypes.string,
                message: PropTypes.arrayOf(reportActionFragmentPropTypes),
                created: PropTypes.string,
                pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),
            }),
        ),
    ),

    ...windowDimensionsPropTypes,
};
const defaultProps = {
    allReports: {},
    allReportActions: {},
    shouldHideThreadDividerLine: false,
};

function ReportActionItemParentAction(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const report = ReportUtils.getReport(props.reportID);
    const allAncestors = ReportUtils.getAllAncestorReportActions(report);

    return (
        <>
            <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth), styles.justifyContentEnd]}>
                <AnimatedEmptyStateBackground />
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]} />
                {_.map(allAncestors, (ancestor, index) => {
                    const isNearestAncestor = index === allAncestors.length - 1;
                    const shouldHideThreadDividerLine = isNearestAncestor ? props.shouldHideThreadDividerLine : ancestor.shouldHideThreadDividerLine;
                    return (
                        <OfflineWithFeedback
                            shouldDisableOpacity={Boolean(lodashGet(ancestor.reportAction, 'pendingAction'))}
                            pendingAction={lodashGet(ancestor.report, 'pendingFields.addWorkspaceRoom') || lodashGet(ancestor.report, 'pendingFields.createChat')}
                            errors={lodashGet(ancestor.report, 'errorFields.addWorkspaceRoom') || lodashGet(ancestor.report, 'errorFields.createChat')}
                            errorRowStyles={[styles.ml10, styles.mr2]}
                            onClose={() => Report.navigateToConciergeChatAndDeleteReport(ancestor.report.reportID)}
                        >
                            <ReportActionItem
                                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.reportID))}
                                report={ancestor.report}
                                action={ancestor.reportAction}
                                displayAsGroup={false}
                                isMostRecentIOUReportAction={false}
                                shouldDisplayNewMarker={ancestor.shouldDisplayNewMarker}
                                index={props.index}
                            />
                            {!shouldHideThreadDividerLine && <View style={[styles.threadDividerLine]} />}
                        </OfflineWithFeedback>
                    );
                })}
            </View>
        </>
    );
}

ReportActionItemParentAction.defaultProps = defaultProps;
ReportActionItemParentAction.propTypes = propTypes;
ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

/**
 * @param {Object} [reportActions]
 * @returns {Object|undefined}
 */
const reportActionsSelector = (reportActions) =>
    reportActions &&
    _.map(reportActions, (reportAction) => ({
        errors: lodashGet(reportAction, 'errors', []),
        pendingAction: lodashGet(reportAction, 'pendingAction'),
        message: reportAction.message,
        created: reportAction.created,
    }));

/**
 * @param {Object} [report]
 * @returns {Object|undefined}
 */
const reportSelector = (report) =>
    report && {
        reportID: report.reportID,
        isHidden: report.isHidden,
        errorFields: {
            createChat: report.errorFields && report.errorFields.createChat,
            addWorkspaceRoom: report.errorFields && report.errorFields.addWorkspaceRoom,
        },
        pendingFields: {
            createChat: report.pendingFields && report.pendingFields.createChat,
            addWorkspaceRoom: report.pendingFields && report.pendingFields.addWorkspaceRoom,
        },
        statusNum: report.statusNum,
        stateNum: report.stateNum,
        lastReadTime: report.lastReadTime,
        // Other important less obivous properties for filtering:
        parentReportActionID: report.parentReportActionID,
        parentReportID: report.parentReportID,
        isDeletedParentAction: report.isDeletedParentAction,
    };

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        // We should subscribe all reports and report actions here to dynamic update when any parent report action is changed
        allReportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
        },
        allReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: reportSelector,
        },
    }),
)(ReportActionItemParentAction);
