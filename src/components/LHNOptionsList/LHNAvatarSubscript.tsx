import React, {useMemo} from 'react';
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

type LHNAvatarSubscriptProps = {
    primaryIcon: Icon;
    secondaryIcon: Icon;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    subscriptAvatarBorderColor: ColorValue;
    shouldShowTooltip: boolean;
};

function LHNAvatarSubscript({primaryIcon, secondaryIcon, size, subscriptAvatarBorderColor, shouldShowTooltip}: LHNAvatarSubscriptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const containerStyle = StyleUtils.getContainerStyles(size);
    const isSmall = size === CONST.AVATAR_SIZE.SMALL;

    const subscriptAvatarStyle = useMemo(() => {
        if (size === CONST.AVATAR_SIZE.SMALL) {
            return styles.secondAvatarSubscriptCompact;
        }
        if (size === CONST.AVATAR_SIZE.SMALL_NORMAL) {
            return styles.secondAvatarSubscriptSmallNormal;
        }
        if (size === CONST.AVATAR_SIZE.X_LARGE) {
            return styles.secondAvatarSubscriptXLarge;
        }
        return styles.secondAvatarSubscript;
    }, [size, styles]);

    const subscriptAvatarSize = size === CONST.AVATAR_SIZE.X_LARGE ? CONST.AVATAR_SIZE.HEADER : CONST.AVATAR_SIZE.SUBSCRIPT;

    return (
        <View style={containerStyle}>
            <UserDetailsTooltip
                accountID={Number(primaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
                icon={primaryIcon}
                fallbackUserDetails={{displayName: primaryIcon.name}}
                shouldRender={shouldShowTooltip}
            >
                <View>
                    <Avatar
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                        source={primaryIcon.source ?? WorkspaceBuilding}
                        size={size}
                        name={primaryIcon.name}
                        avatarID={primaryIcon.id}
                        type={primaryIcon.type}
                        fallbackIcon={primaryIcon.fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
            <UserDetailsTooltip
                accountID={Number(secondaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
                icon={secondaryIcon}
                fallbackUserDetails={{displayName: secondaryIcon.name}}
                shouldRender={shouldShowTooltip}
            >
                <View style={[size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}, subscriptAvatarStyle]}>
                    <Avatar
                        iconAdditionalStyles={[
                            StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : subscriptAvatarSize),
                            StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor),
                        ]}
                        source={secondaryIcon.source ?? WorkspaceBuilding}
                        size={isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : subscriptAvatarSize}
                        fill={secondaryIcon.fill}
                        name={secondaryIcon.name}
                        avatarID={secondaryIcon.id}
                        type={secondaryIcon.type}
                        fallbackIcon={secondaryIcon.fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
        </View>
    );
}

LHNAvatarSubscript.displayName = 'LHNAvatarSubscript';

export default React.memo(LHNAvatarSubscript);
