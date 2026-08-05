import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {BaseAvatarProps} from './types';

import Avatar from '..';
import getSubscriptAvatarSizing from './getSubscriptAvatarSizing';
import SubscriptAvatarFrame from './SubscriptAvatarFrame';

type SubscriptAvatarProps = BaseAvatarProps & {
    /** The primary (main) avatar icon */
    primaryAvatar: IconType;

    /** The secondary (subscript) avatar icon */
    secondaryAvatar?: IconType;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Style for  avatar container */
    containerStyle?: StyleProp<ViewStyle>;
};

/** `SubscriptAvatar` renders a primary avatar with a smaller secondary avatar overlaid as a subscript in the bottom-right corner. */
function SubscriptAvatar({primaryAvatar, secondaryAvatar, size, shouldShowTooltip, subscriptAvatarBorderColor, fallbackDisplayName, containerStyle}: SubscriptAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {subscriptSize, borderWidthSize, containerStyleKey} = getSubscriptAvatarSizing(size);

    return (
        <SubscriptAvatarFrame
            size={size}
            containerStyle={containerStyle}
            primary={
                <UserDetailsTooltip
                    shouldRender={shouldShowTooltip}
                    accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={primaryAvatar}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: fallbackDisplayName || primaryAvatar.name,
                    }}
                >
                    <View>
                        <Avatar
                            containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))}
                            type={primaryAvatar.type}
                            source={primaryAvatar.source}
                            name={primaryAvatar.name ?? ''}
                            avatarID={primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                            fallbackIcon={primaryAvatar.fallbackIcon}
                            fill={primaryAvatar.fill}
                            size={size}
                            testID="ReportActionAvatars-Subscript-MainAvatar"
                        />
                    </View>
                </UserDetailsTooltip>
            }
            secondary={
                secondaryAvatar ? (
                    <UserDetailsTooltip
                        shouldRender={shouldShowTooltip}
                        accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                        icon={secondaryAvatar}
                    >
                        <View style={styles[containerStyleKey]}>
                            <Avatar
                                iconAdditionalStyles={[StyleUtils.getAvatarBorderWidth(borderWidthSize), StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor ?? theme.componentBG)]}
                                type={secondaryAvatar.type}
                                source={secondaryAvatar.source}
                                name={secondaryAvatar.name ?? ''}
                                avatarID={secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                                fallbackIcon={secondaryAvatar.fallbackIcon}
                                fill={secondaryAvatar.fill}
                                size={subscriptSize}
                                testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                            />
                        </View>
                    </UserDetailsTooltip>
                ) : undefined
            }
        />
    );
}

export default SubscriptAvatar;
