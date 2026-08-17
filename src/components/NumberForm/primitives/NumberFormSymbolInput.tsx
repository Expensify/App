import FormHelpMessage from '@components/FormHelpMessage';
import useNumberFormInputLogic from '@components/NumberForm/hooks/useNumberFormInputLogic';
import type {NumberFormSymbolInputProps} from '@components/NumberForm/types';
import TextInputWithSymbol from '@components/TextInputWithSymbol';

function NumberFormSymbolInput(props: NumberFormSymbolInputProps) {
    const {
        symbol = '',
        hideSymbol = false,
        isNegative = false,
        toggleNegative,
        style,
        containerStyle,
        symbolTextStyle,
        negativeSymbolStyle,
        autoGrow = true,
        disableKeyboard,
        hideFocusedState = true,
        keyboardType,
        isSymbolPressable = false,
        onSymbolButtonPress,
        ...rest
    } = props;
    const {errorText, formattedNumber, handleBlur, handleInputRef, handleKeyPress, handleSelectionChange, inputPosition, negativeMode, numberFormat, selectionForRender, setNumber} =
        useNumberFormInputLogic(props);

    // TODO: Unify both input paths (NumberForm.SymbolInput and NumberForm.TextInput) around a shared NumberForm.Error primitive so error rendering is no longer conditional.
    return (
        <>
            <TextInputWithSymbol
                {...rest}
                accessibilityLabel={rest.accessibilityLabel}
                autoFocus={rest.autoFocus}
                autoGrow={autoGrow}
                autoGrowExtraSpace={rest.autoGrowExtraSpace}
                autoGrowMarginSide={rest.autoGrowMarginSide}
                containerStyle={containerStyle}
                disableKeyboard={disableKeyboard ?? true}
                formattedAmount={formattedNumber}
                hideFocusedState={hideFocusedState}
                hideSymbol={hideSymbol}
                isNegative={negativeMode === 'external' && isNegative}
                isSymbolPressable={isSymbolPressable}
                keyboardType={keyboardType}
                negativeSymbolStyle={negativeSymbolStyle}
                onBlur={handleBlur}
                onChangeAmount={(text) => setNumber(text, {localeDigitsAlreadyNormalized: true})}
                onFocus={rest.onFocus}
                onKeyPress={handleKeyPress}
                onPress={rest.onPress}
                onSelectionChange={handleSelectionChange}
                onSymbolButtonPress={onSymbolButtonPress}
                placeholder={numberFormat(0)}
                ref={handleInputRef}
                selection={selectionForRender}
                shouldAllowFocusInLandscapeMode={rest.shouldAllowFocusInLandscapeMode}
                style={style}
                symbol={symbol}
                symbolPosition={inputPosition}
                symbolTextStyle={symbolTextStyle}
                toggleNegative={toggleNegative}
            />
            {!!errorText && <FormHelpMessage message={errorText} />}
        </>
    );
}

export default NumberFormSymbolInput;
