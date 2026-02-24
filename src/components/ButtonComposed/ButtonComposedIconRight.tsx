import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import {useButtonComposedContext} from './ButtonComposedContext';

type ButtonComposedIconRightProps = {
    /** The icon asset to display */
    src: IconAsset;

    /** Override the iconFill from context */
    fill?: string;

    /** Override the iconHoverFill from context */
    hoverFill?: string;

    /** Additional styles for the icon container */
    style?: StyleProp<ViewStyle>;
};

function ButtonComposedIconRight({src, fill, hoverFill, style}: ButtonComposedIconRightProps) {
    const {isHovered, success, danger, extraSmall, small, medium, large} = useButtonComposedContext();
    const theme = useTheme();
    const styles = useThemeStyles();

    const defaultFill = success || danger ? theme.textLight : theme.icon;

    return (
        <View style={[styles.justifyContentCenter, large ? styles.ml2 : styles.ml1, style]}>
            <Icon
                src={src}
                fill={(isHovered ? hoverFill : fill) ?? defaultFill}
                extraSmall={extraSmall}
                small={small}
                medium={medium}
                large={large}
                isButtonIcon
            />
        </View>
    );
}

export default ButtonComposedIconRight;
export type {ButtonComposedIconRightProps};
