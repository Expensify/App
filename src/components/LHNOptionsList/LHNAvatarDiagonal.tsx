import type {ColorValue} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import {WorkspaceBuilding} from '@components/Icon/WorkspaceDefaultAvatars';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type AvatarSizeToStyles = typeof CONST.AVATAR_SIZE.SMALL | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.X_LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

type LHNAvatarDiagonalProps = {
    primaryIcon: Icon;
    secondaryIcon: Icon;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    secondaryAvatarBackgroundColor?: ColorValue;
    useMidSubscriptSize?: boolean;
    shouldShowTooltip: boolean;
};

function LHNAvatarDiagonal({primaryIcon, secondaryIcon, size, secondaryAvatarBackgroundColor, useMidSubscriptSize, shouldShowTooltip}: LHNAvatarDiagonalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarContainerStyles = StyleUtils.getContainerStyles(size);
    const secondaryAvatarContainerStyle = secondaryAvatarBackgroundColor ? StyleUtils.getBackgroundAndBorderStyle(secondaryAvatarBackgroundColor) : undefined;

    const avatarSizeToStylesMap = {
        [CONST.AVATAR_SIZE.SMALL]: {
            singleAvatarStyle: styles.singleAvatarSmall,
            secondAvatarStyles: styles.secondAvatarSmall,
        },
        [CONST.AVATAR_SIZE.LARGE]: {
            singleAvatarStyle: styles.singleAvatarMedium,
            secondAvatarStyles: styles.secondAvatarMedium,
        },
        [CONST.AVATAR_SIZE.X_LARGE]: {
            singleAvatarStyle: styles.singleAvatarMediumLarge,
            secondAvatarStyles: styles.secondAvatarMediumLarge,
        },
        [CONST.AVATAR_SIZE.DEFAULT]: {
            singleAvatarStyle: styles.singleAvatar,
            secondAvatarStyles: styles.secondAvatar,
        },
    };

    let avatarSize: ValueOf<typeof CONST.AVATAR_SIZE> = CONST.AVATAR_SIZE.SMALLER;
    if (useMidSubscriptSize) {
        avatarSize = CONST.AVATAR_SIZE.MID_SUBSCRIPT;
    } else if (size === CONST.AVATAR_SIZE.LARGE) {
        avatarSize = CONST.AVATAR_SIZE.MEDIUM;
    } else if (size === CONST.AVATAR_SIZE.X_LARGE) {
        avatarSize = CONST.AVATAR_SIZE.MEDIUM_LARGE;
    }

    const {singleAvatarStyle, secondAvatarStyles} = avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap.default;

    return (
        <View style={avatarContainerStyles}>
            <View style={[singleAvatarStyle, primaryIcon.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, primaryIcon.type)]}>
                <UserDetailsTooltip
                    accountID={Number(primaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={primaryIcon}
                    fallbackUserDetails={{displayName: primaryIcon.name}}
                    shouldRender={shouldShowTooltip}
                >
                    <View>
                        <Avatar
                            source={primaryIcon.source ?? WorkspaceBuilding}
                            size={avatarSize}
                            imageStyles={[singleAvatarStyle]}
                            name={primaryIcon.name}
                            type={primaryIcon.type ?? CONST.ICON_TYPE_AVATAR}
                            avatarID={primaryIcon.id}
                            fallbackIcon={primaryIcon.fallbackIcon}
                        />
                    </View>
                </UserDetailsTooltip>
                <View
                    style={[
                        secondAvatarStyles,
                        secondaryAvatarContainerStyle,
                        secondaryIcon.type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, secondaryIcon.type) : {},
                    ]}
                >
                    <UserDetailsTooltip
                        accountID={Number(secondaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
                        icon={secondaryIcon}
                        fallbackUserDetails={{displayName: secondaryIcon.name}}
                        shouldRender={shouldShowTooltip}
                    >
                        <View>
                            <Avatar
                                source={secondaryIcon.source ?? WorkspaceBuilding}
                                size={avatarSize}
                                imageStyles={[singleAvatarStyle]}
                                name={secondaryIcon.name}
                                avatarID={secondaryIcon.id}
                                type={secondaryIcon.type ?? CONST.ICON_TYPE_AVATAR}
                                fallbackIcon={secondaryIcon.fallbackIcon}
                            />
                        </View>
                    </UserDetailsTooltip>
                </View>
            </View>
        </View>
    );
}

export default LHNAvatarDiagonal;
