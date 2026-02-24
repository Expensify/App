import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
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
    const {isHovered, variant, size} = useButtonComposedContext();
    const theme = useTheme();
    const styles = useThemeStyles();

    const defaultFill = variant === 'success' || variant === 'danger' ? theme.textLight : theme.icon;

    return (
        <View style={[size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL ? styles.mr1 : styles.mr2, style]}>
            <Icon
                src={src}
                fill={(isHovered ? hoverFill : fill) ?? defaultFill}
                extraSmall={size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL}
                small={size === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                medium={size === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                large={size === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                isButtonIcon
            />
        </View>
    );
}

export default ButtonComposedIconLeft;
export type {ButtonComposedIconLeftProps};
