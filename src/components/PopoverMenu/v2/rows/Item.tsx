import React from 'react';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useContentClose} from '@components/PopoverMenu/v2/content/ContentContext';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import type {MenuItemForwardProps} from './types';
import useSelectableRow from './useSelectableRow';
import type {ItemSelectEvent} from './useSelectableRow';

type ItemOwnProps = {
    text: string;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    testID?: string;
    rightIcon?: IconAsset;
};

type ItemProps = ItemOwnProps & MenuItemForwardProps;

function Item({text, onSelect, disabled = false, pendingAction, testID, rightIcon, iconWidth, iconHeight, ...rest}: ItemProps): React.ReactElement | null {
    useContentClose(Item.displayName);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {ref, focused, onPress, onFocus, isAtActiveLevel} = useSelectableRow({onSelect, disabled, text});

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <MenuItem
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
                wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focused, disabled, theme.activeComponentBG, theme.hoverComponentBG)}
                titleStyle={styles.flex1}
                role={CONST.ROLE.MENUITEM}
                pressableTestID={testID ?? `PopoverMenu.Item-${text}`}
            />
        </OfflineWithFeedback>
    );
}

Item.displayName = 'PopoverMenu.Item';

export default Item;
export type {ItemProps, ItemSelectEvent};
