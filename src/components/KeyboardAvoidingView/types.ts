import type {KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps} from 'react-native';

type KeyboardAvoidingViewProps = RNKeyboardAvoidingViewProps & {
    /**
     * Whether to compensate for the bottom safe area padding.
     * The KeyboardAvoidingView will use a negative keyboardVerticalOffset.
     */
    shouldOffsetBottomSafeAreaPadding?: boolean;

    /**
     * Whether to skip the extra bottom padding added on iOS 26 Safari to clear the floating browser bar.
     * Useful for bottom-docked content (e.g. centered modals) where that padding would expose the dimmed
     * overlay between the content and the keyboard. Only affects web on iOS 26 Safari.
     */
    shouldDisableSafari26BubblePadding?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {KeyboardAvoidingViewProps};
