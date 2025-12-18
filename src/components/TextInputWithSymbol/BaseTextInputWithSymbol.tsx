import React from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';
import {View} from 'react-native';
import AmountTextInput from '@components/AmountTextInput';
import SymbolButton from '@components/SymbolButton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addLeadingZero, replaceAllDigits} from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import type BaseTextInputWithSymbolProps from './types';

function BaseTextInputWithSymbol({
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
    symbolTextStyle,
    isNegative = false,
    ref,
    disabled,
    ...props
}: BaseTextInputWithSymbolProps) {
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
        <View style={[styles.flexRow]}>
            {isNegative && (
                <View style={[styles.flexRow, props.flipButton ? styles.alignItemsStart : styles.alignItemsCenter]}>
                    <Text style={styles.iouAmountText}>-</Text>
                </View>
            )}
            {!hideSymbol && symbolPosition === CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX && (
                <SymbolButton
                    symbol={symbol}
                    onSymbolButtonPress={onSymbolButtonPress}
                    isSymbolPressable={isSymbolPressable}
                    textStyle={symbolTextStyle}
                />
            )}
            <AmountTextInput
                formattedAmount={formattedAmount}
                onChangeAmount={setFormattedAmount}
                placeholder={placeholder}
                ref={ref}
                disabled={disabled}
                selection={selection}
                onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                    onSelectionChange(event);
                }}
                onKeyPress={onKeyPress}
                style={[styles.pr1, style]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
            {!hideSymbol && symbolPosition === CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX && (
                <SymbolButton
                    symbol={symbol}
                    onSymbolButtonPress={onSymbolButtonPress}
                    isSymbolPressable={isSymbolPressable}
                    textStyle={symbolTextStyle}
                />
            )}
        </View>
    );
}

BaseTextInputWithSymbol.displayName = 'BaseTextInputWithSymbol';

export default BaseTextInputWithSymbol;
