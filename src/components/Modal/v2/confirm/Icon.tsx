import React from 'react';
import {View} from 'react-native';
import BaseIcon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';

type IconProps = {
    src: IconAsset;
    fill?: string;
};

function Icon({src, fill}: IconProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    return (
        <View style={[styles.justifyContentCenter, styles.flexRow, styles.mb3]}>
            <BaseIcon
                src={src}
                fill={fill ?? theme.icon}
                width={variables.appModalAppIconSize}
                height={variables.appModalAppIconSize}
            />
        </View>
    );
}

export default Icon;
export type {IconProps};
