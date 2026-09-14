import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import type {KeyboardTypeOptions, NativeSyntheticEvent, StyleProp, TextInputKeyPressEvent, TextInputSelectionChangeEvent, TextStyle, ViewStyle} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import React from 'react';

import type {TextSelection} from './Composer/types';
import type {BaseTextInputProps} from './TextInput/BaseTextInput/types';

import TextInput from './TextInput';

type AmountTextInputProps = {
    /** Formatted amount in local currency  */
    formattedAmount: string;

    /** Function to call when amount in text input is changed */
    onChangeAmount: (amount: string) => void;

    placeholder: string;
    selection?: TextSelection;
    onSelectionChange?: (event: TextInputSelectionChangeEvent) => void;
    style?: StyleProp<TextStyle>;

    /** Style for the container */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

    disableKeyboard?: boolean;

    /** Function to call to handle key presses in the text input */
    onKeyPress?: (event: NativeSyntheticEvent<KeyboardEvent>) => void;

    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to apply padding to the input, some inputs doesn't require any padding, e.g. Amount input in money request flow */
    shouldApplyPaddingToContainer?: boolean;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;

    /** A unique identifier for this text input for testing purposes */
    testID?: string;

    keyboardType?: KeyboardTypeOptions;

    /** Component to render on the right hand side of the input - only shown if clear button is not rendered */
    rightHandSideComponent?: React.ReactNode;
} & Pick<BaseTextInputProps, 'autoFocus' | 'autoGrowExtraSpace' | 'submitBehavior' | 'ref' | 'onFocus' | 'onBlur' | 'disabled' | 'accessibilityLabel'>;

function AmountTextInput({
    formattedAmount,
    onChangeAmount,
    placeholder,
    selection,
    onSelectionChange,
    style,
    touchableInputWrapperStyle,
    onKeyPress,
    containerStyle,
    disableKeyboard = true,
    hideFocusedState = true,
    shouldApplyPaddingToContainer = false,
    ref,
    disabled,
    accessibilityLabel,
    rightHandSideComponent,
    ...rest
}: AmountTextInputProps) {
    const navigation = useNavigation();
    const {translate} = useLocalize();

    return (
        <TextInput
            autoGrow
            hideFocusedState={hideFocusedState}
            shouldInterceptSwipe
            disableKeyboard={disableKeyboard}
            inputStyle={style}
            textInputContainerStyles={containerStyle}
            onChangeText={onChangeAmount}
            ref={ref}
            disabled={disabled}
            value={formattedAmount}
            placeholder={placeholder}
            inputMode={!rest.keyboardType ? CONST.INPUT_MODE.DECIMAL : undefined}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            submitBehavior="submit"
            selection={selection}
            onSelectionChange={onSelectionChange}
            accessibilityLabel={accessibilityLabel ?? translate('iou.amount')}
            onKeyPress={onKeyPress as (event: TextInputKeyPressEvent) => void}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            // On iPad, even if the soft keyboard is hidden, the keyboard suggestion is still shown.
            // Setting both autoCorrect and spellCheck to false will hide the suggestion.
            autoCorrect={false}
            spellCheck={false}
            disableKeyboardShortcuts
            shouldUseFullInputHeight
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            rightHandSideComponent={rightHandSideComponent}
            navigation={navigation}
            {...rest}
        />
    );
}

export default AmountTextInput;
