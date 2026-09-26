import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import type {AvatarIcon} from '@components/Avatar/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getDelegateAccountIDFromReportAction,
    getHumanAgentAccountIDFromReportAction,
    getHumanAgentFirstName,
    getOriginalMessage,
    getReportActionActorAccountID,
    isMoneyRequestAction,
    isTransactionThread,
} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector, reportAvatarKindSelector} from '@selectors/Report';
import {getParentReportActionSelector} from '@selectors/ReportAction';
import React from 'react';

import useAccountIcons, {seedFallbackIcons} from './useAccountIcons';
import WorkspaceHorizontalAvatars from './WorkspaceHorizontalAvatars';
import WorkspaceSubscriptAvatar from './WorkspaceSubscriptAvatar';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

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

    /** Whether (and how) to stack the avatars horizontally. Only a thread that pairs its actor with a workspace icon has a second avatar to stack */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders a chat thread's avatars from its parent report action. */
function ChatThreadAvatar({reportID, size, backdropColor, containerStyle, subscriptContainerStyle, horizontalStacking, sort, fallbackDisplayName}: ChatThreadAvatarProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();

    const [thread] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
    const parentReportID = getNonEmptyStringOnyxID(thread?.parentReportID);
    const [parentKind] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: reportAvatarKindSelector});
    const [parentAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        selector: (actions) => getParentReportActionSelector(actions, thread?.parentReportActionID),
    });

    // A transaction thread points `chatReportID` at its parent, a comment thread leaves it unset. Only a linked thread shows the copilot, the revealed agent and the expense subscript.
    const isParentActionLinked = !!parentKind && !!thread?.chatReportID && thread.chatReportID === thread.parentReportID;
    // An expense request is a transaction thread under an expense report.
    const isExpenseRequest = parentKind === CONST.REPORT_AVATAR_KIND.EXPENSE && isTransactionThread(parentAction);
    // Only a created expense takes the subscript. A tracked expense or a paid send-money action keeps a single avatar.
    const isCreatedExpenseRequest =
        isParentActionLinked && isExpenseRequest && isMoneyRequestAction(parentAction) && getOriginalMessage(parentAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE;
    // A trip room is a thread of its trip preview, so it gets the workspace subscript too.
    const hasTripRoomChatType = thread?.chatType === CONST.REPORT.CHAT_TYPE.TRIP_ROOM;
    const isArchivedTripRoom = useReportIsArchived(hasTripRoomChatType ? reportID : undefined);
    // Once a linked parent action loads, only a trip preview gives the subscript, archived or not. Without one, an archived trip room drops it. A horizontal stack never takes it.
    const hasTripRoomSubscript =
        !horizontalStacking && hasTripRoomChatType && (isParentActionLinked && !!parentAction ? parentAction.actionName === CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW : !isArchivedTripRoom);
    // A thread inherits its room's chat type.
    const isWorkspaceThread = CONST.WORKSPACE_ROOM_TYPES.some((chatType) => thread?.chatType === chatType);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    // A thread under the Concierge chat is a conversation with Concierge, so it shows Concierge rather than whoever asked.
    const isConciergeThread = !!conciergeReportID && parentReportID === conciergeReportID;

    const delegateAccountID = isParentActionLinked && !isConciergeThread ? getDelegateAccountIDFromReportAction(parentAction) : undefined;
    // Concierge for harvested and automatic actions.
    const actorAccountID = getReportActionActorAccountID(parentAction, undefined, undefined);
    const humanAgentAccountID = isParentActionLinked ? getHumanAgentAccountIDFromReportAction(parentAction) : undefined;
    // The copilot and a revealed agent only show once their personal details have loaded. Until then the actor or Concierge stands alone, though the copilot badge still shows.
    const loadedDelegateAccountID = delegateAccountID && personalDetails?.[delegateAccountID] ? delegateAccountID : undefined;
    const loadedHumanAgentAccountID = humanAgentAccountID && personalDetails?.[humanAgentAccountID] ? humanAgentAccountID : undefined;
    const primaryAccountID = isConciergeThread ? CONST.ACCOUNT_ID.CONCIERGE : (loadedDelegateAccountID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const iconAccountIDs = loadedHumanAgentAccountID ? [primaryAccountID, loadedHumanAgentAccountID] : [primaryAccountID];
    const accountIcons = useAccountIcons(iconAccountIDs);
    // A linked thread keeps the generic fallback for an account without personal details. Any other thread seeds a default avatar from the account ID.
    const [primaryAvatar, humanAgentIcon] = isParentActionLinked ? accountIcons : seedFallbackIcons(accountIcons, iconAccountIDs, defaultAvatars.FallbackAvatar);

    // A horizontal stack pairs every workspace thread with its workspace icon. Without one, only a created expense request and a trip room show it, as a subscript.
    if (horizontalStacking && (isExpenseRequest || (hasTripRoomChatType && !isArchivedTripRoom) || isWorkspaceThread)) {
        return (
            <WorkspaceHorizontalAvatars
                report={thread}
                primaryAvatar={primaryAvatar}
                size={size}
                horizontalStacking={horizontalStacking}
                sort={sort}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    // The subscript shows the copilot as the primary avatar without the copilot badge, which only the single avatar carries.
    if (isCreatedExpenseRequest || hasTripRoomSubscript) {
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
