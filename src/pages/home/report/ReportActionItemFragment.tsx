import React, {memo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {AvatarProps} from '@components/Avatar';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import type {Message} from '@src/types/onyx/ReportAction';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import AttachmentCommentFragment from './comment/AttachmentCommentFragment';
import TextCommentFragment from './comment/TextCommentFragment';

type ReportActionItemFragmentProps = {
    /** Users accountID */
    accountID: number;

    /** The message fragment needing to be displayed */
    fragment: Message;

    /** If this fragment is attachment than has info? */
    attachmentInfo?: EmptyObject | File;

    /** Message(text) of an IOU report action */
    iouMessage?: string;

    /** The reportAction's source */
    source: OriginalMessageSource;

    /** Should this fragment be contained in a single line? */
    isSingleLine?: boolean;

    /**  Additional styles to add after local styles */
    style?: StyleProp<TextStyle>;

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID?: string;

    /** icon */
    actorIcon?: AvatarProps;

    /** Whether the comment is a thread parent message/the first message in a thread */
    isThreadParentMessage?: boolean;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup?: boolean;

    /** Whether the report action type is 'APPROVED' or 'SUBMITTED'. Used to style system messages from Old Dot */
    isApprovedOrSubmittedReportAction?: boolean;

    /** Used to format RTL display names in Old Dot system messages e.g. Arabic */
    isFragmentContainingDisplayName?: boolean;

    /** The pending action for the report action */
    pendingAction?: OnyxCommon.PendingAction;
};

function ReportActionItemFragment({
    iouMessage = '',
    isSingleLine = false,
    source = '',
    style = [],
    delegateAccountID = '',
    actorIcon = {},
    isThreadParentMessage = false,
    isApprovedOrSubmittedReportAction = false,
    isFragmentContainingDisplayName = false,
    displayAsGroup = false,
    ...props
}: ReportActionItemFragmentProps) {
    const styles = useThemeStyles();
    const {fragment} = props;
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    switch (fragment.type) {
        case 'COMMENT': {
            const isPendingDelete = props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            // Threaded messages display "[Deleted message]" instead of being hidden altogether.
            // While offline we display the previous message with a strikethrough style. Once online we want to
            // immediately display "[Deleted message]" while the delete action is pending.

            if ((!isOffline && isThreadParentMessage && isPendingDelete) || props.fragment.isDeletedParentAction) {
                return <RenderHTML html={`<comment>${translate('parentReportAction.deletedMessage')}</comment>`} />;
            }

            if (ReportUtils.isReportMessageAttachment(fragment)) {
                return (
                    <AttachmentCommentFragment
                        source={source}
                        html={fragment.html ?? ''}
                        addExtraMargin={!displayAsGroup}
                    />
                );
            }

            return (
                <TextCommentFragment
                    source={source}
                    fragment={fragment}
                    styleAsDeleted={Boolean(isOffline && isPendingDelete)}
                    iouMessage={iouMessage}
                    displayAsGroup={displayAsGroup}
                    style={style}
                />
            );
        }
        case 'TEXT': {
            return isApprovedOrSubmittedReportAction ? (
                <Text
                    numberOfLines={isSingleLine ? 1 : undefined}
                    style={[styles.chatItemMessage, styles.colorMuted]}
                >
                    {isFragmentContainingDisplayName ? convertToLTR(props.fragment.text) : props.fragment.text}
                </Text>
            ) : (
                <UserDetailsTooltip
                    accountID={props.accountID}
                    delegateAccountID={delegateAccountID}
                    icon={actorIcon}
                >
                    <Text
                        numberOfLines={isSingleLine ? 1 : undefined}
                        style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap]}
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

ReportActionItemFragment.displayName = 'ReportActionItemFragment';

export default memo(ReportActionItemFragment);
