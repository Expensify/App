import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector} from '@selectors/Report';
import React from 'react';

import useReportWorkspaceIcon from './useReportWorkspaceIcon';
import useSortedIcons from './useSortedIcons';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type PolicyExpenseChatAvatarProps = {
    /** Policy expense chat whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    subscriptContainerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the workspace icon and the member side by side instead of nesting the member as the subscript */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders a policy expense chat's avatars: the workspace icon with the member as the subscript, or side by side inside a horizontal stack. */
function PolicyExpenseChatAvatar({reportID, size, backdropColor, containerStyle, subscriptContainerStyle, horizontalStacking, sort, fallbackDisplayName}: PolicyExpenseChatAvatarProps) {
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber, translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
    const workspaceIcon = useReportWorkspaceIcon(report);

    // The unknown account, standing in for a missing workspace or member the same way the legacy component does.
    const placeholderIcon: Icon = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    // A chat without a policyID has no workspace to show, so the legacy component falls back to the unknown account instead.
    const primaryIcon = report?.policyID ? workspaceIcon : placeholderIcon;
    const ownerAccountID = report?.ownerAccountID;
    const ownerDetails = ownerAccountID ? personalDetails?.[ownerAccountID] : undefined;
    // Built like the legacy member icon: a default avatar seeded from the account ID, named by display name, then login, then "Hidden" while personal details are missing.
    const ownerIcon: Icon = ownerAccountID
        ? {
              id: ownerAccountID,
              type: CONST.ICON_TYPE_AVATAR,
              source: ownerDetails?.avatar ?? getDefaultAvatarURL({accountID: ownerAccountID}),
              name: temporaryGetDisplayNameOrDefault({passedPersonalDetails: ownerDetails, translate, formatPhoneNumber}),
              fallbackIcon: ownerDetails?.fallbackIcon,
          }
        : placeholderIcon;
    // The workspace leads the row, unlike a thread or an expense report where the account does.
    const icons = useSortedIcons([primaryIcon, ownerIcon], sort);

    // A stack always shows both avatars, even without a member.
    if (horizontalStacking) {
        return (
            <HorizontalAvatars
                {...(horizontalStacking === true ? {} : horizontalStacking)}
                size={size}
                icons={icons}
                isInReportAction={false}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    // A member without personal details keeps the subscript. Only a chat without a member drops it.
    if (ownerAccountID) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={ownerIcon}
                size={size}
                backdropColor={backdropColor}
                containerStyle={subscriptContainerStyle}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={primaryIcon}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default PolicyExpenseChatAvatar;
