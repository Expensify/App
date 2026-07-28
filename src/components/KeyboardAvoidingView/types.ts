import type {KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps} from 'react-native';

type KeyboardAvoidingViewProps = RNKeyboardAvoidingViewProps & {
    /**
     * Whether to compensate for the bottom safe area padding.
     * The KeyboardAvoidingView will use a negative keyboardVerticalOffset.
     */
    shouldOffsetBottomSafeAreaPadding?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {KeyboardAvoidingViewProps};
