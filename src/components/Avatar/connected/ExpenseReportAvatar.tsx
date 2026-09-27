import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import type {AvatarIcon} from '@components/Avatar/types';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {expenseReportAvatarSelector} from '@selectors/Report';
import {getReportActionByIDSelector} from '@selectors/ReportAction';
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

/**
 * Renders an expense report's avatars: the report owner as the primary avatar with the workspace icon as the subscript.
 * When a copilot created the report on the owner's behalf, the copilot is the primary avatar instead, matching the LHN row.
 * Expense reports never render in any other layout.
 */
function ExpenseReportAvatar({reportID, size, backdropColor, containerStyle, fallbackDisplayName}: ExpenseReportAvatarProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: expenseReportAvatarSelector});
    const defaultAvatars = useDefaultAvatars();
    const parentReportActionID = report?.parentReportActionID;
    const delegateAccountIDSelector = (reportActions: OnyxEntry<ReportActions>) => getDelegateAccountIDFromReportAction(getReportActionByIDSelector(reportActions, parentReportActionID));
    const parentChatReportID = getNonEmptyStringOnyxID(report?.chatReportID) ?? getNonEmptyStringOnyxID(report?.parentReportID);
    const [delegateAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentChatReportID}`, {selector: delegateAccountIDSelector});
    const ownerAccountID = report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const primaryAccountID = delegateAccountID ?? ownerAccountID;
    const [primaryIcon] = useAccountIcons([primaryAccountID]);
    // Get deterministic user fallback icon instead of generic.
    const resolvedIcon =
        primaryIcon.source === defaultAvatars.FallbackAvatar && primaryAccountID !== CONST.DEFAULT_NUMBER_ID
            ? {...primaryIcon, source: getDefaultAvatarURL({accountID: primaryAccountID})}
            : primaryIcon;
    const primaryAvatar: AvatarIcon = delegateAccountID ? {...resolvedIcon, copilot: {accountID: delegateAccountID, actedForAccountID: ownerAccountID}} : resolvedIcon;
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

export default ExpenseReportAvatar;
