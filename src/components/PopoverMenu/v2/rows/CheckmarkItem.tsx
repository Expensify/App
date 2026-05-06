import React from 'react';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
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
    testID?: string;
    /** When set, replaces the check icon. */
    rightIcon?: IconAsset;
};

type CheckmarkItemProps = CheckmarkItemOwnProps & MenuItemForwardProps;

/** Selectable row that renders a check when `isSelected` — Radix's `DropdownMenu.CheckboxItem` analogue. */
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
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const {ref, focused, onPress, onFocus, isAtActiveLevel} = useSelectableRow({componentName: CheckmarkItem.displayName, onSelect, disabled});

    if (!isAtActiveLevel) {
        return null;
    }

    // `rightIcon` replaces the check; otherwise selected rows render the Checkmark.
    const effectiveRightIcon = rightIcon ?? (isSelected ? icons.Checkmark : undefined);

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem
                // eslint-disable-next-line react/jsx-props-no-spreading -- forwards MenuItemProps' discriminated union via spread
                {...rest}
                ref={ref}
                title={text}
                iconWidth={iconWidth ?? variables.iconSizeNormal}
                iconHeight={iconHeight ?? variables.iconSizeNormal}
                iconRight={effectiveRightIcon}
                shouldShowRightIcon={!!effectiveRightIcon}
                disabled={disabled}
                interactive
                isSelected={isSelected}
                wrapperStyle={StyleUtils.getItemBackgroundColorStyle(isSelected, focused, disabled, theme.activeComponentBG, theme.hoverComponentBG)}
                shouldRemoveHoverBackground={isSelected}
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
