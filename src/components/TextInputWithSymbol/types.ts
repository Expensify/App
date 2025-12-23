import type {NativeSyntheticEvent, StyleProp, TextInputSelectionChangeEvent, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {TextSelection} from '@components/Composer/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import type CONST from '@src/CONST';

type BaseTextInputWithSymbolProps = {
    /** Formatted amount */
    formattedAmount: string;

    /** Function to call when amount in text input is changed */
    onChangeAmount?: (amount: string) => void;

    /** Function to call when symbol button is pressed */
    onSymbolButtonPress?: () => void;

    /** Placeholder value for amount text input */
    placeholder: string;

    /** Symbol of the input */
    symbol: string;

    /** Position of the symbol */
    symbolPosition?: ValueOf<typeof CONST.TEXT_INPUT_SYMBOL_POSITION>;

    /** Whether the symbol is pressable */
    isSymbolPressable?: boolean;

    /** Whether to hide the symbol */
    hideSymbol?: boolean;

    /** Selection Object */
    selection?: TextSelection;

    /** Function to call when selection in text input is changed */
    onSelectionChange?: (event: TextInputSelectionChangeEvent) => void;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: (event: NativeSyntheticEvent<KeyboardEvent>) => void;

    /**
     * Callback that is called when the text input is pressed down
     */
    onMouseDown?: ((e: React.MouseEvent) => void) | undefined;

    /**
     * Callback that is called when the text input is pressed up
     */
    onMouseUp?: ((e: React.MouseEvent) => void) | undefined;

    /** Whether to disable native keyboard on mobile */
    disableKeyboard?: boolean;

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

    /** Style for the symbol */
    symbolTextStyle?: StyleProp<TextStyle>;

    /** Max length for the amount input */
    maxLength?: number;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;

    /** Whether to apply padding to the input, some inputs doesn't require any padding, e.g. Amount input in money request flow */
    shouldApplyPaddingToContainer?: boolean;

    /** Whether the amount is negative */
    isNegative?: boolean;

    /** Function to toggle the amount to negative */
    toggleNegative?: () => void;

    /** The test ID of TextInput. Used to locate the view in end-to-end tests. */
    testID?: string;
} & Pick<
    BaseTextInputProps,
    | 'autoFocus'
    | 'autoGrow'
    | 'autoGrowExtraSpace'
    | 'autoGrowMarginSide'
    | 'contentWidth'
    | 'onPress'
    | 'submitBehavior'
    | 'shouldUseDefaultLineHeightForPrefix'
    | 'onFocus'
    | 'onBlur'
    | 'disabled'
    | 'ref'
>;

type TextInputWithSymbolProps = Omit<BaseTextInputWithSymbolProps, 'onSelectionChange'> & {
    onSelectionChange?: (start: number, end: number) => void;
};

export type {TextInputWithSymbolProps};

export default BaseTextInputWithSymbolProps;
