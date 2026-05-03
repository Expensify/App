import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useContentActions, useContentNavigation} from './ContentContext';
import {getParentSubID, useSubContext} from './SubContext';
import useFocusableRow from './useFocusableRow';

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

function SubTrigger({text, description, icon, iconWidth, iconHeight, iconFill, disabled = false, rightIcon, titleStyle, wrapperStyle, testID}: SubTriggerProps): React.ReactElement | null {
    // Resolved first so a "<Sub.Trigger> outside <Sub>" failure beats the also-true "outside <Content>" message
    // — Sub is the closer hierarchical neighbor and the more actionable hint.
    const subContext = useSubContext(SubTrigger.displayName);
    const {currentSubID} = useContentNavigation(SubTrigger.displayName);
    const {enterSub} = useContentActions(SubTrigger.displayName);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    // Reachable when the user is at this Sub's parent level.
    const isVisible = currentSubID === getParentSubID(subContext);

    const {ref, focused, onPress, onFocus} = useFocusableRow({
        componentName: SubTrigger.displayName,
        visible: isVisible,
        isDisabled: disabled,
        onActivate: () => {
            if (disabled) {
                return;
            }
            enterSub(subContext.subID, subContext.ancestorChain);
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
            pressableTestID={testID ?? `PopoverMenu.Sub.Trigger-${text}`}
        />
    );
}

SubTrigger.displayName = 'PopoverMenu.Sub.Trigger';

export default SubTrigger;
export type {SubTriggerProps};
