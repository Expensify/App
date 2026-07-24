import {useIsCompactMenu} from '@components/CompactMenuContext';
import Hoverable from '@components/Hoverable';
import MenuItemContext from '@components/MenuItem/MenuItemContext';
import {useMenuItemGroupActions, useMenuItemGroupState} from '@components/MenuItemGroup';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import mergeRefs from '@libs/mergeRefs';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {PropsWithChildren, Ref} from 'react';
import type {GestureResponderEvent, Role, StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type MenuItemVariant = ValueOf<typeof CONST.MENU_ITEM.VARIANT>;

type MenuItemRootProps = PropsWithChildren &
    WithSentryLabel & {
        /** Reference to the pressable element */
        ref?: PressableRef | Ref<View>;

        /** Function to fire when the row is pressed */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** The function that should be called when the row is long-pressed or right-clicked */
        onSecondaryInteraction?: (event: GestureResponderEvent | MouseEvent) => void;

        /** Handles what to do when the row is focused */
        onFocus?: () => void;

        /** Handles what to do when the row loses focus */
        onBlur?: () => void;

        /** Should we disable this row? */
        isDisabled?: boolean;

        /** Whether the row uses the active (selected-row) styling */
        isActive?: boolean;

        /** A boolean flag that gives the row (and its icon) a green fill if true */
        isSuccess?: boolean;

        /** Whether the screen containing the row is focused (forwarded to Hoverable) */
        isScreenFocused?: boolean;

        /** Style variant. `section` gives the row the full-bleed hover look used inside a `Section`
         * (horizontal padding + negative margins), replacing the classic `wrapperStyle={styles.sectionMenuItemTopDescription}`. */
        variant?: MenuItemVariant;

        /** Any additional styles to apply on the pressable element */
        style?: StyleProp<ViewStyle>;

        /** Wrapper styles */
        wrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

        /** Accessibility label for the row */
        accessibilityLabel: string;

        /** Accessibility hint for the row */
        accessibilityHint?: string;

        /** The accessibility role to use for the row */
        role?: Role;

        /** Whether the row is exposed to assistive tech as a single accessibility element. Set `false` to un-group the row
         * so screen readers can reach nested interactive children (e.g. a trailing button) as their own elements. */
        isAccessible?: boolean;

        /** Whether the row should be focusable with keyboard */
        tabIndex?: 0 | -1;

        /** Pressable component Test ID. Used to locate the component in tests. */
        testID?: string;
    };

function MenuItemRoot({
    children,
    ref,
    onPress,
    onSecondaryInteraction,
    onFocus,
    onBlur,
    isDisabled = false,
    isActive = false,
    isSuccess = false,
    isScreenFocused,
    variant = CONST.MENU_ITEM.VARIANT.DEFAULT,
    style,
    wrapperStyle,
    accessibilityLabel,
    accessibilityHint,
    role = CONST.ROLE.BUTTON,
    isAccessible = true,
    tabIndex = 0,
    testID,
    sentryLabel,
}: MenuItemRootProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isExecuting} = useMenuItemGroupState() ?? {};
    const {singleExecution, waitForNavigate} = useMenuItemGroupActions() ?? {};
    const pressableRef = useRef<View>(null);
    const isCompactMenu = useIsCompactMenu();
    const isCompact = isCompactMenu && !shouldUseNarrowLayout;
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

        if (!singleExecution || !waitForNavigate) {
            onPress(event);
            return;
        }
        singleExecution(
            waitForNavigate(() => {
                onPress(event);
            }),
        )();
    };

    return (
        <View onBlur={onBlur}>
            <Hoverable isFocused={isScreenFocused}>
                {(isHovered) => (
                    <PressableWithSecondaryInteraction
                        onPress={onPressAction}
                        onPressIn={() => !!onSecondaryInteraction && shouldUseNarrowLayout && canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={ControlSelection.unblock}
                        onSecondaryInteraction={onSecondaryInteraction}
                        wrapperStyle={wrapperStyle}
                        activeOpacity={!isInteractive ? 1 : variables.pressDimValue}
                        opacityAnimationDuration={variables.noDimAnimationDuration}
                        testID={testID}
                        style={({pressed}) =>
                            [
                                styles.popoverMenuItem,
                                !isInteractive && styles.cursorDefault,
                                isCompact && styles.compactPopoverMenuItemBase,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(isActive || isHovered, pressed, isSuccess, isDisabled, isInteractive), true),
                                variant === CONST.MENU_ITEM.VARIANT.SECTION && styles.sectionMenuItemTopDescription,
                                style,
                                isDisabled && styles.buttonOpacityDisabled,
                                isHovered && isInteractive && !isActive && !pressed && styles.hoveredComponentBG,
                            ] as StyleProp<ViewStyle>
                        }
                        disabled={isDisabled || isExecuting}
                        ref={mergeRefs(ref, pressableRef)}
                        role={isInteractive ? role : undefined}
                        accessibilityLabel={accessibilityLabel}
                        accessibilityHint={accessibilityHint}
                        accessible={isAccessible}
                        accessibilityState={role === CONST.ROLE.TAB ? {selected: isActive} : undefined}
                        tabIndex={isInteractive ? tabIndex : -1}
                        onFocus={onFocus}
                        sentryLabel={sentryLabel}
                    >
                        {({pressed}) => (
                            <MenuItemContext.Provider
                                value={{
                                    isHovered,
                                    isPressed: pressed,
                                    isActive,
                                    isDisabled,
                                    isInteractive,
                                    isSuccess,
                                    isCompact,
                                }}
                            >
                                <View style={styles.flex1}>{children}</View>
                            </MenuItemContext.Provider>
                        )}
                    </PressableWithSecondaryInteraction>
                )}
            </Hoverable>
        </View>
    );
}

export default MenuItemRoot;
