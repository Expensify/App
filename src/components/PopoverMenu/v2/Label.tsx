import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import variables from '@styles/variables';
import {useIsAtActiveLevel} from './SubContext';

/** Distributive `Omit` that preserves discriminated union narrowing (built-in `Omit` collapses it). */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type MenuItemForwardProps = DistributiveOmit<
    MenuItemProps,
    'title' | 'onPress' | 'interactive' | 'role' | 'pressableTestID' | 'focused' | 'onFocus' | 'shouldCheckActionAllowedOnPress' | 'ref'
>;

type LabelOwnProps = {
    text: string;
    titleStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
};

type LabelProps = LabelOwnProps & MenuItemForwardProps;

/**
 * Non-interactive header/label row inside a popover menu. Skipped by keyboard navigation —
 * arrow keys move past it. Use for section headings or contextual info; use `<Item>` for
 * anything clickable.
 */
function Label({text, titleStyle, wrapperStyle, iconWidth, iconHeight, ...rest}: LabelProps): React.ReactElement | null {
    const isAtActiveLevel = useIsAtActiveLevel('PopoverMenu.Label');

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwards the discriminated MenuItemProps union; same pattern as FocusableMenuItem
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
