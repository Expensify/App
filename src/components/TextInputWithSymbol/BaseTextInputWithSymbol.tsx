import React from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import AmountTextInput from '@components/AmountTextInput';
import SymbolButton from '@components/SymbolButton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addLeadingZero, replaceAllDigits} from '@libs/MoneyRequestUtils';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import CONST from '@src/CONST';
import type BaseTextInputWithSymbolProps from './types';

function BaseTextInputWithSymbol(
    {
        symbol,
        symbolPosition = CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX,
        onSymbolButtonPress = () => {},
        onChangeAmount = () => {},
        formattedAmount,
        placeholder,
        selection,
        onSelectionChange = () => {},
        onKeyPress = () => {},
        isSymbolPressable = true,
        hideSymbol = false,
        style,
        ...rest
    }: BaseTextInputWithSymbolProps,
    ref: React.ForwardedRef<BaseTextInputRef>,
) {
    const {fromLocaleDigit} = useLocalize();
    const styles = useThemeStyles();

    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    const setFormattedAmount = (text: string) => {
        const newAmount = addLeadingZero(replaceAllDigits(text, fromLocaleDigit));
        onChangeAmount(newAmount);
    };

    return (
        <>
            {!hideSymbol && symbolPosition === CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX && (
                <SymbolButton
                    symbol={symbol}
                    onSymbolButtonPress={onSymbolButtonPress}
                    isSymbolPressable={isSymbolPressable}
                />
            )}
            <AmountTextInput
                formattedAmount={formattedAmount}
                onChangeAmount={setFormattedAmount}
                placeholder={placeholder}
                ref={ref}
                selection={selection}
                onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                    onSelectionChange(event);
                }}
                onKeyPress={onKeyPress}
                style={[styles.pr1, style]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
            {!hideSymbol && symbolPosition === CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX && (
                <SymbolButton
                    symbol={symbol}
                    onSymbolButtonPress={onSymbolButtonPress}
                    isSymbolPressable={isSymbolPressable}
                />
            )}
        </>
    );
}

BaseTextInputWithSymbol.displayName = 'BaseTextInputWithSymbol';

export default React.forwardRef(BaseTextInputWithSymbol);
