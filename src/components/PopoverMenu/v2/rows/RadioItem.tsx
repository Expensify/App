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

type RadioItemOwnProps = {
    text: string;
    isSelected?: boolean;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    testID?: string;
    /** Replaces the built-in radio indicator. */
    rightIcon?: IconAsset;
};

type RadioItemProps = RadioItemOwnProps & MenuItemForwardProps;

/** Single-select row with a radio indicator; pass `rightIcon` to replace the indicator. */
function RadioItem({text, isSelected = false, onSelect, disabled = false, pendingAction, testID, rightIcon, iconWidth, iconHeight, ...rest}: RadioItemProps): React.ReactElement | null {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    useContentClose(RadioItem.displayName);
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
                shouldShowRadioButton={!rightIcon}
                disabled={disabled}
                interactive
                isSelected={isSelected}
                // Skip the row tint when the radio indicator is the visual cue.
                wrapperStyle={StyleUtils.getItemBackgroundColorStyle(!!rightIcon && isSelected, focused, disabled, theme.activeComponentBG, theme.hoverComponentBG)}
                titleStyle={styles.flex1}
                shouldRemoveHoverBackground={isSelected}
                onPress={onPress}
                onFocus={onFocus}
                focused={focused}
                shouldCheckActionAllowedOnPress={false}
                role={CONST.ROLE.MENUITEM}
                pressableTestID={testID ?? `PopoverMenu.RadioItem-${text}`}
            />
        </OfflineWithFeedback>
    );
}

RadioItem.displayName = 'PopoverMenu.RadioItem';

export default RadioItem;
export type {RadioItemProps};
