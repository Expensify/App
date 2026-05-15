import React from 'react';
import type {GestureResponderEvent} from 'react-native';
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
    /** Call `event.preventDefault()` to gate drilling into the sub. */
    onPress?: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;
};

type SubTriggerProps = SubTriggerOwnProps & MenuItemForwardProps;

/** For non-`MenuItem` shapes, call `useSubTrigger()` directly. */
function SubTrigger({text, disabled = false, rightIcon, testID, iconWidth, iconHeight, onPress: consumerOnPress, ...rest}: SubTriggerProps): React.ReactElement | null {
    useSubContext(SubTrigger.displayName);
    useContentSubActions(SubTrigger.displayName);

    const {ref, focused, onPress: enterSub, onFocus, isAtActiveLevel} = useSubTrigger({disabled, text});
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    if (!isAtActiveLevel) {
        return null;
    }

    const handlePress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        consumerOnPress?.(event);
        if (event?.defaultPrevented) {
            return;
        }
        enterSub();
    };

    return (
        <MenuItem
            {...rest}
            ref={ref}
            title={text}
            iconWidth={iconWidth ?? variables.iconSizeNormal}
            iconHeight={iconHeight ?? variables.iconSizeNormal}
            disabled={disabled}
            interactive
            iconRight={rightIcon ?? icons.ArrowRight}
            shouldShowRightIcon
            onPress={handlePress}
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
