import React from 'react';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useSelectableRow} from './useFocusableRow';
import type {ItemSelectEvent} from './useFocusableRow';

type ItemOwnProps = {
    text: string;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    /** Defaults to `PopoverMenu.Item-${text}`. */
    testID?: string;
    rightIcon?: IconAsset;
};

/** Preserves the discriminated MenuItemProps union — built-in `Omit` collapses it. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type MenuItemForwardProps = DistributiveOmit<
    MenuItemProps,
    | 'title'
    | 'onPress'
    | 'interactive'
    | 'role'
    | 'shouldCheckActionAllowedOnPress'
    | 'pressableTestID'
    | 'focused'
    | 'onFocus'
    | 'iconRight'
    | 'shouldShowRightIcon'
    | 'shouldShowSelectedItemCheck'
    | 'isSelected'
    | 'disabled'
    | 'pendingAction'
    | 'ref'
>;

type ItemProps = ItemOwnProps & MenuItemForwardProps;

function Item({text, onSelect, disabled = false, pendingAction, testID, rightIcon, iconWidth, iconHeight, ...rest}: ItemProps): React.ReactElement | null {
    const {ref, focused, onPress, onFocus, isAtActiveLevel} = useSelectableRow({onSelect, disabled});

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem
                // eslint-disable-next-line react/jsx-props-no-spreading -- forwards MenuItemProps' discriminated union; matches FocusableMenuItem
                {...rest}
                ref={ref}
                title={text}
                iconWidth={iconWidth ?? variables.iconSizeNormal}
                iconHeight={iconHeight ?? variables.iconSizeNormal}
                iconRight={rightIcon}
                shouldShowRightIcon={!!rightIcon}
                disabled={disabled}
                interactive
                onPress={onPress}
                onFocus={onFocus}
                focused={focused}
                shouldCheckActionAllowedOnPress={false}
                role={CONST.ROLE.BUTTON}
                pressableTestID={testID ?? `PopoverMenu.Item-${text}`}
            />
        </OfflineWithFeedback>
    );
}

Item.displayName = 'PopoverMenu.Item';

export default Item;
export type {ItemProps, ItemSelectEvent};
