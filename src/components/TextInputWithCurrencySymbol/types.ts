import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import type TextSelection from '@src/types/utils/TextSelection';

type TextInputWithCurrencySymbolProps = {
    /** Formatted amount in local currency  */
    formattedAmount: string;

    /** Function to call when amount in text input is changed */
    onChangeAmount?: (amount: string) => void;

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress?: () => void;

    /** Placeholder value for amount text input */
    placeholder: string;

    /** Currency code of user's selected currency */
    selectedCurrencyCode: string;

    /** Selection Object */
    selection?: TextSelection;

    /** Function to call when selection in text input is changed */
    onSelectionChange?: (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: () => void;
};

type TextInputWithCurrencySymbolPropsWithForwardedRef = TextInputWithCurrencySymbolProps & {
    /** A ref to forward to amount text input */
    forwardedRef: BaseTextInputRef;
};

export type {TextInputWithCurrencySymbolProps, TextInputWithCurrencySymbolPropsWithForwardedRef};
