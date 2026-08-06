import type {ButtonVariant} from '@styles/utils/types';

import type CONST from '@src/CONST';

import type {GestureResponderEvent} from 'react-native';
import type {ValueOf} from 'type-fest';

/**
 * State (data) published by the parent `Button` for its child primitives (Text/Icon/KeyboardShortcut/...) to consume via `useButtonState`.
 * Kept separate from actions so a single provider never mixes data and functions (rulesdir/context-provider-split-values).
 */
type ButtonStateContextValue = {
    /** Button size — primitives use it to pick matching paddings/icon dimensions/font sizes. */
    size: ValueOf<typeof CONST.BUTTON_SIZE>;

    /** Visual variant of the Button (e.g. success/danger). `undefined` means the default theme. */
    variant: ButtonVariant | undefined;

    /** True while the cursor is over the Button — primitives swap to hover-state colors/styles when set. */
    isHovered: boolean;

    /** Whether the Button is disabled — `ButtonKeyboardShortcut` uses it to block the Enter shortcut. */
    isDisabled: boolean;

    /** Whether the Button is loading (external or from the immediate-press mechanism) — `ButtonKeyboardShortcut` uses it to block the Enter shortcut. */
    isLoading: boolean;
};

/** Actions (functions) published by the parent `Button`, consumed via `useButtonActions`. Kept apart from state per rulesdir/context-provider-split-values. */
type ButtonActionsContextValue = {
    /** The Button's press handler — `ButtonKeyboardShortcut` fires it when Enter is pressed. Routed through the immediate-loading mechanism, like a pointer press. */
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
};

export type {ButtonStateContextValue, ButtonActionsContextValue};
