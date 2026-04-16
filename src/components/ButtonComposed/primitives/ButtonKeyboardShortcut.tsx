import {useIsFocused} from '@react-navigation/native';
import {useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import validateSubmitShortcut from '@components/Button/validateSubmitShortcut';
import type {ButtonKeyboardShortcutProps} from '@components/ButtonComposed/types';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';

const accessibilityRoles: string[] = Object.values(CONST.ROLE);

/**
 * Registers an Enter-key keyboard shortcut that triggers the button's onPress handler.
 * Renders nothing to the DOM — it is a pure-behavior primitive intended to be composed
 * alongside ButtonText, ButtonIconLeft, etc. as a child of Button.
 *
 * Usage:
 *   <Button onPress={submit}>
 *     <ButtonKeyboardShortcut pressOnEnter onPress={submit} isDisabled={isDisabled} />
 *     <ButtonText>Submit</ButtonText>
 *   </Button>
 */
function ButtonKeyboardShortcut({
    isDisabled = false,
    isLoading = false,
    onPress = () => {},
    pressOnEnter,
    allowBubble,
    enterKeyEventListenerPriority,
    isPressOnEnterActive = false,
}: ButtonKeyboardShortcutProps) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [shouldDisableEnterShortcut, isFocused],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, keyboardShortcutCallback, config);

    return null;
}

export default ButtonKeyboardShortcut;
