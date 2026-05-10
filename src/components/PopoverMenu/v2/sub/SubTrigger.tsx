import React from 'react';
import MenuItem from '@components/MenuItem';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import type {MenuItemForwardProps} from '@components/PopoverMenu/v2/rows/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {useSubContext} from './SubContext';
import useSubTrigger from './useSubTrigger';

type SubTriggerOwnProps = {
    text: string;
    disabled?: boolean;
    rightIcon?: IconAsset;
    testID?: string;
};

type SubTriggerProps = SubTriggerOwnProps & MenuItemForwardProps;

/** For non-`MenuItem` shapes, call `useSubTrigger()` directly. */
function SubTrigger({text, disabled = false, rightIcon, testID, iconWidth, iconHeight, ...rest}: SubTriggerProps): React.ReactElement | null {
    // Re-resolve so the wrapper's hierarchy throw uses its component name. Sub wins over also-true "outside <Content>".
    useSubContext(SubTrigger.displayName);
    useContentSubActions(SubTrigger.displayName);

    const {ref, focused, onPress, onFocus, isAtActiveLevel} = useSubTrigger({disabled});
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwards MenuItemProps' discriminated union via spread, matching <Item>/<CheckmarkItem>/<Label>
            {...rest}
            ref={ref}
            title={text}
            iconWidth={iconWidth ?? variables.iconSizeNormal}
            iconHeight={iconHeight ?? variables.iconSizeNormal}
            disabled={disabled}
            interactive
            iconRight={rightIcon ?? icons.ArrowRight}
            shouldShowRightIcon
            onPress={onPress}
            onFocus={onFocus}
            focused={focused}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.MENUITEM}
            pressableTestID={testID ?? `PopoverMenu.Sub.Trigger-${text}`}
        />
    );
}

SubTrigger.displayName = 'PopoverMenu.Sub.Trigger';

export default SubTrigger;
export type {SubTriggerProps};
