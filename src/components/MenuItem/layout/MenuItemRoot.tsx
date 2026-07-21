import {useIsCompactMenu} from '@components/CompactMenuContext';
import Hoverable from '@components/Hoverable';
import MenuItemContext from '@components/MenuItem/MenuItemContext';
import {useMenuItemGroupActions, useMenuItemGroupState} from '@components/MenuItemGroup';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import mergeRefs from '@libs/mergeRefs';

import variables from '@styles/variables';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {ReactNode, Ref} from 'react';
import type {GestureResponderEvent, Role, StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type MenuItemVariant = ValueOf<typeof CONST.MENU_ITEM.VARIANT>;

type MenuItemRootProps = WithSentryLabel & {
    /** Sub-components composing the row. Children stack vertically: place a `MenuItem.Row` for the main
     * line, and full-width blocks (`MenuItem.Label`, `MenuItem.Error`, `MenuItem.Hint`) before/after it. */
    children: ReactNode;

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

    /** Whether the row should be interactive at all */
    interactive?: boolean;

    /** Should we disable this row? */
    disabled?: boolean;

    /** Whether the row is focused or active (selected-row styling) */
    focused?: boolean;

    /** A boolean flag that gives the row (and its icon) a green fill if true */
    success?: boolean;

    /** Whether the screen containing the row is focused (forwarded to Hoverable) */
    isScreenFocused?: boolean;

    /** The action accepts anonymous users or not */
    isAnonymousAction?: boolean;

    /** Should check anonymous user in onPress function */
    shouldCheckActionAllowedOnPress?: boolean;

    /** Style variant. `section` gives the row the full-bleed hover look used inside a `Section`
     * (horizontal padding + negative margins), replacing the classic `wrapperStyle={styles.sectionMenuItemTopDescription}`. */
    variant?: MenuItemVariant;

    /**
     * Any additional styles to apply on the pressable element.
     */
    style?: StyleProp<ViewStyle>;

    /** Wrapper styles */
    wrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /** Accessibility label for the row. Required: unlike the classic MenuItem, the chassis cannot derive it from composed children. */
    accessibilityLabel: string;

    /** Accessibility hint for the row */
    accessibilityHint?: string;

    /** The accessibility role to use for the row */
    role?: Role;

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
    interactive = true,
    disabled = false,
    focused = false,
    success = false,
    isScreenFocused,
    isAnonymousAction = false,
    shouldCheckActionAllowedOnPress = true,
    variant = CONST.MENU_ITEM.VARIANT.DEFAULT,
    style,
    wrapperStyle,
    accessibilityLabel,
    accessibilityHint,
    role = CONST.ROLE.BUTTON,
    tabIndex = 0,
    testID,
    sentryLabel,
}: MenuItemRootProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isExecuting} = useMenuItemGroupState() ?? {};
    const {singleExecution, waitForNavigate} = useMenuItemGroupActions() ?? {};
    const pressableRef = useRef<View>(null);
    const isCompactMenu = useIsCompactMenu();
    const isCompact = isCompactMenu && !isSmallScreenWidth;

    useEffect(() => {
        const element = pressableRef.current;
        if (interactive || !element || typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement) || typeof element.onclick === 'undefined') {
            return;
        }
        // React Native Web's Pressable always attaches an onClick handler to the DOM element.
        // TalkBack on Android web uses the presence of a click event listener to determine whether
        // an element is clickable and announces "double tap to activate" even for non-interactive elements.
        // Removing the onclick property prevents TalkBack from treating the element as clickable.
        element.onclick = null;
    }, [interactive]);

    const onPressAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (disabled || !interactive) {
            return;
        }

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
                        onPress={shouldCheckActionAllowedOnPress ? callFunctionIfActionIsAllowed(onPressAction, isAnonymousAction) : onPressAction}
                        onSecondaryInteraction={onSecondaryInteraction}
                        wrapperStyle={wrapperStyle}
                        activeOpacity={!interactive ? 1 : variables.pressDimValue}
                        opacityAnimationDuration={0}
                        testID={testID}
                        style={({pressed}) =>
                            [
                                styles.popoverMenuItem,
                                !interactive && styles.cursorDefault,
                                isCompact && styles.compactPopoverMenuItemBase,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || isHovered, pressed, success, disabled, interactive), true),
                                variant === CONST.MENU_ITEM.VARIANT.SECTION && styles.sectionMenuItemTopDescription,
                                style,
                                disabled && styles.buttonOpacityDisabled,
                                isHovered && interactive && !focused && !pressed && styles.hoveredComponentBG,
                            ] as StyleProp<ViewStyle>
                        }
                        disabled={disabled || isExecuting}
                        ref={mergeRefs(ref, pressableRef)}
                        role={interactive ? role : undefined}
                        accessibilityLabel={accessibilityLabel}
                        accessibilityHint={accessibilityHint}
                        accessibilityState={role === CONST.ROLE.TAB ? {selected: focused} : undefined}
                        tabIndex={interactive ? tabIndex : -1}
                        onFocus={onFocus}
                        sentryLabel={sentryLabel}
                    >
                        {({pressed}) => (
                            <MenuItemContext.Provider
                                value={{
                                    isHovered,
                                    isPressed: pressed,
                                    isFocused: focused,
                                    isDisabled: disabled,
                                    isInteractive: interactive,
                                    isSuccess: success,
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

MenuItemRoot.displayName = 'MenuItemRoot';

export type {MenuItemRootProps, MenuItemVariant};
export default MenuItemRoot;
