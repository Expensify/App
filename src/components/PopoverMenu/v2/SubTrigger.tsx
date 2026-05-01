import React, {useId, useLayoutEffect, useRef} from 'react';
import type {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useContentActions, useContentState} from './ContentContext';
import {useSubContext} from './SubContext';

type SubTriggerProps = {
    text: string;
    description?: string;
    /** Matches MenuItem's icon discriminated union. */
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
    const id = useId();
    const ref = useRef<View>(null);
    const {
        state: {currentSubId, focusedId},
    } = useContentState('PopoverMenu.SubTrigger');
    const {enterSub, registerItem, unregisterItem, setFocusedId} = useContentActions('PopoverMenu.SubTrigger');
    const {subId} = useSubContext('PopoverMenu.SubTrigger');
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isVisible = currentSubId === null;

    const handleActivate = () => {
        if (disabled) {
            return;
        }
        enterSub(subId);
    };

    // Latest handler mirrored so the registry's onActivate stays stable across renders.
    const handleActivateRef = useRef(handleActivate);
    useLayoutEffect(() => {
        handleActivateRef.current = handleActivate;
    });

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        registerItem(id, {
            ref,
            isDisabled: disabled,
            onActivate: () => handleActivateRef.current(),
        });
        return () => unregisterItem(id);
    }, [isVisible, id, registerItem, unregisterItem, disabled]);

    if (!isVisible) {
        return null;
    }

    return (
        <FocusableMenuItem
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
            onPress={handleActivate}
            onFocus={() => setFocusedId(id)}
            focused={focusedId === id}
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
