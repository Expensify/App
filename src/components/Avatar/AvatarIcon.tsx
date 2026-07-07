import Icon from '@components/Icon';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SVGAvatarColorStyle} from '@styles/utils/types';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {AvatarBranchCommonProps} from './types';

type AvatarIconProps = AvatarBranchCommonProps & {
    /** Icon asset to render as the avatar. */
    avatarSource: IconAsset;

    /** Test ID used for the fallback avatar. */
    fallbackAvatarTestID: string;

    /** Styles for View wrapping Icon / Image. */
    iconContainerStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Fill and background colors for the icon, or null to use the defaults. */
    iconColors: SVGAvatarColorStyle | null;

    /** The fill color for the icon */
    fill?: string;

    /** Additional styles for Icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;
};

/** Renders an avatar as an SVG icon. */
function AvatarIcon({avatarSource, size, type, iconContainerStyles, iconAdditionalStyles, fallbackAvatarTestID, iconColors, fill}: AvatarIconProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const iconSize = StyleUtils.getAvatarSize(size);
    const containerStyles = iconContainerStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, iconContainerStyles] : undefined;
    const additionalStyles = [StyleUtils.getAvatarBorderStyle(size, type), iconColors, iconAdditionalStyles];

    return (
        <View style={containerStyles}>
            <Icon
                testID={fallbackAvatarTestID}
                src={avatarSource}
                height={iconSize}
                width={iconSize}
                fill={fill}
                additionalStyles={additionalStyles}
            />
        </View>
    );
}

export default AvatarIcon;
