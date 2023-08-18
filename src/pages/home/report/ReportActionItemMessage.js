import React, {Fragment} from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import useNetwork from '../../../hooks/useNetwork';
import RenderHTML from '../../../components/RenderHTML';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Additional styles to add after local styles. */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Whether or not the message is hidden by moderation */
    isHidden: PropTypes.bool,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    style: [],
    isHidden: false,
};

function ReportActionItemMessage(props) {
    const {isOffline} = useNetwork();
    const hasCommentThread = ReportActionsUtils.hasCommentThread(props.action);
    const messages = _.compact(props.action.previousMessage || props.action.message);
    const isAttachment = ReportUtils.isReportMessageAttachment(_.last(messages));

    return (
        <View style={[styles.chatItemMessage, ...props.style]}>
            {!props.isHidden ? (
                _.map(messages, (fragment, index) => (
                    // Threaded messages display "[Deleted message]" instead of being hidden altogether.
                    // While offline we display the previous message with a strikethrough style. Once online we want to
                    // immediately display "[Deleted message]" while the delete action is pending.
                    <Fragment key={`actionFragment-${props.action.reportActionID}-${index}`}>
                        {(!isOffline && hasCommentThread && props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) || fragment.isDeletedParentAction ? (
                            <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedMessage')}</comment>`} />
                        ) : (
                            <View style={!props.displayAsGroup && isAttachment ? styles.mt2 : {}}>
                                <ReportActionItemFragment
                                    fragment={fragment}
                                    isAttachment={props.action.isAttachment}
                                    attachmentInfo={props.action.attachmentInfo}
                                    pendingAction={props.action.pendingAction}
                                    source={lodashGet(props.action, 'originalMessage.source')}
                                    accountID={props.action.actorAccountID}
                                    loading={props.action.isLoading}
                                    style={props.style}
                                />
                            </View>
                        )}
                    </Fragment>
                ))
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
