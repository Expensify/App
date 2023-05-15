import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
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

const propTypes = {
    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** The id of the parent report */
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportID: PropTypes.string.isRequired,

    /** ONYX PROPS */

    /** The report currently being looked at */
    report: reportPropTypes,

    ...windowDimensionsPropTypes,
    ...withParentReportActionPropTypes,
};
const defaultProps = {
    report: {},
    parentReportActions: {},
    ...withParentReportActionDefaultProps,
};

const ReportActionItemParentAction = (props) => (
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
                    shouldDisplayNewMarker={false}
                    index={0}
                />
            )}
        </View>
        <View style={[styles.threadDividerLine]} />
    </OfflineWithFeedback>
);

ReportActionItemParentAction.defaultProps = defaultProps;
ReportActionItemParentAction.propTypes = propTypes;
ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';

export default compose(
    withParentReportAction,
    withWindowDimensions,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
    }),
)(ReportActionItemParentAction);
