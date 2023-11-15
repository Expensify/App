import React from 'react';
import {GestureResponderEvent, NativeSyntheticEvent, StyleProp, TextInput, TextInputFocusEventData, TextInputProps, ViewStyle} from 'react-native';
import {SrcProps} from '@components/Icon';

type CustomTextInputProps = {
    /** Input label */
    label?: string;

    /** Name attribute for the input */
    name?: string;

    /** Input value */
    value?: string;

    /** Default value - used for non controlled inputs */
    defaultValue?: string;

    /** Input value placeholder */
    placeholder?: string;

    /** Error text to display */
    errorText: string | string[] | Record<string, string>;

    /** Icon to display in right side of text input */
    icon: (props: SrcProps) => React.ReactNode;

    /** Customize the TextInput container */
    textInputContainerStyles: StyleProp<ViewStyle>;

    /** Customize the main container */
    containerStyles: StyleProp<ViewStyle>;

    /** input style */
    inputStyle: StyleProp<ViewStyle>;

    /** If present, this prop forces the label to remain in a position where it will not collide with input text */
    forceActiveLabel?: boolean;

    /** Should the input auto focus? */
    autoFocus?: boolean;

    /** Disable the virtual keyboard  */
    disableKeyboard?: boolean;

    /**
     * Autogrow input container length based on the entered text.
     * Note: If you use this prop, the text input has to be controlled
     * by a value prop.
     */
    autoGrow?: boolean;

    /**
     * Autogrow input container height based on the entered text
     * Note: If you use this prop, the text input has to be controlled
     * by a value prop.
     */
    autoGrowHeight?: boolean;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;

    /** Forward the inner ref */
    innerRef?: React.RefObject<TextInput>;

    /** Maximum characters allowed */
    maxLength?: number;

    /** Hint text to display below the TextInput */
    hint?: string;

    /** Prefix character */
    prefixCharacter?: string;

    /** Whether autoCorrect functionality should enable  */
    autoCorrect?: boolean;

    /** Form props */
    /** The ID used to uniquely identify the input in a Form */
    inputID?: string;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** Callback to update the value on Form when input is used in the Form component. */
    onInputChange?: (value: string) => void;

    /** Whether we should wait before focusing the TextInput, useful when using transitions  */
    shouldDelayFocus?: boolean;

    /** Indicate whether pressing Enter on multiline input is allowed to submit the form. */
    submitOnEnter?: boolean;

    /** Indicate whether input is multiline */
    multiline?: boolean;

    /** Set the default value to the input if there is a valid saved value */
    shouldUseDefaultValue?: boolean;

    /** Indicate whether or not the input should prevent swipe actions in tabs */
    shouldInterceptSwipe?: boolean;

    hasError?: boolean;
    onPress?: (event: GestureResponderEvent | KeyboardEvent) => void;
    isLoading?: boolean;
    translate?: (key: string) => string;
};

type BaseTextInputProps = CustomTextInputProps & TextInputProps;
export default BaseTextInputProps;
