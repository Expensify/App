import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {BaseAvatarProps} from './types';

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
function SubscriptAvatar({primaryAvatar, secondaryAvatar, size, subscriptAvatarBorderColor, fallbackDisplayName, containerStyle}: SubscriptAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {subscriptSize, borderWidthSize, containerStyleKey} = getSubscriptAvatarSizing(size);

    return (
        <SubscriptAvatarFrame
            size={size}
            containerStyle={containerStyle}
            primary={
                <AvatarTooltip
                    avatar={primaryAvatar}
                    fallbackDisplayName={fallbackDisplayName}
                >
                    <AvatarFromIcon
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))}
                        icon={primaryAvatar}
                        size={size}
                        testID="ReportActionAvatars-Subscript-MainAvatar"
                    />
                </AvatarTooltip>
            }
            secondary={
                secondaryAvatar ? (
                    <AvatarTooltip
                        avatar={secondaryAvatar}
                        style={styles[containerStyleKey]}
                    >
                        <AvatarFromIcon
                            iconAdditionalStyles={[StyleUtils.getAvatarBorderWidth(borderWidthSize), StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor ?? theme.componentBG)]}
                            icon={secondaryAvatar}
                            size={subscriptSize}
                            testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                        />
                    </AvatarTooltip>
                ) : undefined
            }
        />
    );
}

export default SubscriptAvatar;
