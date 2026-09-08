import Hoverable from '@components/Hoverable';
import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';
import useRemoveNonInteractiveClickHandler from '@components/MenuItem/hooks/useRemoveNonInteractiveClickHandler';
import MenuItemAccessibilityContext, {useMenuItemAccessibility} from '@components/MenuItem/MenuItemAccessibilityContext';
import {MenuItemConfigContext, MenuItemInteractionContext} from '@components/MenuItem/MenuItemContext';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {PropsWithChildren} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type MenuItemRootProps = PropsWithChildren &
    WithSentryLabel &
    WithTestID & {
        /** Function to fire when the row is pressed */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** Whether the menu item is disabled */
        isDisabled?: boolean;

        /**
         * Pre-computed accessibility label. When provided, `Root` uses it directly instead of
         * deriving the label from registered `Title`/`Description` children. Presets that know
         * their text statically should pass it.
         */
        accessibilityLabel?: string;
    };

function MenuItemRoot({children, onPress, isDisabled = false, sentryLabel, testID, accessibilityLabel}: MenuItemRootProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);
    const isCompactPopover = useIsCompactPopover();
    const isInteractive = !!onPress;

    const {accessibilityLabel: derivedAccessibilityLabel, accessibilityActions} = useMenuItemAccessibility();

    useRemoveNonInteractiveClickHandler(pressableRef, isInteractive);

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
                                isCompactPopover && styles.compactPopoverMenuItemBase,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState({isActive: isHovered, isPressed: pressed, isDisabled, isInteractive}), true),
                                isDisabled && styles.buttonOpacityDisabled,
                                isHovered && isInteractive && !pressed && styles.hoveredComponentBG,
                            ] as StyleProp<ViewStyle>
                        }
                        disabled={isDisabled}
                        ref={pressableRef}
                        role={isInteractive ? CONST.ROLE.BUTTON : undefined}
                        accessibilityLabel={accessibilityLabel ?? derivedAccessibilityLabel}
                        accessible
                        tabIndex={isInteractive ? 0 : -1}
                        sentryLabel={sentryLabel}
                        testID={testID}
                    >
                        {({pressed}) => (
                            <MenuItemAccessibilityContext.Provider value={accessibilityLabel === undefined ? accessibilityActions : undefined}>
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
                    </PressableWithFeedback>
                )}
            </Hoverable>
        </MenuItemConfigContext.Provider>
    );
}

export default MenuItemRoot;
export type {MenuItemRootProps};
