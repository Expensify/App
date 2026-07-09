import {useButtonContext} from '@components/ButtonComposed/context';
import Icon from '@components/Icon';

import useTheme from '@hooks/useTheme';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

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

function ButtonIcon({src, style, hoverFill, fill}: ButtonIconProps) {
    const theme = useTheme();
    const {isHovered, variant, size} = useButtonContext();

    let defaultFill = theme.buttonIcon;
    if (variant === CONST.BUTTON_VARIANT.DANGER) {
        defaultFill = theme.buttonDangerText;
    } else if (variant === CONST.BUTTON_VARIANT.SUCCESS) {
        defaultFill = theme.textLight;
    }
    const propsFill = isHovered ? hoverFill : fill;
    return (
        <View style={style}>
            <Icon
                src={src}
                fill={propsFill ?? defaultFill}
                size={size}
                isButtonIcon
            />
        </View>
    );
}

export default ButtonIcon;
export type {ButtonIconProps};
