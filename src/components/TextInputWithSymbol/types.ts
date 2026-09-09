import type {TextSelection} from '@components/Composer/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type CONST from '@src/CONST';

import type {KeyboardTypeOptions, NativeSyntheticEvent, StyleProp, TextInputSelectionChangeEvent, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

type BaseTextInputWithSymbolProps = {
    formattedAmount: string;

    /** Function to call when amount in text input is changed */
    onChangeAmount?: (amount: string) => void;

    onSymbolButtonPress?: () => void;

    /** Placeholder value for amount text input */
    placeholder: string;

    symbol: string;
    symbolPosition?: ValueOf<typeof CONST.TEXT_INPUT_SYMBOL_POSITION>;
    isSymbolPressable?: boolean;
    hideSymbol?: boolean;
    selection?: TextSelection;
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

    style?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;

    /** Character to be shown before the amount */
    prefixCharacter?: string;

    prefixStyle?: StyleProp<TextStyle>;
    prefixContainerStyle?: StyleProp<ViewStyle>;

    /** Customizes the touchable wrapper of the TextInput component */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

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

    negativeSymbolStyle?: StyleProp<TextStyle>;

    /** The test ID of TextInput. Used to locate the view in end-to-end tests. */
    testID?: string;

    keyboardType?: KeyboardTypeOptions;

    /** Component to render on the right hand side of the input - only shown if clear button is not rendered */
    rightHandSideComponent?: React.ReactNode;
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
    | 'accessibilityLabel'
    | 'shouldAllowFocusInLandscapeMode'
>;

type TextInputWithSymbolProps = Omit<BaseTextInputWithSymbolProps, 'onSelectionChange'> & {
    onSelectionChange?: (start: number, end: number) => void;
};

export type {TextInputWithSymbolProps};

export default BaseTextInputWithSymbolProps;
