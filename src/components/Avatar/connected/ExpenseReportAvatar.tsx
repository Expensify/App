import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';

import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {expenseReportAvatarSelector} from '@selectors/Report';
import React from 'react';

import useAccountIcons from './useAccountIcons';
import useReportWorkspaceIcon from './useReportWorkspaceIcon';

type ExpenseReportAvatarProps = {
    /** Expense report whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    containerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders an expense report's avatars: the report owner as the primary avatar with the workspace icon as the subscript. Expense reports never render in any other layout. */
function ExpenseReportAvatar({reportID, size, backdropColor, containerStyle, fallbackDisplayName}: ExpenseReportAvatarProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: expenseReportAvatarSelector});
    const [ownerIcon] = useAccountIcons([report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]);
    const workspaceIcon = useReportWorkspaceIcon(report);

    return (
        <SubscriptAvatar
            primaryAvatar={ownerIcon}
            secondaryAvatar={workspaceIcon}
            size={size}
            backdropColor={backdropColor}
            containerStyle={containerStyle}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default ExpenseReportAvatar;
