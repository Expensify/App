import type {ElementRef, ForwardedRef, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, HostComponent, PressableStateCallbackType, PressableProps as RNPressableProps, Text as RNText, StyleProp, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {Shortcut} from '@libs/KeyboardShortcut';
import type CONST from '@src/CONST';

type StylePropWithFunction = StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

type RequiredAccessibilityLabel =
    | {
          /**
           * When true, indicates that the view is an accessibility element.
           * By default, all the touchable elements are accessible.
           */
          accessible?: true | undefined;

          /**
           * Specifies the accessibility label for the component
           * @example 'Search'
           * @example 'Close'
           */
          accessibilityLabel: string;
      }
    | {
          /**
           * When false, indicates that the view is not an accessibility element.
           */
          accessible: false;

          /**
           * Specifies the accessibility label for the component
           * @example 'Search'
           * @example 'Close'
           */
          accessibilityLabel?: string;
      };

type PressableProps = RNPressableProps &
    RequiredAccessibilityLabel & {
        /**
         * onPress callback
         */
        onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /**
         * Specifies keyboard shortcut to trigger onPressHandler
         * @example {shortcutKey: 'a', modifiers: ['ctrl', 'shift'], descriptionKey: 'keyboardShortcut.description'}
         */
        keyboardShortcut?: Shortcut;

        /**
         * Specifies if haptic feedback should be used on press
         * @default false
         */
        shouldUseHapticsOnPress?: boolean;

        /**
         * Specifies if haptic feedback should be used on long press
         * @default false
         */
        shouldUseHapticsOnLongPress?: boolean;

        /**
         * style for when the component is disabled. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
         * @default {}
         * @example {backgroundColor: 'red'}
         * @example state => ({backgroundColor: state.isDisabled ? 'red' : 'blue'})
         */
        disabledStyle?: StylePropWithFunction;

        /**
         * style for when the component is hovered. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
         * @default {}
         * @example {backgroundColor: 'red'}
         * @example state => ({backgroundColor: state.hovered ? 'red' : 'blue'})
         */
        hoverStyle?: StylePropWithFunction;

        /**
         * style for when the component is focused. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
         * @default {}
         * @example {backgroundColor: 'red'}
         * @example state => ({backgroundColor: state.focused ? 'red' : 'blue'})
         */
        focusStyle?: StylePropWithFunction;

        /**
         * style for when the component is pressed. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
         * @default {}
         * @example {backgroundColor: 'red'}
         * @example state => ({backgroundColor: state.pressed ? 'red' : 'blue'})
         */
        pressStyle?: StylePropWithFunction;

        /**
         * style for when the component is active and the screen reader is on.
         * Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
         * @default {}
         * @example {backgroundColor: 'red'}
         * @example state => ({backgroundColor: state.isScreenReaderActive ? 'red' : 'blue'})
         */
        screenReaderActiveStyle?: StylePropWithFunction;

        /**
         * Specifies if the component should be accessible when the screen reader is on
         * @default 'all'
         * @example 'all' - the component is accessible regardless of screen reader state
         * @example 'active' - the component is accessible only when the screen reader is on
         * @example 'disabled' - the component is not accessible when the screen reader is on
         */
        enableInScreenReaderStates?: ValueOf<typeof CONST.SCREEN_READER_STATES>;

        /**
         * Specifies which component should be focused after interacting with this component
         */
        nextFocusRef?: ElementRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement>;

        /**
         * Specifies the accessibility label for the component
         * @example 'Search'
         * @example 'Close'
         */
        accessibilityLabel?: string;

        /**
         * Specifies the accessibility hint for the component
         * @example 'Double tap to open'
         */
        accessibilityHint?: string;

        /**
         * Specifies if the component should calculate its hitSlop automatically
         * @default true
         */
        shouldUseAutoHitSlop?: boolean;

        /** Turns off drag area for the component */
        noDragArea?: boolean;

        /**
         * Specifies if the pressable responder should be disabled
         */
        fullDisabled?: boolean;

        /**
         * Whether the menu item should be interactive at all
         * e.g., show disabled cursor when disabled
         */
        interactive?: boolean;
    };

type PressableRef = ForwardedRef<HTMLDivElement | View | RNText | undefined>;

export default PressableProps;
export type {PressableRef};
