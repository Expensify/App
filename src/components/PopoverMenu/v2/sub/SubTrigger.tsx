import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useSubContext} from './SubContext';
import useSubTrigger from './useSubTrigger';

type SubTriggerProps = {
    text: string;
    description?: string;
    icon?: AvatarSource | IconType[];
    iconWidth?: number;
    iconHeight?: number;
    iconFill?: string | ((isHovered: boolean) => string);
    disabled?: boolean;
    rightIcon?: IconAsset;
    titleStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    testID?: string;
};

/** For non-`MenuItem` shapes, call `useSubTrigger()` directly. */
function SubTrigger({text, description, icon, iconWidth, iconHeight, iconFill, disabled = false, rightIcon, titleStyle, wrapperStyle, testID}: SubTriggerProps): React.ReactElement | null {
    // Re-resolve so the wrapper's hierarchy throw uses its component name. Sub wins over also-true "outside <Content>".
    useSubContext(SubTrigger.displayName);
    useContentSubActions(SubTrigger.displayName);

    const {ref, focused, onPress, onFocus, isAtParentLevel} = useSubTrigger({disabled});
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    if (!isAtParentLevel) {
        return null;
    }

    return (
        <MenuItem
            ref={ref}
            title={text}
            description={description}
            icon={icon}
            iconWidth={iconWidth ?? variables.iconSizeNormal}
            iconHeight={iconHeight ?? variables.iconSizeNormal}
            iconFill={iconFill}
            disabled={disabled}
            interactive
            iconRight={rightIcon ?? icons.ArrowRight}
            shouldShowRightIcon
            onPress={onPress}
            onFocus={onFocus}
            focused={focused}
            shouldCheckActionAllowedOnPress={false}
            titleStyle={titleStyle}
            wrapperStyle={wrapperStyle}
            role={CONST.ROLE.BUTTON}
            pressableTestID={testID ?? `PopoverMenu.SubTrigger-${text}`}
        />
    );
}

SubTrigger.displayName = 'PopoverMenu.SubTrigger';

export default SubTrigger;
export type {SubTriggerProps};
