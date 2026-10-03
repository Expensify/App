import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {getReportChatType, reportAvatarFieldsSelector} from '@selectors/Report';
import React from 'react';

import useParticipantIcon from './useParticipantIcon';
import WorkspaceHorizontalAvatars from './WorkspaceHorizontalAvatars';
import WorkspaceSubscriptAvatar from './WorkspaceSubscriptAvatar';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type TaskReportAvatarProps = {
    /** Task report whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    subscriptContainerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the owner and the workspace icon side by side instead of nesting the workspace icon as the subscript */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/**
 * Renders a task report's avatars: the owner with the workspace icon as the subscript, or side by side inside a horizontal stack.
 * A task outside a workspace chat, or an archived one, shows the owner alone.
 */
function TaskReportAvatar({reportID, size, backdropColor, containerStyle, subscriptContainerStyle, horizontalStacking, sort, fallbackDisplayName}: TaskReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
    const [parentChatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {selector: getReportChatType});
    const isArchived = useReportIsArchived(reportID);
    const ownerIcon = useParticipantIcon(report?.ownerAccountID);
    // Only a task assigned in a workspace chat belongs to the workspace. An archived task drops the workspace icon, like the legacy component.
    const shouldShowWorkspace = parentChatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT && !isArchived;

    if (shouldShowWorkspace && horizontalStacking) {
        return (
            <WorkspaceHorizontalAvatars
                report={report}
                primaryAvatar={ownerIcon}
                size={size}
                horizontalStacking={horizontalStacking}
                sort={sort}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (shouldShowWorkspace) {
        return (
            <WorkspaceSubscriptAvatar
                report={report}
                primaryAvatar={ownerIcon}
                size={size}
                backdropColor={backdropColor}
                containerStyle={subscriptContainerStyle}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={ownerIcon}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default TaskReportAvatar;
