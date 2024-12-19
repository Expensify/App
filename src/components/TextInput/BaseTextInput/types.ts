import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import type {GestureResponderEvent, StyleProp, TextInputProps, TextStyle, ViewStyle} from 'react-native';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type IconAsset from '@src/types/utils/IconAsset';

type CustomBaseTextInputProps = {
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
    errorText?: string;

    /** Icon to display in right side of text input */
    icon?: IconAsset | null;

    /** Icon to display in left side of text input */
    iconLeft?: IconAsset | null;

    /** Customize the TextInput container */
    textInputContainerStyles?: StyleProp<ViewStyle>;

    /** Customizes the touchable wrapper of the TextInput component */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

    /** Customize the main container */
    containerStyles?: StyleProp<ViewStyle>;

    /** input style */
    inputStyle?: StyleProp<TextStyle>;

    /** If present, this prop forces the label to remain in a position where it will not collide with input text */
    forceActiveLabel?: boolean;

    /** Should the input auto focus? */
    autoFocus?: boolean;

    /** Disable the virtual keyboard  */
    disableKeyboard?: boolean;

    /**
     * Autogrow input container length based on the entered text.
     */
    autoGrow?: boolean;

    /**
     * Autogrow input container height based on the entered text
     */
    autoGrowHeight?: boolean;

    /**
     * Maximum height for autoGrowHeight input
     */
    maxAutoGrowHeight?: number;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;

    /** Hint text to display below the TextInput */
    hint?: string;

    /** Prefix character */
    prefixCharacter?: string;

    /** Suffix character */
    suffixCharacter?: string;

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

    /** Indicate whether input is multiline */
    multiline?: boolean;

    /** Set the default value to the input if there is a valid saved value */
    shouldUseDefaultValue?: boolean;

    /** Indicate whether or not the input should prevent swipe actions in tabs */
    shouldInterceptSwipe?: boolean;

    /** Should there be an error displayed */
    hasError?: boolean;

    /** On Press handler */
    onPress?: (event: GestureResponderEvent | KeyboardEvent) => void;

    /** Should loading state should be displayed */
    isLoading?: boolean;

    /** Type of autocomplete */
    autoCompleteType?: string;

    /** Should live markdown be enabled. Changes RNTextInput component to RNMarkdownTextInput */
    isMarkdownEnabled?: boolean;

    /** List of markdowns that won't be styled as a markdown */
    excludedMarkdownStyles?: Array<keyof MarkdownStyle>;

    /** Whether the clear button should be displayed */
    shouldShowClearButton?: boolean;

    /** Whether to apply styles when input is disabled */
    shouldUseDisabledStyles?: boolean;

    /** Style for the prefix */
    prefixStyle?: StyleProp<TextStyle>;

    /** Style for the prefix container */
    prefixContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the suffix */
    suffixStyle?: StyleProp<TextStyle>;

    /** Style for the suffix container */
    suffixContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the loading spinner */
    loadingSpinnerStyle?: StyleProp<ViewStyle>;

    /** The width of inner content */
    contentWidth?: number;
};

type BaseTextInputRef = HTMLFormElement | AnimatedTextInputRef;

type BaseTextInputProps = CustomBaseTextInputProps & TextInputProps;

export type {BaseTextInputProps, BaseTextInputRef, CustomBaseTextInputProps};
