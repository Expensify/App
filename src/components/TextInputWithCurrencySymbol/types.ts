import type {NativeSyntheticEvent, StyleProp, TextInputFocusEventData, TextInputSelectionChangeEventData, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {TextSelection} from '@components/Composer/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import type CONST from '@src/CONST';

type TextInputWithCurrencySymbolProps = {
    /** Formatted amount in local currency  */
    formattedAmount: string;

    /** Function to call when amount in text input is changed */
    onChangeAmount?: (value: string) => void;

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress?: () => void;

    /** Placeholder value for amount text input */
    placeholder: string;

    /** Currency code of user's selected currency */
    selectedCurrencyCode: string;

    /** Selection Object */
    selection?: TextSelection;

    /** Function to call when selection in text input is changed */
    onSelectionChange?: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: (event: NativeSyntheticEvent<KeyboardEvent>) => void;

    /**
     * Callback that is called when the text input is blurred
     */
    onBlur?: ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void) | undefined;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable: boolean;

    /** Whether to hide the currency symbol */
    hideCurrencySymbol?: boolean;

    /** Whether to disable native keyboard on mobile */
    disableKeyboard?: boolean;

    /** Extra symbol to display */
    extraSymbol?: React.ReactNode;

    /** Style for the input */
    style?: StyleProp<TextStyle>;

    /** Style for the container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Character to be shown before the amount */
    prefixCharacter?: string;

    /** Style for the prefix */
    prefixStyle?: StyleProp<TextStyle>;

    /** Style for the prefix container */
    prefixContainerStyle?: StyleProp<ViewStyle>;

    /** Customizes the touchable wrapper of the TextInput component */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

    /**
     * Is this input right-aligned and has to grow to the left or vice-versa?
     */
    autoGrowDirection?: ValueOf<typeof CONST.INPUT_AUTOGROW_DIRECTION>;
} & Pick<BaseTextInputProps, 'autoFocus'>;

export default TextInputWithCurrencySymbolProps;
