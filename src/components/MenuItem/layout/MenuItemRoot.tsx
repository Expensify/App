import Hoverable from '@components/Hoverable';
import useIsCompact from '@components/MenuItem/hooks/useIsCompact';
import type {MenuItemAccessibilityActions} from '@components/MenuItem/MenuItemAccessibilityContext';
import MenuItemAccessibilityContext, {useMenuItemAccessibility} from '@components/MenuItem/MenuItemAccessibilityContext';
import {MenuItemConfigContext, MenuItemInteractionContext} from '@components/MenuItem/MenuItemContext';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

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

        /**
         * Pre-computed accessibility label. When provided, `Root` uses it directly and skips
         * deriving the label from registered `Title`/`Description` children — so neither
         * `useMenuItemAccessibility` runs nor the `MenuItemAccessibilityContext` provider mounts.
         * Presets that know their text statically should pass it.
         */
        accessibilityLabel?: string;
    };

type MenuItemRootLayoutProps = MenuItemRootProps & {
    /** The resolved label spread on the pressable */
    accessibilityLabel: string;

    /** When set, children are wrapped in `MenuItemAccessibilityContext.Provider` so they can register text */
    providerValue?: MenuItemAccessibilityActions;
};

function MenuItemRootLayout({children, onPress, isDisabled = false, sentryLabel, accessibilityLabel, providerValue}: MenuItemRootLayoutProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);
    const isCompact = useIsCompact();
    const isInteractive = !!onPress;

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
        <MenuItemConfigContext.Provider value={{isDisabled, isInteractive}}>
            <Hoverable>
                {(isHovered) => (
                    <PressableWithFeedback
                        onPress={onPressAction}
                        pressDimmingValue={!isInteractive ? 1 : variables.pressDimValue}
                        dimAnimationDuration={variables.instantAnimationDuration}
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
                        accessibilityLabel={accessibilityLabel}
                        accessible
                        tabIndex={isInteractive ? 0 : -1}
                        sentryLabel={sentryLabel}
                    >
                        {({pressed}) => {
                            const body = (
                                <MenuItemInteractionContext.Provider
                                    value={{
                                        isHovered,
                                        isPressed: pressed,
                                    }}
                                >
                                    <View style={styles.flex1}>{children}</View>
                                </MenuItemInteractionContext.Provider>
                            );

                            return providerValue ? <MenuItemAccessibilityContext.Provider value={providerValue}>{body}</MenuItemAccessibilityContext.Provider> : body;
                        }}
                    </PressableWithFeedback>
                )}
            </Hoverable>
        </MenuItemConfigContext.Provider>
    );
}

/**
 * Derives the label from registered `Title`/`Description` children and exposes the registry via context.
 * Only used when no `accessibilityLabel` prop was passed to `Root`.
 */
function MenuItemRootWithDerivedLabel(props: MenuItemRootProps) {
    const {accessibilityLabel, providerValue} = useMenuItemAccessibility();

    return (
        <MenuItemRootLayout
            {...props}
            accessibilityLabel={accessibilityLabel}
            providerValue={providerValue}
        />
    );
}

function MenuItemRoot({accessibilityLabel, ...props}: MenuItemRootProps) {
    // Label known up-front: render the plain layout — no accessibility hook, no context provider.
    if (accessibilityLabel !== undefined) {
        return (
            <MenuItemRootLayout
                {...props}
                accessibilityLabel={accessibilityLabel}
            />
        );
    }

    return <MenuItemRootWithDerivedLabel {...props} />;
}

export default MenuItemRoot;
