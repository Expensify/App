import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useButtonContext} from '@components/ButtonComposed/context';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

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

    const defaultFill = variant === 'success' || variant === 'danger' ? theme.textLight : theme.buttonIcon;
    const propsFill = isHovered ? hoverFill : fill;
    return (
        <View style={style}>
            <Icon
                src={src}
                fill={propsFill ?? defaultFill}
                small={size === CONST.BUTTON_SIZE.SMALL}
                medium={size === CONST.BUTTON_SIZE.MEDIUM}
                large={size === CONST.BUTTON_SIZE.LARGE}
                isButtonIcon
            />
        </View>
    );
}

export default ButtonIcon;
export type {ButtonIconProps};
