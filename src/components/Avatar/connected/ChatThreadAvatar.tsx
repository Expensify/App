import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import type {AvatarIcon} from '@components/Avatar/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getDelegateAccountIDFromReportAction,
    getHumanAgentAccountIDFromReportAction,
    getHumanAgentFirstName,
    getReportActionActorAccountID,
    isTransactionThread,
} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector, reportAvatarKindSelector} from '@selectors/Report';
import {getParentReportActionSelector} from '@selectors/ReportAction';
import React from 'react';

import {useSeededAccountIcons} from './useAccountIcons';
import WorkspaceSubscriptAvatar from './WorkspaceSubscriptAvatar';

type ChatThreadAvatarProps = {
    /** Chat thread whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    subscriptContainerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders a chat thread's avatars from its parent report action. */
function ChatThreadAvatar({reportID, size, backdropColor, containerStyle, subscriptContainerStyle, fallbackDisplayName}: ChatThreadAvatarProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();

    const [thread] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
    const parentReportID = getNonEmptyStringOnyxID(thread?.parentReportID);
    const [parentKind] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: reportAvatarKindSelector});
    const [parentAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        selector: (actions) => getParentReportActionSelector(actions, thread?.parentReportActionID),
    });

    // Mirrors `isExpenseRequest` in ReportUtils.
    const isExpenseRequest = parentKind === CONST.REPORT_AVATAR_KIND.EXPENSE && isTransactionThread(parentAction);
    // A trip room is a thread of its trip preview, so it gets the workspace subscript too.
    const hasTripRoomChatType = thread?.chatType === CONST.REPORT.CHAT_TYPE.TRIP_ROOM;

    const delegateAccountID = getDelegateAccountIDFromReportAction(parentAction);
    // Concierge for harvested and automatic actions.
    const actorAccountID = getReportActionActorAccountID(parentAction, undefined, undefined);
    const humanAgentAccountID = getHumanAgentAccountIDFromReportAction(parentAction);
    const primaryAccountID = delegateAccountID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [primaryAvatar, humanAgentIcon] = useSeededAccountIcons(humanAgentAccountID ? [primaryAccountID, humanAgentAccountID] : [primaryAccountID]);

    if (isExpenseRequest || hasTripRoomChatType) {
        return (
            <WorkspaceSubscriptAvatar
                report={thread}
                primaryAvatar={primaryAvatar}
                size={size}
                backdropColor={backdropColor}
                containerStyle={subscriptContainerStyle}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (humanAgentIcon) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryAvatar}
                secondaryAvatar={{...humanAgentIcon, name: getHumanAgentFirstName(parentAction, personalDetails) ?? translate('reportAction.humanSupportAgent')}}
                size={size}
                backdropColor={backdropColor}
                containerStyle={subscriptContainerStyle}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    const singleAvatar: AvatarIcon = delegateAccountID ? {...primaryAvatar, copilot: {accountID: delegateAccountID, actedForAccountID: actorAccountID}} : primaryAvatar;

    return (
        <SingleAvatar
            avatar={singleAvatar}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default ChatThreadAvatar;
