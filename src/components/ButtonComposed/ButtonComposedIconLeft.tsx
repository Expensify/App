import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import {useButtonComposedContext} from './ButtonComposedContext';

type ButtonComposedIconLeftProps = {
    /** The icon asset to display */
    src: IconAsset;

    /** Override the iconFill from context */
    fill?: string;

    /** Override the iconHoverFill from context */
    hoverFill?: string;

    /** Additional styles for the icon container */
    style?: StyleProp<ViewStyle>;
};

function ButtonComposedIconLeft({src, fill, hoverFill, style}: ButtonComposedIconLeftProps) {
    const {isHovered, success, danger, extraSmall, small, medium, large, iconFill, iconHoverFill} = useButtonComposedContext();
    const theme = useTheme();
    const styles = useThemeStyles();

    const defaultFill = success || danger ? theme.textLight : theme.icon;
    const resolvedFill = isHovered ? (hoverFill ?? iconHoverFill ?? defaultFill) : (fill ?? iconFill ?? defaultFill);

    return (
        <View style={[extraSmall ? styles.mr1 : styles.mr2, style]}>
            <Icon
                src={src}
                fill={resolvedFill}
                extraSmall={extraSmall}
                small={small}
                medium={medium}
                large={large}
                isButtonIcon
            />
        </View>
    );
}

export default ButtonComposedIconLeft;
export type {ButtonComposedIconLeftProps};
