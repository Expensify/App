import {useIsCompactMenu} from '@components/CompactMenuContext';
import Hoverable from '@components/Hoverable';
import MenuItemAccessibilityContext, {useMenuItemAccessibility} from '@components/MenuItem/MenuItemAccessibilityContext';
import {MenuItemConfigContext, MenuItemInteractionContext} from '@components/MenuItem/MenuItemContext';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type MenuItemRootProps = PropsWithChildren &
    WithSentryLabel & {
        /** Function to fire when the row is pressed */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;
    };

function MenuItemRoot({children, onPress, isDisabled = false, sentryLabel}: MenuItemRootProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const pressableRef = useRef<View>(null);
    const isCompactMenu = useIsCompactMenu();
    const isCompact = isCompactMenu && !shouldUseNarrowLayout;
    const isInteractive = !!onPress;

    const {accessibilityProps, providerValue} = useMenuItemAccessibility();

    useEffect(() => {
        const element = pressableRef.current;
        if (isInteractive || !element || typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement) || typeof element.onclick === 'undefined') {
            return;
        }
        // React Native Web's Pressable always attaches an onClick handler to the DOM element.
        // TalkBack on Android web uses the presence of a click event listener to determine whether
        // an element is clickable and announces "double tap to activate" even for non-interactive elements.
        // Removing the onclick property prevents TalkBack from treating the element as clickable.
        element.onclick = null;
    }, [isInteractive]);

    const onPressAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (isDisabled || !isInteractive) {
            return;
        }

        // Prevent clicked menu items from retaining an unwanted focus outline on web, especially in Safari
        if (event?.type === 'click' && typeof HTMLElement !== 'undefined' && event.currentTarget instanceof HTMLElement) {
            event.currentTarget.blur();
        }

        if (!onPress || !event) {
            return;
        }
        onPress?.(event);
    };

    return (
        <View>
            <MenuItemConfigContext.Provider value={{isDisabled, isInteractive}}>
                <Hoverable>
                    {(isHovered) => (
                        <PressableWithSecondaryInteraction
                            onPress={onPressAction}
                            activeOpacity={!isInteractive ? 1 : variables.pressDimValue}
                            opacityAnimationDuration={variables.noDimAnimationDuration}
                            style={({pressed}) =>
                                [
                                    styles.popoverMenuItem,
                                    !isInteractive && styles.cursorDefault,
                                    isCompact && styles.compactPopoverMenuItemBase,
                                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(isHovered, pressed, false, isDisabled, isInteractive), true),
                                    isDisabled && styles.buttonOpacityDisabled,
                                    isHovered && isInteractive && !pressed && styles.hoveredComponentBG,
                                ] as StyleProp<ViewStyle>
                            }
                            disabled={isDisabled}
                            ref={pressableRef}
                            role={isInteractive ? CONST.ROLE.BUTTON : undefined}
                            accessibilityLabel={accessibilityProps?.accessibilityLabel}
                            accessible
                            tabIndex={isInteractive ? 0 : -1}
                            sentryLabel={sentryLabel}
                        >
                            {({pressed}) => (
                                <MenuItemAccessibilityContext.Provider value={providerValue}>
                                    <MenuItemInteractionContext.Provider
                                        value={{
                                            isHovered,
                                            isPressed: pressed,
                                        }}
                                    >
                                        <View style={styles.flex1}>{children}</View>
                                    </MenuItemInteractionContext.Provider>
                                </MenuItemAccessibilityContext.Provider>
                            )}
                        </PressableWithSecondaryInteraction>
                    )}
                </Hoverable>
            </MenuItemConfigContext.Provider>
        </View>
    );
}

export default MenuItemRoot;
