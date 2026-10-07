import type {NumericEditingRef} from '@components/NumericEditingController/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import usePrevious from '@hooks/usePrevious';

import CONST from '@src/CONST';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';

import type {AdapterRootProps, AdapterTextInputProps, NumberWithSymbolFormProps, NumberWithSymbolFormRef} from './types';

import FullScreenForm from './FullScreenForm';
import InlineForm from './InlineForm';
import TextInputForm from './TextInputForm';
import useParentOwnedSign from './useParentOwnedSign';

/**
 * Adapter bridging the legacy NumberWithSymbolForm interface to the numeric components.
 * It picks one of three private paths: `displayAsTextInput` and `shouldWrapInputInContainer={false}` (split rows) render a
 * NumericField, and everything else renders the full-screen NumericInput, which owns the screen layout and the number pad.
 * Every legacy behavior (the parent-owned sign, the legacy prop names) lives inside this folder, so the numeric components
 * never receive the legacy flags. The legacy layout props (`shouldShowBigNumberPad`, `scrollViewStyle` on the full-screen
 * path, `negativeSymbolStyle`) are accepted but no longer change anything: NumericInput always shows the pad on touch screens.
 *
 * Transitional: callers should migrate to NumericField (inline fields) or NumericInput (full-screen forms) directly, owning
 * a signed value instead of `isNegative`/`toggleNegative`. This folder is removed once no caller is left.
 */
function NumberWithSymbolForm({
    value = '',
    symbol = '',
    currency = '',
    symbolPosition = CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX,
    hideSymbol = false,
    decimals = 0,
    maxLength,
    errorText,
    onInputChange,
    onSymbolButtonPress,
    isSymbolPressable = true,
    displayAsTextInput = false,
    footer,
    numberFormRef,
    label,
    style,
    containerStyle,
    symbolTextStyle,
    shouldUseDynamicFontSize = false,
    autoGrow = true,
    disableKeyboard = true,
    prefixCharacter = '',
    hideFocusedState = true,
    shouldApplyPaddingToContainer = false,
    shouldUseDefaultLineHeightForPrefix = true,
    shouldWrapInputInContainer = true,
    scrollViewStyle,
    shouldRefocusOnScrollViewClick = false,
    isNegative = false,
    allowFlippingAmount = false,
    allowNegativeInput = false,
    toggleNegative,
    clearNegative,
    ref,
    disabled,
    onSubmitEditing,
    shouldShowFlipButton = false,
    shouldShowCurrencyButton = false,
    leadingRightHandSideComponent,
    onCurrencyButtonPress,
    currencyButtonLabel,
    currencyButtonAccessibilityLabel,
    shouldUseBorderlessButtons = false,
    ...props
}: NumberWithSymbolFormProps) {
    const isFocused = useIsFocused();
    const wasFocused = usePrevious(isFocused);
    const innerEditingRef = useRef<NumericEditingRef | null>(null);
    const textInputRef = useRef<BaseTextInputRef | null>(null);

    const sign = useParentOwnedSign({
        value,
        isNegative,
        displayAsTextInput,
        allowFlippingAmount,
        allowNegativeInput,
        decimals,
        maxLength,
        onInputChange,
        toggleNegative,
        clearNegative,
        editingRef: innerEditingRef,
        numberFormRef,
    });

    // A hidden symbol is composed as no symbol at all
    const visibleSymbol = hideSymbol ? '' : symbol;

    const setTextInputRef = (newRef: BaseTextInputRef | null) => {
        textInputRef.current = newRef;
        if (typeof ref === 'function') {
            ref(newRef);
        } else if (ref && 'current' in ref) {
            // eslint-disable-next-line no-param-reassign
            ref.current = newRef;
        }
    };

    // Clears text selection if user visits symbol (currency) selector and comes back
    useEffect(() => {
        if (!isFocused || wasFocused) {
            return;
        }
        innerEditingRef.current?.clearSelection();
    }, [isFocused, wasFocused]);

    if (displayAsTextInput) {
        // The text-input path takes the sign from the typed value, so it ignores the parent-owned `isNegative`
        return (
            <TextInputForm
                root={{value, onInputChange, allowNegative: allowNegativeInput, decimals, maxLength, errorText}}
                editingRef={innerEditingRef}
                textInputProps={{
                    ref: setTextInputRef,
                    label,
                    accessibilityLabel: label,
                    prefixCharacter: visibleSymbol || prefixCharacter,
                    keyboardType: props.keyboardType,
                    style,
                    autoFocus: props.autoFocus,
                    autoGrowExtraSpace: props.autoGrowExtraSpace,
                    autoGrowMarginSide: props.autoGrowMarginSide,
                    disabled,
                    shouldUseDefaultLineHeightForPrefix,
                    onSubmitEditing,
                    onFocus: props.onFocus,
                    onBlur: props.onBlur,
                    testID: props.testID,
                }}
                isNegative={isNegative}
                clearNegative={clearNegative}
                shouldShowFlipButton={shouldShowFlipButton}
                shouldShowCurrencyButton={shouldShowCurrencyButton}
                leadingRightHandSideComponent={leadingRightHandSideComponent}
                currencyButtonText={currencyButtonLabel ?? currency}
                onCurrencyButtonPress={onCurrencyButtonPress ?? onSymbolButtonPress}
                currencyButtonAccessibilityLabel={currencyButtonAccessibilityLabel}
                shouldUseBorderlessButtons={shouldUseBorderlessButtons}
            />
        );
    }

    // A caller-owned sign never reaches the root, which holds the magnitude only; split amounts keep their sign inside the value
    const root: AdapterRootProps = {
        value: sign.rootValue,
        onInputChange,
        allowNegative: allowNegativeInput,
        decimals,
        maxLength,
        errorText,
    };

    const textInputProps: AdapterTextInputProps = {
        ref: setTextInputRef,
        testID: props.testID,
        accessibilityLabel: props.accessibilityLabel,
        style,
        containerStyle,
        touchableInputWrapperStyle: props.touchableInputWrapperStyle,
        prefixCharacter,
        prefixStyle: props.prefixStyle,
        prefixContainerStyle: props.prefixContainerStyle,
        shouldApplyPaddingToContainer,
        shouldUseDefaultLineHeightForPrefix,
        contentWidth: props.contentWidth,
        autoGrow,
        autoGrowExtraSpace: props.autoGrowExtraSpace,
        autoGrowMarginSide: props.autoGrowMarginSide,
        disableKeyboard,
        disabled,
        hideFocusedState,
        keyboardType: props.keyboardType,
        autoFocus: props.autoFocus,
        onSubmitEditing,
        submitBehavior: props.submitBehavior,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
    };

    if (!shouldWrapInputInContainer) {
        return (
            <InlineForm
                root={root}
                editingRef={innerEditingRef}
                textInputProps={textInputProps}
                textInputRef={textInputRef}
                label={label}
                symbol={visibleSymbol}
                scrollViewStyle={scrollViewStyle}
                shouldRefocusOnScrollViewClick={shouldRefocusOnScrollViewClick}
            />
        );
    }

    return (
        <FullScreenForm
            root={root}
            editingRef={innerEditingRef}
            textInputProps={textInputProps}
            onPress={props.onPress}
            symbol={visibleSymbol}
            symbolPosition={symbolPosition}
            symbolTextStyle={symbolTextStyle}
            shouldUseDynamicFontSize={shouldUseDynamicFontSize}
            // The legacy precedence lets onSymbolButtonPress win over onCurrencyButtonPress, and a symbol that is not
            // pressable is composed as no currency button at all
            currencyButtonText={isSymbolPressable ? (currencyButtonLabel ?? currency) : undefined}
            onCurrencyButtonPress={onSymbolButtonPress ?? onCurrencyButtonPress}
            currencyButtonAccessibilityLabel={currencyButtonAccessibilityLabel}
            sign={sign}
            footer={footer}
        />
    );
}

export default NumberWithSymbolForm;
export type {NumberWithSymbolFormProps, NumberWithSymbolFormRef};
