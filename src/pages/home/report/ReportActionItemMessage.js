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

    const getReportActionItemFragment = (fragment, index) => {
        return (
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
    };

    const content = !props.isHidden ? _.map(messages, (fragment, index) => getReportActionItemFragment(fragment, index)) : flaggedContentText;

    return (
        <View style={[styles.chatItemMessage, !props.displayAsGroup && isAttachment ? styles.mt2 : {}, ...props.style]}>
            {isApprovedOrSubmittedReportActionType ? (
                // Wrapping 'ReportActionItemFragment' inside '<Text>' so that text isn't broken up into separate lines when
                // there are multiple messages of type 'TEXT', as seen when a report is submitted/approved from a
                // policy on Old Dot and then viewed on New Dot.

                <Text>{content}</Text>
            ) : (
                <>{content}</>
            )}
        </View>
    );
}

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default withLocalize(ReportActionItemMessage);
