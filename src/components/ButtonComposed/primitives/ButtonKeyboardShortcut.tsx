import validateSubmitShortcut from '@components/Button/validateSubmitShortcut';
import {useButtonContext} from '@components/ButtonComposed/context';
import type {ButtonKeyboardShortcutProps} from '@components/ButtonComposed/types';

import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import CONST from '@src/CONST';

import type {GestureResponderEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useCallback, useMemo} from 'react';

const accessibilityRoles: string[] = Object.values(CONST.ROLE);

/**
 * Registers an Enter-key keyboard shortcut that triggers the parent Button's onPress handler.
 * Renders nothing to the DOM — it is a pure-behavior primitive intended to be composed
 * alongside ButtonText, ButtonIconLeft, etc. as a child of Button.
 *
 * Usage:
 *   <Button onPress={submit} isDisabled={isDisabled}>
 *     <ButtonKeyboardShortcut pressOnEnter />
 *     <ButtonText>Submit</ButtonText>
 *   </Button>
 */
function ButtonKeyboardShortcut({pressOnEnter, allowBubble, enterKeyEventListenerPriority, isPressOnEnterActive = false}: ButtonKeyboardShortcutProps) {
    // The press handler and disabled/loading state come from the parent Button context.
    const {onPress, isDisabled, isLoading} = useButtonContext();

    const isFocused = useIsFocused();
    const activeElementRole = useActiveElementRole();

    const shouldDisableEnterShortcut = useMemo(() => accessibilityRoles.includes(activeElementRole ?? '') && activeElementRole !== CONST.ROLE.PRESENTATION, [activeElementRole]);

    const keyboardShortcutCallback = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (!validateSubmitShortcut(isDisabled, isLoading, event)) {
                return;
            }
            onPress();
        },
        [isDisabled, isLoading, onPress],
    );

    const config = useMemo(
        () => ({
            isActive: pressOnEnter && !shouldDisableEnterShortcut && (isFocused || isPressOnEnterActive),
            shouldBubble: allowBubble,
            priority: enterKeyEventListenerPriority,
            shouldPreventDefault: false,
        }),
        [pressOnEnter, shouldDisableEnterShortcut, isFocused, isPressOnEnterActive, allowBubble, enterKeyEventListenerPriority],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, keyboardShortcutCallback, config);

    return null;
}

export default ButtonKeyboardShortcut;
