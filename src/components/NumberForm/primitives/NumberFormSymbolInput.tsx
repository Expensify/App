import FormHelpMessage from '@components/FormHelpMessage';
import {NumberFormActionsContext, NumberFormStateContext, useNumberFormContext} from '@components/NumberForm/context';
import type {NumberFormActionsContextValue, NumberFormStateContextValue, SetValueOptions} from '@components/NumberForm/context/types';
import useNumberFormInputLogic from '@components/NumberForm/hooks/useNumberFormInputLogic';
import type {NumberFormRef, NumberFormSymbolInputProps} from '@components/NumberForm/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextInputWithSymbol from '@components/TextInputWithSymbol';

import mergeRefs from '@libs/mergeRefs';

import {useImperativeHandle, useLayoutEffect, useRef} from 'react';

const getMagnitude = (value: string) => (value.startsWith('-') ? value.slice(1) : value);

const getSignedValue = (value: string, isNegative: boolean) => {
    if (value.startsWith('-')) {
        return value;
    }

    if (isNegative) {
        return `-${value}`;
    }

    return value;
};

type NumberFormSymbolInputContentProps = NumberFormSymbolInputProps & {
    isNegative: boolean;
    clearNegative: () => void;
};

function NumberFormSymbolInputContent({isNegative, clearNegative, ...props}: NumberFormSymbolInputContentProps) {
    const {
        symbol = '',
        hideSymbol = false,
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
        maxLength,
        ...rest
    } = props;
    const {
        errorText,
        formattedNumber,
        handleBlur,
        handleInputRef: handleInputRefFromLogic,
        handleKeyPress: inputHandleKeyPress,
        handleSelectionChange,
        inputPosition,
        numberFormat,
        selectionForRender,
        setNumber,
    } = useNumberFormInputLogic({...props, maxLength});
    const textInput = useRef<BaseTextInputRef | null>(null);

    const handleKeyPress = (event: Parameters<typeof inputHandleKeyPress>[0]) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (!textInput.current?.value && key === 'backspace' && isNegative) {
            clearNegative();
        }

        inputHandleKeyPress(event);
    };

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
                isNegative={isNegative}
                isSymbolPressable={isSymbolPressable}
                keyboardType={keyboardType}
                negativeSymbolStyle={negativeSymbolStyle}
                onBlur={handleBlur}
                onChangeAmount={setNumber}
                onFocus={rest.onFocus}
                onKeyPress={handleKeyPress}
                onPress={rest.onPress}
                onSelectionChange={handleSelectionChange}
                onSymbolButtonPress={onSymbolButtonPress}
                placeholder={numberFormat(0)}
                ref={mergeRefs(textInput, handleInputRefFromLogic)}
                selection={selectionForRender}
                shouldAllowFocusInLandscapeMode={rest.shouldAllowFocusInLandscapeMode}
                style={style}
                symbol={symbol}
                symbolPosition={inputPosition}
                symbolTextStyle={symbolTextStyle}
                toggleNegative={undefined}
            />
            {!!errorText && <FormHelpMessage message={errorText} />}
        </>
    );
}

function NumberFormSymbolInput(props: NumberFormSymbolInputProps) {
    const numberFormContext = useNumberFormContext();
    const {allowNegative, errorText, externalValue, inputRef, numberFormRef, onBlur, onSubmitEditing, setValue: contextSetValue, value} = numberFormContext;
    const canonicalValueRef = useRef(value);
    const numberFormInputRef = useRef<NumberFormRef | null>(null);

    // NumberForm.SymbolInput owns the separate-minus presentation. The root value remains the canonical signed value,
    // while the shared input logic receives only the magnitude it renders.
    useLayoutEffect(() => {
        canonicalValueRef.current = value;
    }, [value]);

    const isNegative = value.startsWith('-');
    const displayValue = getMagnitude(value);

    const setValue = (nextValue: string, options?: SetValueOptions) => {
        const previousValue = canonicalValueRef.current;
        const nextCanonicalValue = getSignedValue(nextValue, previousValue.startsWith('-'));

        canonicalValueRef.current = nextCanonicalValue;
        const previousCanonicalValue = contextSetValue(nextCanonicalValue, options);
        return getMagnitude(previousCanonicalValue);
    };

    const clearNegative = () => {
        if (!canonicalValueRef.current.startsWith('-')) {
            return;
        }

        canonicalValueRef.current = '';
        contextSetValue('');
    };

    useImperativeHandle(numberFormRef, () => ({
        clearSelection: () => numberFormInputRef.current?.clearSelection(),
        getNumber: () => canonicalValueRef.current,
        updateNumber: (newNumber: string) => {
            const nextCanonicalValue = newNumber;
            canonicalValueRef.current = nextCanonicalValue;
            numberFormInputRef.current?.updateNumber(getMagnitude(nextCanonicalValue));
        },
    }));

    const stateContextValue: NumberFormStateContextValue = {
        value: displayValue,
        externalValue: getMagnitude(externalValue),
        allowNegative,
        errorText,
    };

    const actionsContextValue: NumberFormActionsContextValue = {
        onBlur,
        onSubmitEditing,
        inputRef,
        numberFormRef: numberFormInputRef,
        setValue,
    };

    return (
        <NumberFormStateContext.Provider value={stateContextValue}>
            {/* The existing NumberForm actions context intentionally carries the ref and action callbacks together. */}
            {/* eslint-disable-next-line rulesdir/context-provider-split-values */}
            <NumberFormActionsContext.Provider value={actionsContextValue}>
                <NumberFormSymbolInputContent
                    {...props}
                    clearNegative={clearNegative}
                    isNegative={isNegative}
                />
            </NumberFormActionsContext.Provider>
        </NumberFormStateContext.Provider>
    );
}

export default NumberFormSymbolInput;
