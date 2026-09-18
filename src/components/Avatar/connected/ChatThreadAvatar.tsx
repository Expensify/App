import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
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
    // Mirrors `isWorkspaceThread` in ReportUtils: a thread inherits its room's chat type.
    const isWorkspaceThread = CONST.WORKSPACE_ROOM_TYPES.some((chatType) => thread?.chatType === chatType);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    // A thread under the Concierge chat is a conversation with Concierge, so it shows Concierge rather than whoever asked. Mirrors `getIconsForChatThread`.
    const isConciergeThread = !!conciergeReportID && parentReportID === conciergeReportID;

    const delegateAccountID = isConciergeThread ? undefined : getDelegateAccountIDFromReportAction(parentAction);
    // Concierge for harvested and automatic actions.
    const actorAccountID = getReportActionActorAccountID(parentAction, undefined, undefined);
    const humanAgentAccountID = getHumanAgentAccountIDFromReportAction(parentAction);
    // Like the legacy component, a revealed agent only shows once their personal details have arrived. Until then Concierge stands alone.
    const loadedHumanAgentAccountID = humanAgentAccountID && personalDetails?.[humanAgentAccountID] ? humanAgentAccountID : undefined;
    const primaryAccountID = isConciergeThread ? CONST.ACCOUNT_ID.CONCIERGE : (delegateAccountID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID);
    const [primaryAvatar, humanAgentIcon] = useSeededAccountIcons(loadedHumanAgentAccountID ? [primaryAccountID, loadedHumanAgentAccountID] : [primaryAccountID]);

    // A horizontal stack pairs every workspace thread with its workspace icon. Without one, only an expense request and a trip room show it, as a subscript.
    if (horizontalStacking && (isExpenseRequest || hasTripRoomChatType || isWorkspaceThread)) {
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
