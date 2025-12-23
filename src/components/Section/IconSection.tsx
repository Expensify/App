import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';

type IconSectionProps = {
    icon?: IconAsset;
    iconContainerStyles?: StyleProp<ViewStyle>;
    /** The width of the icon. */
    width?: number;

    /** The height of the icon. */
    height?: number;
};

function IconSection({icon, iconContainerStyles, width = variables.menuIconSize, height = variables.menuIconSize}: IconSectionProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd, iconContainerStyles]}>
            {!!icon && (
                <Icon
                    src={icon}
                    height={height}
                    width={width}
                />
            )}
        </View>
    );
}

export default IconSection;
