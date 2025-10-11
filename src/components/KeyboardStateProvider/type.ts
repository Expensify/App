import type {RefObject} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type KeyboardStateContextValue = {
    /** Whether the keyboard is open */
    isKeyboardShown: boolean;

    /** Whether the keyboard is animating or shown */
    isKeyboardActive: boolean;

    /** Height of the keyboard in pixels */
    keyboardHeight: number;

    /** Future or present height of the keyboard in pixels. Available together with isKeyboardActive. */
    keyboardActiveHeight?: number;

    /** Ref to check if the keyboard is animating */
    isKeyboardAnimatingRef: RefObject<boolean>;
};

type BaseKeyboardStateProviderProps = ChildrenProps & {
    keyboardHeight: number;
    keyboardActiveHeight?: number;
    isKeyboardActive: boolean;
    isKeyboardAnimatingRef: RefObject<boolean>;
};

export type {KeyboardStateContextValue, BaseKeyboardStateProviderProps};
