import Hoverable from '@components/Hoverable';
import useIsCompactPopover from '@components/MenuItem/hooks/useIsCompactPopover';
import useRemoveNonInteractiveClickHandler from '@components/MenuItem/hooks/useRemoveNonInteractiveClickHandler';
import MenuItemAccessibilityContext, {useMenuItemAccessibility} from '@components/MenuItem/MenuItemAccessibilityContext';
import {MenuItemConfigContext, MenuItemInteractionContext} from '@components/MenuItem/MenuItemContext';
import MenuItemSecondaryInteractionContext, {useMenuItemSecondaryInteractionRegistry} from '@components/MenuItem/MenuItemSecondaryInteractionContext';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';

import useCopyableTextRowPress from '@hooks/useCopyableTextRowPress';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import getPlatform from '@libs/getPlatform';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import type WithTestID from '@src/types/utils/TestID';

import type {ComponentRef, PropsWithChildren} from 'react';
import type {AccessibilityState, GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type MenuItemRootProps = PropsWithChildren &
    WithSentryLabel &
    WithTestID & {
        /** Function to fire when the row is pressed */
        onPress?: (event: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        isDisabled?: boolean;

        /**
         * Pre-computed accessibility label. When provided, `Root` uses it instead of deriving the label
         * from the text leaves. Announcements such as "opens in a new tab" are still appended.
         * Presets that know their text statically should pass it.
         */
        accessibilityLabel?: string;

        /**
         * Styles layered on top of the row's own, e.g. to give it a bordered container. Applied
         * before the hover/press background so the row keeps its interaction feedback.
         */
        style?: StyleProp<ViewStyle>;

        /** Whether explicitly marked child text can start native browser text selection */
        shouldAllowTextSelection?: boolean;

        /** Accessibility state for the row, e.g. `{expanded}`. Lands on the pressable, which is what a screen reader focuses. */
        accessibilityState?: AccessibilityState;
    };

function MenuItemRoot({children, onPress, isDisabled = false, sentryLabel, testID, accessibilityLabel, style, shouldAllowTextSelection = false, accessibilityState}: MenuItemRootProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<ComponentRef<typeof View>>(null);
    const didTouchStartOnCopyableTextRef = useRef(false);
    const [didTouchStartOnCopyableText, setDidTouchStartOnCopyableText] = useState(false);
    const isCompactPopover = useIsCompactPopover();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isInteractive = !!onPress;
    const shouldEnableTextSelection = shouldAllowTextSelection && getPlatform() === CONST.PLATFORM.WEB;
    const {isPressStartOnCopyableText, markMouseDownOnCopyableText, markTouchStartOnCopyableText, shouldSuppressCopyableTextRowLongPress, shouldSuppressCopyableTextRowPress} =
        useCopyableTextRowPress();

    const {accessibilityLabel: rowAccessibilityLabel, accessibilityHint, registries: accessibilityRegistries} = useMenuItemAccessibility(accessibilityLabel);
    const {handler: registeredSecondaryInteraction, register: registerSecondaryInteraction} = useMenuItemSecondaryInteractionRegistry();

    useRemoveNonInteractiveClickHandler(pressableRef, isInteractive);

    const onPressAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (isDisabled || !isInteractive) {
            return;
        }

        if (shouldSuppressCopyableTextRowPress(shouldEnableTextSelection)) {
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

    // Left undefined when no sub-component wants it, so the web keeps its native context menu on a plain row
    const onSecondaryInteractionAction = registeredSecondaryInteraction
        ? (event: GestureResponderEvent | MouseEvent) => {
              if (shouldEnableTextSelection && (shouldSuppressCopyableTextRowLongPress() || isPressStartOnCopyableText(event))) {
                  return;
              }
              registeredSecondaryInteraction(event, pressableRef.current);
          }
        : undefined;

    const handlePressIn = () => {
        // RN Web responder events omit client coordinates, so reuse the original touch hit-test.
        if (shouldEnableTextSelection && didTouchStartOnCopyableTextRef.current) {
            return;
        }

        if (onSecondaryInteractionAction && shouldUseNarrowLayout && canUseTouchScreen()) {
            ControlSelection.block();
        }
    };

    return (
        <MenuItemConfigContext.Provider value={{isDisabled, isInteractive, shouldAllowTextSelection: shouldEnableTextSelection}}>
            <Hoverable>
                {(isHovered) => (
                    <PressableWithSecondaryInteraction
                        onPress={onPressAction}
                        onMouseDown={(event) => {
                            didTouchStartOnCopyableTextRef.current = false;
                            setDidTouchStartOnCopyableText(false);
                            markMouseDownOnCopyableText(event?.target, shouldEnableTextSelection);
                        }}
                        onTouchStart={(event) => {
                            const isCopyableTarget = markTouchStartOnCopyableText(event, shouldEnableTextSelection && isPressStartOnCopyableText(event));
                            didTouchStartOnCopyableTextRef.current = isCopyableTarget;
                            setDidTouchStartOnCopyableText(isCopyableTarget);
                        }}
                        shouldAllowTextSelection={shouldEnableTextSelection}
                        preventDefaultContextMenu={(event) => !shouldEnableTextSelection || !isPressStartOnCopyableText(event)}
                        onPressIn={handlePressIn}
                        onPressOut={ControlSelection.unblock}
                        // RN Web prevents the native context menu whenever an onLongPress handler is attached.
                        // Reset on the next pointer start, since press-out can precede the browser's selection menu.
                        onSecondaryInteraction={shouldEnableTextSelection && didTouchStartOnCopyableText ? undefined : onSecondaryInteractionAction}
                        activeOpacity={!isInteractive ? 1 : variables.pressDimValue}
                        opacityAnimationDuration={variables.instantAnimationDuration}
                        style={({pressed}) =>
                            [
                                styles.popoverMenuItem,
                                !isInteractive && styles.cursorDefault,
                                isCompactPopover && styles.compactPopoverMenuItemBase,
                                style,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState({isActive: isHovered, isPressed: pressed, isDisabled, isInteractive}), true),
                                isDisabled && styles.buttonOpacityDisabled,
                                isHovered && isInteractive && !pressed && styles.hoveredComponentBG,
                            ] as StyleProp<ViewStyle>
                        }
                        disabled={isDisabled}
                        ref={pressableRef}
                        role={isInteractive ? CONST.ROLE.BUTTON : undefined}
                        accessibilityLabel={rowAccessibilityLabel}
                        accessibilityHint={accessibilityHint}
                        accessibilityState={accessibilityState}
                        accessible
                        tabIndex={isInteractive ? 0 : -1}
                        sentryLabel={sentryLabel}
                        testID={testID}
                    >
                        {({pressed}) => (
                            <MenuItemAccessibilityContext.Provider value={accessibilityRegistries}>
                                <MenuItemSecondaryInteractionContext.Provider value={registerSecondaryInteraction}>
                                    <MenuItemInteractionContext.Provider
                                        value={{
                                            isHovered,
                                            isPressed: pressed,
                                        }}
                                    >
                                        <View style={styles.flex1}>{children}</View>
                                    </MenuItemInteractionContext.Provider>
                                </MenuItemSecondaryInteractionContext.Provider>
                            </MenuItemAccessibilityContext.Provider>
                        )}
                    </PressableWithSecondaryInteraction>
                )}
            </Hoverable>
        </MenuItemConfigContext.Provider>
    );
}

export default MenuItemRoot;
export type {MenuItemRootProps};
