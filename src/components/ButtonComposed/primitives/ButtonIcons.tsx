import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {useButtonContext} from '../context';

type ButtonIconProps = {
    /** The icon asset to display */
    src: IconAsset;

    /** Icon color used on hover. */
    hoverFill?: string;

    /** Additional style for the icon wrapper view. */
    style?: StyleProp<ViewStyle>;

    /** Default icon color when the button is not hovered. */
    fill?: string;
};

function ButtonIconBase({src, style, hoverFill, fill}: ButtonIconProps) {
    const theme = useTheme();
    const {isHovered, variant, size} = useButtonContext();

    const defaultFill = variant === 'success' || variant === 'danger' ? theme.textLight : theme.buttonIcon;
    const propsFill = isHovered ? hoverFill : fill;
    return (
        <View style={style}>
            <Icon
                src={src}
                fill={propsFill ?? defaultFill}
                extraSmall={size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL}
                small={size === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                medium={size === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                large={size === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                isButtonIcon
            />
        </View>
    );
}

function ButtonIconLeft({src, style, hoverFill, fill}: ButtonIconProps) {
    const styles = useThemeStyles();
    const {size, isLoading} = useButtonContext();

    return (
        <ButtonIconBase
            {...{src, hoverFill, fill}}
            style={[size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL || size === CONST.DROPDOWN_BUTTON_SIZE.SMALL ? styles.mr1 : styles.mr2, style, isLoading && styles.opacity0]}
        />
    );
}

function ButtonIconRight({src, style, hoverFill, fill}: ButtonIconProps) {
    const styles = useThemeStyles();
    const {size} = useButtonContext();

    return (
        <ButtonIconBase
            {...{src, hoverFill, fill}}
            style={[styles.flex1, styles.flexShrink0, {flexBasis: 'auto'}, styles.alignItemsEnd, size === CONST.DROPDOWN_BUTTON_SIZE.LARGE ? styles.ml2 : styles.ml1, style]}
        />
    );
}

export {ButtonIconLeft, ButtonIconRight};
export type {ButtonIconProps};
