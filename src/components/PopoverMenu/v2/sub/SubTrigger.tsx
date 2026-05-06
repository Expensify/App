import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useContentNavigation, useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useSubContext} from './SubContext';

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

/** Row that opens its enclosing `<Sub>` on press; only visible at the parent level. */
function SubTrigger({text, description, icon, iconWidth, iconHeight, iconFill, disabled = false, rightIcon, titleStyle, wrapperStyle, testID}: SubTriggerProps): React.ReactElement | null {
    // Resolve Sub first — closer-neighbor error wins over the also-true "outside <Content>".
    const subContext = useSubContext(SubTrigger.displayName);
    const {currentSubID} = useContentNavigation(SubTrigger.displayName);
    const {enterSub} = useContentSubActions(SubTrigger.displayName);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isVisible = currentSubID === subContext.parentSubID;

    const {ref, focused, onPress, onFocus} = useFocusableRow({
        componentName: SubTrigger.displayName,
        visible: isVisible,
        isDisabled: disabled,
        onActivate: () => {
            if (disabled) {
                return;
            }
            enterSub(subContext.subID);
        },
    });

    if (!isVisible) {
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
