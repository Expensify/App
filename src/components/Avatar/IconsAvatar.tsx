import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import type {AvatarIcon} from './types';

import DiagonalAvatars from './layouts/DiagonalAvatars';
import SingleAvatar from './layouts/SingleAvatar';
import SubscriptAvatar from './layouts/SubscriptAvatar';

type IconsAvatarProps = {
    /** Pre-computed avatar icons to render. The first icon is the primary; the second (if present) is the secondary/subscript */
    icons: AvatarIcon[];

    /** Size of the avatars to render */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Layout to render. When omitted, a single avatar is rendered even if a secondary icon is present */
    avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;

    /** Whether to show the user-details tooltip on hover */
    shouldShowTooltip?: boolean;

    /** Whether to use mid subscript size for diagonal avatars */
    shouldUseMidSubscriptSize?: boolean;

    /** Style for secondary avatar container in diagonal layout */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

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
    singleAvatarContainerStyle,
}: IconsAvatarProps) {
    const StyleUtils = useStyleUtils();
    const primaryIcon = icons.at(0);

    if (!primaryIcon) {
        return null;
    }

    const secondaryIcon = icons.at(1);

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && secondaryIcon) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={size}
                shouldShowTooltip={shouldShowTooltip}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && secondaryIcon) {
        return (
            <DiagonalAvatars
                shouldShowTooltip={shouldShowTooltip}
                size={size}
                icons={icons}
                isInReportAction={false}
                shouldUseMidSubscriptSize={shouldUseMidSubscriptSize}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={primaryIcon}
            size={size}
            containerStyles={singleAvatarContainerStyle ?? StyleUtils.getContainerStyles(size)}
            shouldShowTooltip={shouldShowTooltip}
        />
    );
}

export default IconsAvatar;
