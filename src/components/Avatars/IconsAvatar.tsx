import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import DiagonalAvatars from './Primitives/DiagonalAvatars';
import SingleAvatar from './Primitives/SingleAvatar';
import SubscriptAvatar from './Primitives/SubscriptAvatar';

type IconsAvatarProps = {
    /** Pre-computed avatar icons to render. The first icon is the primary; the second (if present) is the secondary/subscript */
    icons: Icon[];

    /** Size of the avatars to render */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** When omitted, inferred from icons count: 1 icon -> Single, 2+ icons -> Diagonal */
    avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;

    /** Whether to show the user-details tooltip on hover */
    shouldShowTooltip?: boolean;

    /** Whether to use mid subscript size for diagonal avatars */
    shouldUseMidSubscriptSize?: boolean;

    /** Style for secondary avatar container in diagonal layout */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Report ID for navigation */
    reportID?: string;

    /** Account ID for single avatar tooltip */
    accountID?: number;

    /** Delegate account ID for single avatar tooltip */
    delegateAccountID?: number;

    /** Single avatar container styles */
    singleAvatarContainerStyle?: ViewStyle[];
};

/**  Presentational component that renders the correct avatar layout primitive based on pre-computed icons[]. */
function IconsAvatar({
    icons,
    avatarType,
    size,
    shouldShowTooltip = true,
    shouldUseMidSubscriptSize = false,
    secondaryAvatarContainerStyle,
    subscriptAvatarBorderColor,
    reportID,
    accountID,
    delegateAccountID,
    singleAvatarContainerStyle,
}: IconsAvatarProps) {
    const primaryIcon = icons.at(0);

    if (!primaryIcon) {
        return null;
    }

    const secondaryIcon = icons.at(1);
    const resolvedType = avatarType ?? (icons.length >= 2 ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);

    if (resolvedType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && secondaryIcon) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={size}
                shouldShowTooltip={shouldShowTooltip}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                reportID={reportID}
            />
        );
    }

    if (resolvedType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && secondaryIcon) {
        return (
            <DiagonalAvatars
                shouldShowTooltip={shouldShowTooltip}
                size={size}
                icons={icons}
                isInReportAction={false}
                shouldUseMidSubscriptSize={shouldUseMidSubscriptSize}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                reportID={reportID}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={primaryIcon}
            size={size}
            containerStyles={singleAvatarContainerStyle}
            shouldShowTooltip={shouldShowTooltip}
            accountID={accountID ?? Number(primaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
            delegateAccountID={delegateAccountID}
            fallbackIcon={primaryIcon.fallbackIcon}
            reportID={reportID}
        />
    );
}

export default IconsAvatar;
