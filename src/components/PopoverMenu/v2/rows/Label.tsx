import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import variables from '@styles/variables';
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
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwards MenuItemProps' discriminated union via spread
            {...rest}
            title={text}
            titleStyle={titleStyle}
            wrapperStyle={wrapperStyle}
            iconWidth={iconWidth ?? variables.iconSizeNormal}
            iconHeight={iconHeight ?? variables.iconSizeNormal}
            interactive={false}
        />
    );
}

Label.displayName = 'PopoverMenu.Label';

export default Label;
export type {LabelProps};
