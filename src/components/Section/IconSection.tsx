import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type IconSectionProps = {
    icon?: IconAsset;
    iconContainerStyles?: StyleProp<ViewStyle>;
};

function IconSection({icon, iconContainerStyles}: IconSectionProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd, iconContainerStyles]}>
            {!!icon && (
                <Icon
                    src={icon}
                    height={68}
                    width={68}
                />
            )}
        </View>
    );
}

IconSection.displayName = 'IconSection';

export default IconSection;
