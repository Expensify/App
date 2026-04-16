import React, {useMemo, useRef} from 'react';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {formatToParts} from '@libs/NumberFormatUtils';
import {parseFloatAnyLocale, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isDeletedTransaction, isScanning} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

type TotalCellProps = TransactionDataCellProps & EditableProps<number>;

function TotalCell({shouldShowTooltip, transactionItem, canEdit, onSave}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const currency = getTransactionCurrency(transactionItem);

    const isDeleted = isDeletedTransaction(transactionItem);
    const amount = getTransactionDetails(transactionItem, undefined, undefined, isDeleted)?.amount;
    let amountToDisplay = convertToDisplayString(amount, currency);
    if (isScanning(transactionItem)) {
        amountToDisplay = translate('iou.receiptStatusTitle');
    }

    const absoluteAmount = Math.abs(amount ?? 0);

    const handleAmountSave = (amountString: string) => {
        const parsedValue = parseFloatAnyLocale(amountString);
        if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
            const normalizedValue = roundToTwoDecimalPlaces(parsedValue);
            onSave?.(convertToBackendAmount(normalizedValue));
        }
    };

    // localValue tracks the frontend-format amount string (e.g. "12.34") while editing
    const {isEditing, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(
        canEdit,
        convertToFrontendAmountAsString(absoluteAmount, getCurrencyDecimals(currency)),
        handleAmountSave,
    );

    // Ref used to programmatically focus the input when edit mode starts
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
    };

    const handleAmountChange = (amountString: string) => {
        setLocalValue(amountString);
    };

    const onFormatAmount = (amountAsInt: number, currencyParam?: string) => {
        const decimals = getCurrencyDecimals(currencyParam);
        return convertToFrontendAmountAsString(amountAsInt, decimals);
    };

    const handleEscape = () => {
        cancelEditing();
        inputRef.current?.blur();
    };

    // Some currencies display with a space between symbol and amount (e.g., "CZK 100.00") in convertToDisplayString (in preview).
    // We detect this spacing and apply matching padding to the input to prevent visual flicker when entering edit mode.
    // See: https://github.com/Expensify/App/pull/83127#issuecomment-4240055145
    const hasSymbolSpaceInPreview = useMemo(() => {
        const decimals = getCurrencyDecimals(currency);
        const parts = formatToParts(preferredLocale, 0, {
            style: 'currency',
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: CONST.DEFAULT_CURRENCY_DECIMALS,
        });

        return parts.some((part) => part.type === 'literal' && part.value.trim() === '');
    }, [preferredLocale, currency]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleEscape, {captureOnInputs: true, isActive: isEditing});

    const displayContent = (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={amountToDisplay}
            style={[styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink1, styles.textAlignRight]}
        />
    );

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                <MoneyRequestAmountInput
                    ref={focusOnMount}
                    amount={absoluteAmount}
                    currency={currency}
                    disableKeyboard={false}
                    isCurrencyPressable={false}
                    hideFocusedState
                    shouldShowBigNumberPad={false}
                    shouldWrapInputInContainer={false}
                    shouldApplyPaddingToContainer={false}
                    shouldRefocusOnScrollViewClick
                    onAmountChange={handleAmountChange}
                    onFormatAmount={onFormatAmount}
                    onBlur={save}
                    // EditableCell is responsible for the cell's hover and focus styles (border, background).
                    // Suppress MoneyRequestAmountInput's own border and background to avoid visual conflicts.
                    containerStyle={[styles.editableCellInputStyle]}
                    inputStyle={[styles.textAlignRight, styles.pr0]}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                    scrollViewStyle={[styles.flexRow, styles.justifyContentEnd]}
                    symbolTextStyle={[styles.editableCellSymbolStyle, hasSymbolSpaceInPreview && styles.pr1]}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default TotalCell;
