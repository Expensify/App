import type {ColorValue, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import {WorkspaceBuilding} from '@components/Icon/WorkspaceDefaultAvatars';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import LHNAvatarDiagonal from './LHNAvatarDiagonal';
import LHNAvatarSubscript from './LHNAvatarSubscript';

type LHNAvatarProps = {
    icons: Icon[];
    shouldShowSubscript: boolean;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    secondaryAvatarBackgroundColor?: ColorValue;
    singleAvatarContainerStyle?: ViewStyle[];
    subscriptAvatarBorderColor?: ColorValue;
    useMidSubscriptSize?: boolean;
    shouldShowTooltip?: boolean;
};

/**
 * Lightweight avatar component for LHN rows. Renders pre-computed icons
 * directly using Avatar, avoiding the heavy hooks in ReportActionAvatars.
 */
function LHNAvatar({
    icons,
    shouldShowSubscript,
    size,
    secondaryAvatarBackgroundColor,
    singleAvatarContainerStyle,
    subscriptAvatarBorderColor,
    useMidSubscriptSize,
    shouldShowTooltip = false,
}: LHNAvatarProps) {
    const theme = useTheme();

    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);

    if (!primaryIcon) {
        return null;
    }

    // Single avatar
    if (icons.length === 1 || !secondaryIcon) {
        return (
            <UserDetailsTooltip
                accountID={Number(primaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
                icon={primaryIcon}
                fallbackUserDetails={{displayName: primaryIcon.name}}
                shouldRender={shouldShowTooltip}
            >
                <View>
                    <Avatar
                        containerStyles={singleAvatarContainerStyle}
                        source={primaryIcon.source ?? WorkspaceBuilding}
                        size={size}
                        name={primaryIcon.name}
                        type={primaryIcon.type ?? CONST.ICON_TYPE_AVATAR}
                        avatarID={primaryIcon.id}
                        fallbackIcon={primaryIcon.fallbackIcon}
                        fill={primaryIcon.fill}
                    />
                </View>
            </UserDetailsTooltip>
        );
    }

    // Subscript avatar (workspace + user)
    if (shouldShowSubscript) {
        return (
            <LHNAvatarSubscript
                primaryIcon={primaryIcon}
                secondaryIcon={secondaryIcon}
                size={size}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor ?? theme.componentBG}
                shouldShowTooltip={shouldShowTooltip}
            />
        );
    }

    // Diagonal avatar (two overlapping avatars)
    return (
        <LHNAvatarDiagonal
            primaryIcon={primaryIcon}
            secondaryIcon={secondaryIcon}
            size={size}
            secondaryAvatarBackgroundColor={secondaryAvatarBackgroundColor}
            useMidSubscriptSize={useMidSubscriptSize}
            shouldShowTooltip={shouldShowTooltip}
        />
    );
}

export default LHNAvatar;
