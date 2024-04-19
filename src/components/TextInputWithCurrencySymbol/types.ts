import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {TextSelection} from '@components/Composer/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

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

    /** Whether the currency symbol is pressable */
    isCurrencyPressable: boolean;

    /** Whether to hide the currency symbol */
    hideCurrencySymbol?: boolean;

    /** Extra symbol to display */
    extraSymbol?: React.ReactNode;
} & Pick<BaseTextInputProps, 'autoFocus'>;

export default TextInputWithCurrencySymbolProps;
