import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {ButtonComposedVariant, useButtonComposedContext} from './ButtonComposedContext';

type ButtonIconBaseProps = {
    src: IconAsset;
    fill?: string;
    style?: StyleProp<ViewStyle>;
    marginStyle: StyleProp<ViewStyle>;
    size: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE> | undefined;
    variant?: ButtonComposedVariant;
};

function ButtonIconBase({src, fill, style, marginStyle, size, variant}: ButtonIconBaseProps) {
    const theme = useTheme();
    const defaultFill = variant === 'success' || variant === 'danger' ? theme.textLight : theme.icon;
    return (
        <View style={[marginStyle, style]}>
            <Icon
                src={src}
                fill={fill ?? defaultFill}
                extraSmall={size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL}
                small={size === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                medium={size === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                large={size === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                isButtonIcon
            />
        </View>
    );
}

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
    const styles = useThemeStyles();

    return (
        <ButtonIconBase
            src={src}
            fill={isHovered ? hoverFill : fill}
            style={style}
            marginStyle={size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL ? styles.mr1 : styles.mr2}
            size={size}
            variant={variant}
        />
    );
}

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
    const {isHovered, variant, size} = useButtonComposedContext();
    const styles = useThemeStyles();

    return (
        <ButtonIconBase
            src={src}
            fill={isHovered ? hoverFill : fill}
            style={style}
            marginStyle={[styles.justifyContentCenter, size === CONST.DROPDOWN_BUTTON_SIZE.LARGE ? styles.ml2 : styles.ml1]}
            size={size}
            variant={variant}
        />
    );
}

export {ButtonComposedIconLeft, ButtonComposedIconRight};
export type {ButtonComposedIconLeftProps, ButtonComposedIconRightProps};
