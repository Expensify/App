import type PressableProps from '@components/Pressable/GenericPressable/types';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useRouteKey from '@hooks/useRouteKey';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import HapticFeedback from '@libs/HapticFeedback';
import type {Shortcut} from '@libs/KeyboardShortcut';
import mergeRefs from '@libs/mergeRefs';
import getRoutePath from '@libs/Navigation/helpers/getRoutePath';
import {isNewTabOrWindowMousePress} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {notifyPressedTrigger, registerPressable} from '@libs/NavigationFocusReturn';

import CONST from '@src/CONST';
import type {ViewKeyDownEvent} from '@src/types/utils/ReactNativeCompat';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {ComponentRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import type {DistributedOmit} from 'type-fest';

import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Pressable} from 'react-native';

/** The platform wrappers require the label: native passes it on to here, while web renders it as `data-sentry-label` and leaves it out. */
type BaseGenericPressableProps = DistributedOmit<PressableProps, 'sentryLabel'> & WithSentryLabel;

/** `useKeyboardShortcut` always needs a shortcut. A pressable without `keyboardShortcut` passes this empty one and keeps the hook inactive. */
const NO_KEYBOARD_SHORTCUT: Pick<Shortcut, 'shortcutKey' | 'descriptionKey' | 'modifiers'> = {shortcutKey: '', descriptionKey: '', modifiers: []};

function GenericPressable({
    children,
    onPress,
    onLongPress,
    onKeyDown,
    disabled,
    style,
    disabledStyle = {},
    hoverStyle = {},
    focusStyle = {},
    pressStyle = {},
    screenReaderActiveStyle = {},
    shouldUseHapticsOnLongPress = true,
    shouldUseHapticsOnPress = false,
    nextFocusRef,
    keyboardShortcut,
    shouldUseAutoHitSlop = false,
    enableInScreenReaderStates = CONST.SCREEN_READER_STATES.ALL,
    onPressIn,
    onPressOut,
    accessible = true,
    fullDisabled = false,
    interactive = true,
    isNested = false,
    shouldAllowTextSelection = false,
    ref,
    dataSet,
    forwardedFSClass,
    accessibilityState,
    linkRoute,
    ...rest
}: BaseGenericPressableProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isExecuting, singleExecution} = useSingleExecution();
    const screenReaderState = Accessibility.useScreenReaderState();
    const isScreenReaderActive = screenReaderState === 'enabled';
    const [hitSlop, onLayout] = Accessibility.useAutoHitSlop();
    const [isHovered, setIsHovered] = useState(false);
    const isRoleButton = [rest.accessibilityRole, rest.role].includes(CONST.ROLE.BUTTON);
    // A row rendered as a link with linkRoute still behaves like a button, so it suppresses selection too. Text links in content stay selectable.
    const isRoleLinkRow = !!linkRoute && [rest.accessibilityRole, rest.role].includes(CONST.ROLE.LINK);
    // A button role normally means "not selectable, exclude from copy". Callers whose content is selectable text opt out.
    const shouldSuppressSelection = (isRoleButton || isRoleLinkRow) && !shouldAllowTextSelection;
    const internalRef = useRef<ComponentRef<typeof View> | null>(null);
    const composedRef = mergeRefs(ref, internalRef);
    const routeKey = useRouteKey();
    // `||` so empty strings skip — never key off an empty prop.
    const focusIdentifier = rest.id || rest.nativeID || rest.testID || undefined;

    useEffect(() => {
        if (screenReaderState === 'disabled' || !routeKey || !focusIdentifier) {
            return;
        }
        return registerPressable(routeKey, focusIdentifier, internalRef);
    }, [screenReaderState, routeKey, focusIdentifier]);

    let shouldBeDisabledByScreenReader = false;
    if (enableInScreenReaderStates === CONST.SCREEN_READER_STATES.ACTIVE) {
        shouldBeDisabledByScreenReader = !isScreenReaderActive;
    }
    if (enableInScreenReaderStates === CONST.SCREEN_READER_STATES.DISABLED) {
        shouldBeDisabledByScreenReader = isScreenReaderActive;
    }
    const isDisabled = disabled || shouldBeDisabledByScreenReader || isExecuting;

    const shouldUseDisabledCursor = isDisabled && !isExecuting;

    const getCursorStyle = () => {
        if (!interactive) {
            return styles.cursorDefault;
        }
        if (shouldUseDisabledCursor) {
            return styles.cursorDisabled;
        }

        if (onPress) {
            return styles.cursorPointer;
        }

        if ([rest.accessibilityRole, rest.role].includes(CONST.ROLE.PRESENTATION) && !isNested) {
            return styles.cursorText;
        }
        return styles.cursorPointer;
    };
    const cursorStyle = getCursorStyle();

    const onLongPressHandler = (event: GestureResponderEvent) => {
        if (isDisabled) {
            return;
        }
        if (!onLongPress) {
            return;
        }
        if (shouldUseHapticsOnLongPress) {
            HapticFeedback.longPress();
        }
        if (ref && 'current' in ref && nextFocusRef) {
            ref.current?.blur();
            Accessibility.moveAccessibilityFocus(nextFocusRef);
        }
        notifyPressedTrigger(internalRef, focusIdentifier);
        onLongPress(event);
    };

    const onPressHandler = (event?: GestureResponderEvent | KeyboardEvent) => {
        if (isDisabled || !interactive) {
            return;
        }
        if (!onPress) {
            return;
        }
        if (shouldUseHapticsOnPress) {
            HapticFeedback.press();
        }
        if (ref && 'current' in ref && nextFocusRef) {
            ref.current?.blur();
            Accessibility.moveAccessibilityFocus(nextFocusRef);
        }
        notifyPressedTrigger(internalRef, focusIdentifier);
        return onPress(event);
    };

    const voidOnPressHandler = (...args: Parameters<typeof onPressHandler>) => {
        onPressHandler(...args);
    };

    const onKeyboardShortcutPressHandler = (event?: GestureResponderEvent | KeyboardEvent) => {
        onPressHandler(event);
    };

    const pressOnce = (event?: GestureResponderEvent) => singleExecution(onPressHandler)(event);

    const hasHref = !!linkRoute && !isDisabled && !fullDisabled && interactive;

    // The browser follows the href unless the click is prevented, so only Cmd, Ctrl or Shift clicks on an enabled link reach it and open a new tab or window.
    const pressLink = (event?: GestureResponderEvent) => {
        if (hasHref && isNewTabOrWindowMousePress(event)) {
            return;
        }
        event?.preventDefault();
        if (isDisabled) {
            return;
        }
        pressOnce(event);
    };

    const getPressHandler = () => {
        if (linkRoute) {
            return pressLink;
        }
        return !isDisabled ? pressOnce : undefined;
    };

    useKeyboardShortcut(keyboardShortcut ?? NO_KEYBOARD_SHORTCUT, onKeyboardShortcutPressHandler, {
        isActive: !!keyboardShortcut,
        shouldBubble: false,
        shouldPreventDefault: false,
    });

    const isRoleLink = rest.role === CONST.ROLE.LINK;

    /**
     * Handles keyboard events for the pressable element.
     * If a custom onKeyDown handler is provided, it delegates to that handler.
     * Otherwise, for elements with role="link", it triggers onPress when Enter is pressed
     * to comply with W3C APG Link Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/link/).
     * An element with an href is skipped, because the browser turns Enter into a click that keeps its modifier keys for pressLink.
     */
    const handleKeyDown = (event: ViewKeyDownEvent) => {
        if (onKeyDown) {
            onKeyDown(event);
            return;
        }

        if (isRoleLink && !hasHref && event.nativeEvent.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            event.preventDefault();
            onPressHandler(event.nativeEvent);
        }
    };

    return (
        <Pressable
            hitSlop={shouldUseAutoHitSlop ? hitSlop : undefined}
            onLayout={shouldUseAutoHitSlop ? onLayout : undefined}
            ref={composedRef}
            disabled={fullDisabled || undefined}
            onPress={getPressHandler()}
            onLongPress={!isDisabled && onLongPress ? onLongPressHandler : undefined}
            onKeyDown={!isDisabled ? handleKeyDown : undefined}
            onPressIn={!isDisabled ? onPressIn : undefined}
            onPressOut={!isDisabled ? onPressOut : undefined}
            dataSet={{...(shouldSuppressSelection ? {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true} : {}), ...(dataSet ?? {})}}
            style={(state) => [
                cursorStyle,
                StyleUtils.parseStyleFromFunction(style, state),
                isScreenReaderActive && StyleUtils.parseStyleFromFunction(screenReaderActiveStyle, state),
                state.focused && StyleUtils.parseStyleFromFunction(focusStyle, state),
                (state.hovered || isHovered) && StyleUtils.parseStyleFromFunction(hoverStyle, state),
                state.pressed && StyleUtils.parseStyleFromFunction(pressStyle, state),
                isDisabled && [StyleUtils.parseStyleFromFunction(disabledStyle, state), styles.noSelect],
                shouldAllowTextSelection ? styles.userSelectAuto : shouldSuppressSelection && styles.userSelectNone,
            ]}
            // accessibility props
            accessibilityState={{
                disabled: isDisabled,
                ...accessibilityState,
            }}
            aria-disabled={isDisabled}
            aria-checked={accessibilityState?.checked}
            aria-selected={accessibilityState?.selected}
            aria-expanded={accessibilityState?.expanded}
            aria-keyshortcuts={keyboardShortcut && `${keyboardShortcut.modifiers.join('')}+${keyboardShortcut.shortcutKey}`}
            // ios-only form of inputs
            onMagicTap={!isDisabled ? voidOnPressHandler : undefined}
            onAccessibilityTap={!isDisabled ? voidOnPressHandler : undefined}
            accessible={accessible}
            fsClass={forwardedFSClass}
            href={hasHref && linkRoute ? getRoutePath(linkRoute) : undefined}
            {...rest}
            onHoverOut={(event) => {
                if (event?.type === 'pointerenter' || event?.type === 'mouseenter') {
                    return;
                }
                setIsHovered(false);
                if (rest.onHoverOut) {
                    rest.onHoverOut(event);
                }
            }}
            onHoverIn={(event) => {
                setIsHovered(true);
                if (rest.onHoverIn) {
                    rest.onHoverIn(event);
                }
            }}
        >
            {(state) => (typeof children === 'function' ? children({...state, isScreenReaderActive, hovered: state.hovered || isHovered, isDisabled}) : children)}
        </Pressable>
    );
}

export default GenericPressable;
