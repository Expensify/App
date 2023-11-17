import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import _ from 'underscore';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';

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
    const styles = useThemeStyles();
    const fragments = _.compact(props.action.previousMessage || props.action.message);
    const isIOUReport = ReportActionsUtils.isMoneyRequestAction(props.action);
    let iouMessage;
    if (isIOUReport) {
        const iouReportID = lodashGet(props.action, 'originalMessage.IOUReportID');
        if (iouReportID) {
            iouMessage = ReportUtils.getReportPreviewMessage(ReportUtils.getReport(iouReportID), props.action);
        }
    }

    const isApprovedOrSubmittedReportAction = _.contains([CONST.REPORT.ACTIONS.TYPE.APPROVED, CONST.REPORT.ACTIONS.TYPE.SUBMITTED], props.action.actionName);

    /**
     * Get the ReportActionItemFragments
     * @param {Boolean} shouldWrapInText determines whether the fragments are wrapped in a Text component
     * @returns {Object} report action item fragments
     */
    const renderReportActionItemFragments = (shouldWrapInText) => {
        const reportActionItemFragments = _.map(fragments, (fragment, index) => (
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
                isApprovedOrSubmittedReportAction={isApprovedOrSubmittedReportAction}
                // Since system messages from Old Dot begin with the person who performed the action,
                // the first fragment will contain the person's display name and their email. We'll use this
                // to decide if the fragment should be from left to right for RTL display names e.g. Arabic for proper
                // formatting.
                isFragmentContainingDisplayName={index === 0}
            />
        ));

        // Approving or submitting reports in oldDot results in system messages made up of multiple fragments of `TEXT` type
        // which we need to wrap in `<Text>` to prevent them rendering on separate lines.

        return shouldWrapInText ? <Text style={styles.ltr}>{reportActionItemFragments}</Text> : reportActionItemFragments;
    };

    return (
        <View style={[styles.chatItemMessage, ...props.style]}>
            {!props.isHidden ? (
                renderReportActionItemFragments(isApprovedOrSubmittedReportAction)
            ) : (
                <Text style={[styles.textLabelSupporting, styles.lh20]}>{props.translate('moderation.flaggedContent')}</Text>
            )}
        </View>
    );
}

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default withLocalize(ReportActionItemMessage);
