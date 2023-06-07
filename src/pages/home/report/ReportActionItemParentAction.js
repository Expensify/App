import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as Report from '../../../libs/actions/Report';
import reportPropTypes from '../../reportPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withParentReportAction, {withParentReportActionPropTypes, withParentReportActionDefaultProps} from '../../../components/withParentReportAction';
import compose from '../../../libs/compose';
import withLocalize from '../../../components/withLocalize';
import ReportActionItem from './ReportActionItem';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';

const propTypes = {
    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: PropTypes.bool,

    /** The report currently being looked at */
    report: reportPropTypes,

    ...windowDimensionsPropTypes,
    ...withParentReportActionPropTypes,
};
const defaultProps = {
    report: {},
    shouldHideThreadDividerLine: false,
    ...withParentReportActionDefaultProps,
};

const ReportActionItemParentAction = (props) => {
    // In case of transaction threads, we do not want to render the parent report action.
    if (ReportActionsUtils.isTransactionThread(props.parentReportAction)) {
        return null;
    }
    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)}>
                <View style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]} />
                {props.parentReportAction && (
                    <ReportActionItem
                        report={props.report}
                        action={props.parentReportAction}
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
};

ReportActionItemParentAction.defaultProps = defaultProps;
ReportActionItemParentAction.propTypes = propTypes;
ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default compose(
    withParentReportAction,
    withWindowDimensions,
    withLocalize,
)(ReportActionItemParentAction);
