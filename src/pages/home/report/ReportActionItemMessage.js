import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from '../../../CONST';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Additional styles to add after local styles. */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Whether or not the message is hidden by moderation */
    isHidden: PropTypes.bool,

    /** The ID of the report */
    reportID: PropTypes.string.isRequired,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    style: [],
    isHidden: false,
};

function ReportActionItemMessage(props) {
    const messages = _.compact(props.action.previousMessage || props.action.message);
    const isAttachment = ReportUtils.isReportMessageAttachment(_.last(messages));
    const isIOUReport = ReportActionsUtils.isMoneyRequestAction(props.action);
    let iouMessage;
    if (isIOUReport) {
        const iouReportID = lodashGet(props.action, 'originalMessage.IOUReportID');
        if (iouReportID) {
            iouMessage = ReportUtils.getReportPreviewMessage(ReportUtils.getReport(iouReportID), props.action);
        }
    }

    const isApprovedOrSubmittedReportActionType = _.contains([CONST.REPORT.ACTIONS.TYPE.APPROVED, CONST.REPORT.ACTIONS.TYPE.SUBMITTED], props.action.actionName);

    const flaggedContentText = <Text style={[styles.textLabelSupporting, styles.lh20]}>{props.translate('moderation.flaggedContent')}</Text>;

    /**
     * Get a ReportActionItemFragment
     * @param {Object} fragment the current message fragment
     * @param {Number} index the current message fragment's index
     * @returns {Object} report action item fragment
     */
    const renderReportActionItemFragment = (fragment, index) => (
        <ReportActionItemFragment
            key={`actionFragment-${props.action.reportActionID}-${index}`}
            fragment={fragment}
            iouMessage={iouMessage}
            isThreadParentMessage={ReportActionsUtils.isThreadParentMessage(props.action, props.reportID)}
            attachmentInfo={props.action.attachmentInfo}
            pendingAction={props.action.pendingAction}
            source={lodashGet(props.action, 'originalMessage.source')}
            accountID={props.action.actorAccountID}
            style={props.style}
            displayAsGroup={props.displayAsGroup}
            actionName={props.action.actionName}
        />
    );

    return (
        <View style={[styles.chatItemMessage, !props.displayAsGroup && isAttachment ? styles.mt2 : {}, ...props.style]}>
            {isApprovedOrSubmittedReportActionType ? (
                // Approving or submitting reports in oldDot results in system messages made up of multiple fragments of `TEXT` type
                // which we need to wrap in `<Text>` to prevent them rendering on separate lines.

                <Text>{!props.isHidden ? _.map(messages, (fragment, index) => renderReportActionItemFragment(fragment, index)) : flaggedContentText}</Text>
            ) : (
                <>{!props.isHidden ? _.map(messages, (fragment, index) => renderReportActionItemFragment(fragment, index)) : flaggedContentText}</>
            )}
        </View>
    );
}

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default withLocalize(ReportActionItemMessage);
