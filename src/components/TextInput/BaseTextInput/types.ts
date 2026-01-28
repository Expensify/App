import type {MarkdownRange, MarkdownStyle} from '@expensify/react-native-live-markdown';
import type {NavigationProp, NavigationState} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import type {GestureResponderEvent, StyleProp, TextInputProps, TextStyle, ViewStyle} from 'react-native';
import type {MaskedTextInputOwnProps} from 'react-native-advanced-input-mask/lib/typescript/src/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type IconAsset from '@src/types/utils/IconAsset';

type InputType = 'markdown' | 'mask' | 'default';
type CustomBaseTextInputProps = ForwardedFSClassProps & {
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

    /** Whether to include padding to the icon container */
    includeIconPadding?: boolean;

    /** Customize the TextInput container */
    textInputContainerStyles?: StyleProp<ViewStyle>;

    /** Whether to apply padding to the input, some inputs doesn't require any padding, e.g. Amount input in money request flow */
    shouldApplyPaddingToContainer?: boolean;

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
     *   input container length based on the entered text.
     */
    autoGrow?: boolean;

    /** If autoGrow is enabled, this reserves extra space for incoming characters to prevent flickering on native platforms. */
    autoGrowExtraSpace?: number;

    /**
     * Specifies the side ('left' or 'right') where the autoGrow margin should be applied.
     * This determines which side of the input container will expand when autoGrow is enabled.
     */
    autoGrowMarginSide?: 'left' | 'right';

    /**
     * Auto grow input container height based on the entered text
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

    /** List of markdowns that won't be styled as a markdown */
    excludedMarkdownStyles?: Array<keyof MarkdownStyle>;

    /** A set of styles for markdown elements (such as link, h1, emoji etc.) */
    markdownStyle?: MarkdownStyle;

    /** Custom parser function for RNMarkdownTextInput */
    parser?: (input: string) => MarkdownRange[];

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

    /** Style for the icon container */
    iconContainerStyle?: StyleProp<ViewStyle>;

    /** The width of inner content */
    contentWidth?: number;

    /** The type (internal implementation) of input. Can be one of: `default`, `mask`, `markdown` */
    type?: InputType;

    /** The mask of the masked input */
    mask?: MaskedTextInputOwnProps['mask'];

    /** Custom notations for the masked input */
    customNotations?: MaskedTextInputOwnProps['customNotations'];

    /** A set of permitted characters for the input */
    allowedKeys?: MaskedTextInputOwnProps['allowedKeys'];

    /** A regular expression to validate the input before proceeding to masking stage */
    validationRegex?: MaskedTextInputOwnProps['validationRegex'];

    /** Whether the input should be enforced to be uncontrolled. Default is `false` */
    uncontrolled?: boolean;

    /** Whether the clear button should always be displayed */
    shouldHideClearButton?: boolean;

    /** Callback when the input is cleared using the clear button */
    onClearInput?: () => void;

    /** Whether the input should be enforced to take full height of container. Default is `false` */
    shouldUseFullInputHeight?: boolean;

    /** Whether the input prefix should use the default `Text` line height fallback. Disable this if you intentionally want the prefix to have `lineHeight: undefined` */
    shouldUseDefaultLineHeightForPrefix?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** When the `disableKeyboard` prop is passed with the value `true`, we need to pass the `navigation` prop from `useNavigation` to ensure that the `disableKeyboard` functionality works correctly when the application is in the background */
    navigation?: Omit<NavigationProp<ReactNavigation.RootParamList>, 'getState'> & {
        getState(): NavigationState | undefined;
    };

    /** Label for Sentry tracking */
    sentryLabel?: string;
};

type BaseTextInputRef = HTMLFormElement | AnimatedTextInputRef;

type BaseTextInputProps = CustomBaseTextInputProps & TextInputProps;

export type {BaseTextInputProps, BaseTextInputRef, InputType};
