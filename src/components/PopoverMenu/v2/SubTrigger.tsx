import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useContentActions, useContentState} from './ContentContext';
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
    const {
        state: {currentSubID},
    } = useContentState();
    const {enterSub} = useContentActions();
    const subContext = useSubContext();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    // Reachable when the user is at this Sub's parent level.
    const isVisible = currentSubID === getParentSubID(subContext);

    const {ref, focused, onPress, onFocus} = useFocusableRow({
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
            pressableTestID={testID ?? `PopoverMenu.SubTrigger-${text}`}
        />
    );
}

SubTrigger.displayName = 'PopoverMenu.SubTrigger';

export default SubTrigger;
export type {SubTriggerProps};
