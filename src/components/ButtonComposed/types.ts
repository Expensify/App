import type CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {ForwardedRef} from 'react';
import type React from 'react';
import type {AccessibilityState, GestureResponderEvent, LayoutChangeEvent, NativeSyntheticEvent, StyleProp, TargetedEvent, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import type {ButtonVariant} from './context';

type ButtonEventsProps = {
    /** A function that is called when the button is clicked on */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** A function that is called when the button is long pressed */
    onLongPress?: (event?: GestureResponderEvent) => void;

    /** A function that is called when the button is pressed */
    onPressIn?: (event: GestureResponderEvent) => void;

    /** A function that is called when the button is released */
    onPressOut?: (event: GestureResponderEvent) => void;

    /** Callback that is called when mousedown is triggered. */
    onMouseDown?: (e: React.MouseEvent<Element, MouseEvent>) => void;

    /** Invoked on mount and layout changes */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** A function that is called when the button receives focus */
    onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;

    /** A function that is called when the button loses focus */
    onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
};

type ButtonBehaviorProps = {
    /** Indicates whether the button should be disabled and in the loading state */
    isLoading?: boolean;

    /** Indicates whether the button should be disabled */
    isDisabled?: boolean;

    /** Should enable the haptic feedback? */
    enableHapticFeedback?: boolean;

    /** Should disable the long press? */
    isLongPressDisabled?: boolean;

    /**
     * Whether the button should have a background layer in the color of theme.appBG.
     * This is needed for buttons that allow content to display under them.
     */
    blendOpacity?: boolean;

    /** Whether is a nested button inside other button, since nesting buttons isn't valid html */
    isNested?: boolean;

    /** Should enable the haptic feedback? */
    stayNormalOnDisable?: boolean;
};

/**
 * Props for the ButtonKeyboardShortcut primitive — the Enter-key shortcut configuration.
 */
type ButtonKeyboardShortcutProps = {
    /** The priority to assign the enter key event listener. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Whether the Enter keyboard listening is active whether or not the screen that contains the button is focused */
    isPressOnEnterActive?: boolean;

    /** Should the press event bubble across multiple instances when Enter key triggers it. */
    allowBubble?: boolean;
};

type ButtonStyleProps = {
    /** Additional styles to add after local styles. Applied to Pressable portion of button */
    style?: StyleProp<ViewStyle>;

    /** Additional button styles. Specific to the OpacityView of the button */
    innerStyles?: StyleProp<ViewStyle>;

    /** Any additional styles to pass to the content container wrapping all children (icons + text). */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Additional styles to add to the component when it's disabled */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Additional hover styles applied on top of theme-derived hovers (default/success/danger). */
    hoverStyles?: StyleProp<ViewStyle>;

    /** Should we remove the border radius on a specific side? */
    removeBorderRadius?: 'left' | 'right' | 'all';

    /** The size of the button */
    size?: ValueOf<typeof CONST.BUTTON_SIZE>;

    /** The visual variant of the button, which controls its color scheme */
    variant?: ButtonVariant;
};

type BaseButtonProps = WithSentryLabel &
    ButtonEventsProps &
    ButtonBehaviorProps &
    ButtonStyleProps & {
        /** Id to use for this button */
        id?: string;

        /** The testID of the button. Used to locate this view in end-to-end tests. */
        testID?: string;

        /** Accessibility label for the component */
        accessibilityLabel?: string;

        /** Accessibility state to pass to the pressable */
        accessibilityState?: AccessibilityState;

        /**
         * Reference to the outer element.
         */
        ref?: ForwardedRef<View>;
    };

type ButtonProps = BaseButtonProps & {
    /** The content of the button, can be a string or a combination of Button.Icon and Button.Text */
    children: React.ReactNode;
};

export type {ButtonEventsProps, ButtonBehaviorProps, ButtonStyleProps, BaseButtonProps, ButtonProps, ButtonKeyboardShortcutProps};
