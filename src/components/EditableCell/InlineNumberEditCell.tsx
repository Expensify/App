/**
 * Generic inline number editing cell for tables. Same role as InlineTextEditCell, but the
 * editor is NumberWithSymbolForm so currency amounts and rates share focus, Escape, and save
 * wiring instead of copying it per table.
 *
 * Callers convert to a frontend numeric string before passing `value`. Invalid values are
 * handled by onSave, which no-ops on rejection. The cell then reverts to the original value.
 */
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import React, {useRef} from 'react';

import type {EditableProps} from './types';

import EditableCell from './EditableCell';
import useInlineEditState from './useInlineEditState';

type InlineNumberEditCellProps = {
    /** Frontend numeric string used as the initial edit buffer. Conversion stays at the call site. */
    value: string;

    currency: string;

    /** Formatted display string (includes the currency symbol). Differs from `value`, which is the editable number only. */
    displayText: string;

    accessibilityLabel: string;

    /** NumberWithSymbolForm decimal places. Omit to use its default of 0. */
    decimals?: number;

    /** Lets the user type a leading minus. */
    allowNegativeInput?: boolean;

    /**
     * Defaults to right, with the pencil on the left so it does not cover the number.
     * Pass left to keep the pencil on the right.
     */
    textAlign?: 'left' | 'right';

    /** Defaults to Number() comparison so "1.00" and "1" are treated as unchanged. */
    isEqual?: (newValue: string, originalValue: string) => boolean;
} & EditableProps<string>;

const areNumericValuesEqual = (newValue: string, originalValue: string) => Number(newValue) === Number(originalValue);

function InlineNumberEditCell({
    value,
    currency,
    displayText,
    accessibilityLabel,
    decimals,
    allowNegativeInput = false,
    textAlign = 'right',
    isEqual = areNumericValuesEqual,
    canEdit,
    onSave,
}: InlineNumberEditCellProps) {
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const isRightAligned = textAlign === 'right';

    const {isEditing, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(canEdit, value, onSave, isEqual);

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
    };

    const handleEscape = () => {
        cancelEditing();
        inputRef.current?.blur();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleEscape, {captureOnInputs: true, isActive: isEditing});

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editIconPosition={isRightAligned ? 'left' : 'right'}
            editContent={
                <NumberWithSymbolForm
                    ref={focusOnMount}
                    value={value}
                    decimals={decimals}
                    currency={currency}
                    symbol={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
                    symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                    isSymbolPressable={false}
                    allowNegativeInput={allowNegativeInput}
                    disableKeyboard={false}
                    shouldShowBigNumberPad={false}
                    shouldWrapInputInContainer={false}
                    shouldApplyPaddingToContainer={false}
                    shouldRefocusOnScrollViewClick
                    hideFocusedState
                    onInputChange={setLocalValue}
                    onBlur={save}
                    onSubmitEditing={save}
                    accessibilityLabel={accessibilityLabel}
                    style={[styles.lh16, styles.optionDisplayName, styles.pr0, isRightAligned && styles.textAlignRight]}
                    containerStyle={[styles.editableCellInputStyle]}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                    scrollViewStyle={[styles.flexRow, styles.alignItemsCenter, isRightAligned && styles.justifyContentEnd]}
                    symbolTextStyle={styles.editableCellSymbolStyle}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip
                numberOfLines={1}
                text={displayText}
                style={[styles.lh16, styles.optionDisplayName, styles.pre, styles.flexShrink1, isRightAligned && styles.textAlignRight]}
            />
        </EditableCell>
    );
}

export default InlineNumberEditCell;
