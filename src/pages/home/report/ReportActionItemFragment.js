import PropTypes from 'prop-types';
import React, {memo} from 'react';
import avatarPropTypes from '@components/avatarPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import convertToLTR from '@libs/convertToLTR';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import AttachmentCommentFragment from './comment/AttachmentCommentFragment';
import TextCommentFragment from './comment/TextCommentFragment';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';

const propTypes = {
    /** Users accountID */
    accountID: PropTypes.number.isRequired,

    /** The message fragment needing to be displayed */
    fragment: reportActionFragmentPropTypes.isRequired,

    /** If this fragment is attachment than has info? */
    attachmentInfo: PropTypes.shape({
        /** The file name of attachment */
        name: PropTypes.string,

        /** The file size of the attachment in bytes. */
        size: PropTypes.number,

        /** The MIME type of the attachment. */
        type: PropTypes.string,

        /** Attachment's URL represents the specified File object or Blob object  */
        source: PropTypes.string,
    }),

    /** Message(text) of an IOU report action */
    iouMessage: PropTypes.string,

    /** The reportAction's source */
    source: PropTypes.oneOf(['Chronos', 'email', 'ios', 'android', 'web', 'email', '']),

    /** Should this fragment be contained in a single line? */
    isSingleLine: PropTypes.bool,

    // Additional styles to add after local styles
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID: PropTypes.number,

    /** icon */
    actorIcon: avatarPropTypes,

    /** Whether the comment is a thread parent message/the first message in a thread */
    isThreadParentMessage: PropTypes.bool,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool,

    /** Whether the report action type is 'APPROVED' or 'SUBMITTED'. Used to style system messages from Old Dot */
    isApprovedOrSubmittedReportAction: PropTypes.bool,

    /** Used to format RTL display names in Old Dot system messages e.g. Arabic */
    isFragmentContainingDisplayName: PropTypes.bool,

    ...windowDimensionsPropTypes,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    attachmentInfo: {
        name: '',
        size: 0,
        type: '',
        source: '',
    },
    iouMessage: '',
    isSingleLine: false,
    source: '',
    style: [],
    delegateAccountID: 0,
    actorIcon: {},
    isThreadParentMessage: false,
    isApprovedOrSubmittedReportAction: false,
    isFragmentContainingDisplayName: false,
    displayAsGroup: false,
};

function ReportActionItemFragment(props) {
    const styles = useThemeStyles();
    const fragment = props.fragment;

    switch (fragment.type) {
        case 'COMMENT': {
            const isPendingDelete = props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            // Threaded messages display "[Deleted message]" instead of being hidden altogether.
            // While offline we display the previous message with a strikethrough style. Once online we want to
            // immediately display "[Deleted message]" while the delete action is pending.

            if ((!props.network.isOffline && props.isThreadParentMessage && isPendingDelete) || props.fragment.isDeletedParentAction) {
                return <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedMessage')}</comment>`} />;
            }

            if (ReportUtils.isReportMessageAttachment(fragment)) {
                return (
                    <AttachmentCommentFragment
                        source={props.source}
                        html={fragment.html}
                        addExtraMargin={!props.displayAsGroup}
                    />
                );
            }

            return (
                <TextCommentFragment
                    source={props.source}
                    fragment={fragment}
                    styleAsDeleted={isPendingDelete && props.network.isOffline}
                    iouMessage={props.iouMessage}
                    displayAsGroup={props.displayAsGroup}
                    style={props.style}
                />
            );
        }
        case 'TEXT': {
            return props.isApprovedOrSubmittedReportAction ? (
                <Text
                    numberOfLines={props.isSingleLine ? 1 : undefined}
                    style={[styles.chatItemMessage, styles.colorMuted]}
                >
                    {props.isFragmentContainingDisplayName ? convertToLTR(props.fragment.text) : props.fragment.text}
                </Text>
            ) : (
                <UserDetailsTooltip
                    accountID={props.accountID}
                    delegateAccountID={props.delegateAccountID}
                    icon={props.actorIcon}
                >
                    <Text
                        numberOfLines={props.isSingleLine ? 1 : undefined}
                        style={[styles.chatItemMessageHeaderSender, props.isSingleLine ? styles.pre : styles.preWrap]}
                    >
                        {fragment.text}
                    </Text>
                </UserDetailsTooltip>
            );
        }
        case 'LINK':
            return <Text>LINK</Text>;
        case 'INTEGRATION_COMMENT':
            return <Text>REPORT_LINK</Text>;
        case 'REPORT_LINK':
            return <Text>REPORT_LINK</Text>;
        case 'POLICY_LINK':
            return <Text>POLICY_LINK</Text>;

        // If we have a message fragment type of OLD_MESSAGE this means we have not yet converted this over to the
        // new data structure. So we simply set this message as inner html and render it like we did before.
        // This wil allow us to convert messages over to the new structure without needing to do it all at once.
        case 'OLD_MESSAGE':
            return <Text>OLD_MESSAGE</Text>;
        default:
            return <Text>props.fragment.text</Text>;
    }
}

ReportActionItemFragment.propTypes = propTypes;
ReportActionItemFragment.defaultProps = defaultProps;
ReportActionItemFragment.displayName = 'ReportActionItemFragment';

export default compose(withWindowDimensions, withLocalize, withNetwork())(memo(ReportActionItemFragment));
