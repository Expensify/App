import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';

import type CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ReportAvatarFields} from '@selectors/Report';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import useReportWorkspaceIcon from './useReportWorkspaceIcon';

type WorkspaceSubscriptAvatarProps = {
    /** The report the workspace icon resolves from, through its policy and the chat it links to */
    report: ReportAvatarFields | undefined;

    /** The account the report is about */
    primaryAvatar: Icon;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    containerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders the given account as the primary avatar with the report's workspace icon as the subscript. */
function WorkspaceSubscriptAvatar({report, primaryAvatar, size, backdropColor, containerStyle, fallbackDisplayName}: WorkspaceSubscriptAvatarProps) {
    const workspaceIcon = useReportWorkspaceIcon(report);

    return (
        <SubscriptAvatar
            primaryAvatar={primaryAvatar}
            secondaryAvatar={workspaceIcon}
            size={size}
            backdropColor={backdropColor}
            containerStyle={containerStyle}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default WorkspaceSubscriptAvatar;
