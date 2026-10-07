import {useNumericPressSelection, useSignedMagnitudeEditingController} from '@components/NumericEditingController';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import {useMouseActions} from '@hooks/useMouseContext';
import useThemeStyles from '@hooks/useThemeStyles';

import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {ForwardedRef, MouseEvent} from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type EditableTotalAmountInputProps = {
    /** Initial signed amount in the frontend format (e.g. "-12.34"), or an empty string for none. Read on mount only. */
    initialValue: string;

    /** Called with the signed amount in the frontend format after each edit. */
    onChange: (value: string) => void;

    /** Whether the user may flip the sign. A negative initial amount keeps its sign when flipping is not allowed. */
    allowNegative: boolean;

    /** Number of decimal places accepted for the currency. */
    decimals: number;

    /** Currency symbol rendered before the amount. */
    currencySymbol: string;

    /** Whether the display string puts a space between the symbol and the amount, mirrored here to avoid a shift on edit. */
    hasSymbolSpaceInPreview: boolean;

    /** Accessibility label of the input. */
    accessibilityLabel: string;

    /** Called when the input loses focus. */
    onBlur: () => void;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;
};

/**
 * Inline amount editor of the transaction table's total cell. It renders the sign, the currency symbol and the right-aligned
 * auto-growing input as separate texts, so a negative amount reads `-$12.34`, which an input prefix cannot produce.
 * Pressing the cell's empty area keeps the input focused, since the cell saves on blur.
 */
function EditableTotalAmountInput({
    initialValue,
    onChange,
    allowNegative,
    decimals,
    currencySymbol,
    hasSymbolSpaceInPreview,
    accessibilityLabel,
    onBlur,
    ref,
}: EditableTotalAmountInputProps) {
    const styles = useThemeStyles();
    const {numberFormat} = useLocalize();
    const {setMouseDown, setMouseUp} = useMouseActions();
    const inputRef = useRef<BaseTextInputRef | null>(null);

    // Without flipping, a negative amount keeps its sign: only the magnitude is edited and the sign is added back
    const hasFixedNegativeSign = !allowNegative && initialValue.startsWith('-');

    const controller = useSignedMagnitudeEditingController({
        value: hasFixedNegativeSign ? initialValue.slice(1) : initialValue,
        onInputChange: (value) => onChange(hasFixedNegativeSign ? `-${value}` : value),
        allowNegative,
        decimals,
    });

    const handlePress = useNumericPressSelection({inputRef, handleSelectionChange: controller.handleSelectionChange});

    // The row behind the cell is pressable, so presses on the input must not reach it
    const handleMouseDown = (event: MouseEvent<Element>) => {
        event.stopPropagation();
        setMouseDown();
    };

    const handleMouseUp = (event: MouseEvent<Element>) => {
        event.stopPropagation();
        setMouseUp();
    };

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd]}
            // The empty area left of the right-aligned amount is not clickable, it only keeps the input focused
            style={[styles.flexGrow0, styles.cursorAuto]}
            onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                inputRef.current?.focus();
            }}
        >
            {(hasFixedNegativeSign || controller.isNegative) && <Text style={[styles.iouAmountText, styles.editableCellSymbolStyle]}>-</Text>}
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                <Text style={[styles.iouAmountText, styles.lineHeightUndefined, styles.editableCellSymbolStyle, hasSymbolSpaceInPreview && styles.pr1]}>{currencySymbol}</Text>
            </View>
            <TextInput
                accessibilityLabel={accessibilityLabel}
                // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
                // See https://github.com/Expensify/App/issues/51868 for more information
                autoCapitalize="words"
                // On iPad, even if the soft keyboard is hidden, the keyboard suggestion is still shown.
                // Setting both autoCorrect and spellCheck to false will hide the suggestion.
                autoCorrect={false}
                autoGrow
                disableKeyboardShortcuts
                hideFocusedState
                inputMode={CONST.INPUT_MODE.DECIMAL}
                // EditableCell owns the cell's border and background, so the input draws neither
                inputStyle={[styles.textAlignRight, styles.pr0]}
                onBlur={onBlur}
                onChangeText={controller.setNumber}
                onKeyPress={controller.handleMagnitudeKeyPress}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onPress={handlePress}
                onSelectionChange={(event: TextInputSelectionChangeEvent) => controller.handleSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end)}
                placeholder={numberFormat(0)}
                ref={mergeRefs(inputRef, ref)}
                selection={controller.selection}
                shouldAllowFocusInLandscapeMode
                shouldApplyPaddingToContainer={false}
                shouldInterceptSwipe
                shouldUseFullInputHeight
                spellCheck={false}
                submitBehavior="submit"
                textInputContainerStyles={styles.editableCellInputStyle}
                touchableInputWrapperStyle={styles.editableCellInputStyle}
                value={controller.formattedNumber}
            />
        </ScrollView>
    );
}

export default EditableTotalAmountInput;
