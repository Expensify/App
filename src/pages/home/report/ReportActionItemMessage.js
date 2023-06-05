import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    /** The report action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

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

const ReportActionItemMessage = (props) => (
    <View style={[styles.chatItemMessage, ...props.style]}>
        {!props.isHidden ? (
            _.map(_.compact(props.action.previousMessage || props.action.message), (fragment, index) => (
                <ReportActionItemFragment
                    key={`actionFragment-${props.action.reportActionID}-${index}`}
                    fragment={fragment}
                    isAttachment={props.action.isAttachment}
                    hasCommentThread={ReportActionsUtils.hasCommentThread(props.action)}
                    attachmentInfo={props.action.attachmentInfo}
                    pendingAction={props.action.pendingAction}
                    source={lodashGet(props.action, 'originalMessage.source')}
                    loading={props.action.isLoading}
                    style={props.style}
                />
            ))
        ) : (
            <Text style={[styles.textLabelSupporting, styles.lh20]}>{props.translate('moderation.flaggedContent')}</Text>
        )}
    </View>
);

ReportActionItemMessage.propTypes = propTypes;
ReportActionItemMessage.defaultProps = defaultProps;
ReportActionItemMessage.displayName = 'ReportActionItemMessage';

export default withLocalize(ReportActionItemMessage);
