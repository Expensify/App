import React from 'react';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import type {MenuItemForwardProps} from './types';
import useSelectableRow from './useSelectableRow';
import type {ItemSelectEvent} from './useSelectableRow';

type CheckmarkItemOwnProps = {
    text: string;
    isSelected?: boolean;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    /** Defaults to `PopoverMenu.CheckmarkItem-${text}`. */
    testID?: string;
    /** When set, replaces the check icon. */
    rightIcon?: IconAsset;
};

type CheckmarkItemProps = CheckmarkItemOwnProps & MenuItemForwardProps;

/** Selectable menu row that renders a check when `isSelected` — radix's `DropdownMenu.CheckboxItem` analogue. */
function CheckmarkItem({
    text,
    isSelected = false,
    onSelect,
    disabled = false,
    pendingAction,
    testID,
    rightIcon,
    iconWidth,
    iconHeight,
    ...rest
}: CheckmarkItemProps): React.ReactElement | null {
    const {ref, focused, onPress, onFocus, isAtActiveLevel} = useSelectableRow({onSelect, disabled});

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem
                // eslint-disable-next-line react/jsx-props-no-spreading -- forwards MenuItemProps' discriminated union via spread
                {...rest}
                ref={ref}
                title={text}
                iconWidth={iconWidth ?? variables.iconSizeNormal}
                iconHeight={iconHeight ?? variables.iconSizeNormal}
                iconRight={rightIcon}
                shouldShowRightIcon={!!rightIcon}
                disabled={disabled}
                interactive
                isSelected={isSelected}
                // Suppress check when a custom right icon is supplied; MenuItem renders them as independent slots.
                shouldShowSelectedItemCheck={!rightIcon}
                onPress={onPress}
                onFocus={onFocus}
                focused={focused}
                shouldCheckActionAllowedOnPress={false}
                role={CONST.ROLE.BUTTON}
                pressableTestID={testID ?? `PopoverMenu.CheckmarkItem-${text}`}
            />
        </OfflineWithFeedback>
    );
}

CheckmarkItem.displayName = 'PopoverMenu.CheckmarkItem';

export default CheckmarkItem;
export type {CheckmarkItemProps};
