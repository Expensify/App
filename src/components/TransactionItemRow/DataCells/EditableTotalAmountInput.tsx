import {NumericFlipButton} from '@components/NumericButtons';
import {useDetachedSignEditingController, useNumericPressSelection} from '@components/NumericEditingController';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import {useMouseActions} from '@hooks/useMouseContext';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocalizedCurrencySymbol, hasSpaceBetweenSymbolAndAmount} from '@libs/CurrencyUtils';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';

import type {ForwardedRef, MouseEvent} from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';

import {useEffect, useEffectEvent, useRef, useState} from 'react';

const canUseTouchScreen = canUseTouchScreenUtil();

type EditableTotalAmountInputProps = {
    /** Initial signed amount in the frontend format (e.g. "-12.34"), or an empty string for none. Followed only while there are no unsaved edits. */
    initialValue: string;

    /** Called with the signed amount in the frontend format after each edit. */
    onChange: (value: string) => void;

    /** Whether the edit state holds an edit from this input that differs from the amount it opened with. */
    hasUnsavedEdits: boolean;

    /** Whether the user may flip the sign. A negative initial amount keeps its sign when flipping is not allowed. Followed only while there are no unsaved edits. */
    allowNegative: boolean;

    /** Number of decimal places accepted for the currency. */
    decimals: number;

    /** Currency code of the amount being edited. */
    currency: string;

    /** Accessibility label of the input. */
    accessibilityLabel: string;

    /** Called when the input loses focus. */
    onBlur: () => void;

    /** Called when the input is submitted (e.g. Enter is pressed). */
    onSubmitEditing?: () => void;

    /** Reference to the underlying text input. */
    ref?: ForwardedRef<BaseTextInputRef>;
};

function computeSignState(initialValue: string, allowNegative: boolean) {
    // Without flipping, a negative amount keeps its sign: only the magnitude is edited and the sign is added back
    const isSignFixed = !allowNegative && initialValue.startsWith('-');
    return {canFlipSign: allowNegative, hasFixedNegativeSign: isSignFixed, seedValue: isSignFixed ? initialValue.slice(1) : initialValue};
}

/**
 * Inline amount editor of the transaction table's total cell. It renders the sign, the currency symbol and the right-aligned
 * auto-growing input as separate texts, so a negative amount reads `-$12.34`, which an input prefix cannot produce.
 * Pressing the cell's empty area keeps the input focused, since the cell saves on blur.
 * The input is the only shrinkable part of the row, so a long amount scrolls inside the input while the sign and currency symbol stay visible.
 */
function EditableTotalAmountInput({
    initialValue,
    onChange,
    hasUnsavedEdits,
    allowNegative,
    decimals,
    currency,
    accessibilityLabel,
    onBlur,
    onSubmitEditing,
    ref,
}: EditableTotalAmountInputProps) {
    const styles = useThemeStyles();
    const {numberFormat, preferredLocale} = useLocalize();
    const {setMouseDown, setMouseUp} = useMouseActions();
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const currencySymbol = getLocalizedCurrencySymbol(preferredLocale, currency) ?? '';
    const hasSymbolSpaceInPreview = hasSpaceBetweenSymbolAndAmount(preferredLocale, currency);

    // The controller keeps editing the value it was seeded with, so the sign handling is seeded together with it.
    // An unsaved edit keeps that seed, otherwise an update arriving mid-edit (e.g. via Pusher) would re-add or drop a sign around the edited magnitude.
    // Without one, the edit state has already taken the update over, so the input is reseeded to match what blur would save.
    const [seed, setSeed] = useState({initialValue, allowNegative});
    if (!hasUnsavedEdits && (seed.initialValue !== initialValue || seed.allowNegative !== allowNegative)) {
        setSeed({initialValue, allowNegative});
    }
    const {canFlipSign, hasFixedNegativeSign, seedValue} = computeSignState(seed.initialValue, seed.allowNegative);

    const controller = useDetachedSignEditingController({
        value: seedValue,
        onInputChange: (value) => onChange(hasFixedNegativeSign ? `-${value}` : value),
        allowNegative: canFlipSign,
        decimals,
    });

    // The controller ignores later values it is given, so a new seed is pushed into it
    const syncSeedValue = useEffectEvent(() => {
        if (controller.getNumber() === seedValue) {
            return;
        }
        controller.updateNumber(seedValue);
    });

    useEffect(() => {
        syncSeedValue();
    }, [seedValue]);

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

    const isNegative = hasFixedNegativeSign || controller.isNegative;

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}
            // The empty area left of the right-aligned amount is not clickable, it only keeps the input focused
            style={[styles.flexGrow0, styles.cursorAuto]}
            onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                inputRef.current?.focus();
            }}
        >
            {isNegative && (
                <Text
                    aria-hidden
                    style={[styles.editableCellSymbolStyle, styles.flexShrink0]}
                >
                    -
                </Text>
            )}
            <Text
                aria-hidden
                style={[styles.editableCellSymbolStyle, styles.flexShrink0, hasSymbolSpaceInPreview && styles.pr1]}
            >
                {currencySymbol}
            </Text>
            <TextInput
                // Screen readers speak U+2212 as "minus"
                accessibilityLabel={isNegative ? `\u2212${accessibilityLabel}` : accessibilityLabel}
                // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
                // See https://github.com/Expensify/App/issues/51868 for more information
                autoCapitalize="words"
                // On iPad, even if the soft keyboard is hidden, the keyboard suggestion is still shown.
                // Setting both autoCorrect and spellCheck to false will hide the suggestion.
                autoCorrect={false}
                autoGrow
                containerStyles={[styles.flexShrink1, styles.mnw0]}
                disableKeyboardShortcuts
                hideFocusedState
                inputMode={CONST.INPUT_MODE.DECIMAL}
                // EditableCell owns the cell's border and background, so the input draws neither
                inputStyle={[styles.textAlignRight, styles.pr0]}
                onBlur={onBlur}
                onSubmitEditing={onSubmitEditing}
                onChangeText={controller.setNumber}
                onKeyPress={controller.handleKeyPress}
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
                submitBehavior="blurAndSubmit"
                textInputContainerStyles={[styles.editableCellInputStyle, styles.mw100]}
                touchableInputWrapperStyle={styles.editableCellInputStyle}
                value={controller.formattedNumber}
            />
            {/* Soft decimal keyboards have no minus key, so touch devices flip the sign with a compact icon button */}
            {canFlipSign && canUseTouchScreen && (
                <NumericFlipButton
                    onPress={controller.toggleSign}
                    shouldShowLabel={false}
                    style={[styles.ml1, styles.flexShrink0]}
                />
            )}
        </ScrollView>
    );
}

export default EditableTotalAmountInput;
