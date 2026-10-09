import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector} from '@selectors/Report';
import React from 'react';

import useReportOwnerAvatar from './useReportOwnerAvatar';

type TaskReportAvatarProps = {
    /** Task report whose avatar to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Container styles for the avatar. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;
};

/** Renders a task report's owner alone, or the copilot who created the task on the owner's behalf, even for a task assigned in a workspace chat. */
function TaskReportAvatar({reportID, size, containerStyle, fallbackDisplayName}: TaskReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
    const avatar = useReportOwnerAvatar(report);

    return (
        <SingleAvatar
            avatar={avatar}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default TaskReportAvatar;
