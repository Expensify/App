import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {LabelMenuItemForwardProps} from './types';

type LabelOwnProps = {
    text: string;
    titleStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
};

type LabelProps = LabelOwnProps & LabelMenuItemForwardProps;

/** Non-interactive — for clickable rows use `<Item>`. */
function Label({text, titleStyle, wrapperStyle, iconWidth, iconHeight, ...rest}: LabelProps): React.ReactElement | null {
    const isAtActiveLevel = useIsAtActiveLevel(Label.displayName);

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <MenuItem
            {...rest}
            title={text}
            titleStyle={titleStyle}
            wrapperStyle={wrapperStyle}
            iconWidth={iconWidth ?? variables.iconSizeNormal}
            iconHeight={iconHeight ?? variables.iconSizeNormal}
            interactive={false}
            role={CONST.ROLE.NONE}
        />
    );
}

Label.displayName = 'PopoverMenu.Label';

export default Label;
export type {LabelProps};
