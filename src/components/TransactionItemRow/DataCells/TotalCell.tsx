import React, {useRef, useState} from 'react';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';
import {EditableCell, useInlineEditState} from '@components/TransactionItemRow/EditableCell';
import type {EditableProps} from '@components/TransactionItemRow/EditableCell';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {formatToParts} from '@libs/NumberFormatUtils';
import {parseFloatAnyLocale, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getTransactionDetails, isInvoiceReport, shouldEnableNegative} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isDeletedTransaction, isExpenseUnreported, isScanning} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

type TotalCellProps = TransactionDataCellProps & EditableProps<number>;
type TransactionItem = TransactionDataCellProps['transactionItem'];

function getTransactionItemIouType(transactionItem: TransactionItem) {
    if (isInvoiceReport(transactionItem.report)) {
        return CONST.IOU.TYPE.INVOICE;
    }

    const isSplitTransaction = transactionItem.comment?.source === CONST.IOU.TYPE.SPLIT || !!transactionItem.comment?.splits;
    return isSplitTransaction ? CONST.IOU.TYPE.SPLIT : CONST.IOU.TYPE.SUBMIT;
}

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

    const iouType = getTransactionItemIouType(transactionItem);
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isUnreportedExpense = isExpenseUnreported(transactionItem);
    const allowNegative = isUnreportedExpense || shouldEnableNegative(transactionItem.report, transactionItem.policy, iouType, transactionItem.participants);

    const absoluteAmount = Math.abs(amount ?? 0);
    const isOriginalAmountNegative = (amount ?? 0) < 0;
    const [isNegative, setIsNegative] = useState(isOriginalAmountNegative);

    const getNormalizedValue = (amountString: string, isAmountNegative: boolean) => {
        const parsedValue = parseFloatAnyLocale(amountString);
        if (Number.isNaN(parsedValue) || parsedValue < 0) {
            return undefined;
        }

        const normalizedValue = roundToTwoDecimalPlaces(parsedValue);
        const finalAmount = isAmountNegative ? -normalizedValue : normalizedValue;
        return convertToBackendAmount(finalAmount);
    };

    // localValue tracks the frontend-format amount string (e.g. "12.34") while editing
    const {isEditing, setLocalValue, startEditing, save, cancelEditing} = useInlineEditState(
        canEdit,
        convertToFrontendAmountAsString(absoluteAmount, getCurrencyDecimals(currency)),
        onSave
            ? (value) => {
                  const normalizedValue = getNormalizedValue(value, isNegative);
                  if (normalizedValue === undefined) {
                      return;
                  }
                  onSave(normalizedValue);
              }
            : undefined,
        (value, originalValue) => getNormalizedValue(value, isNegative) === getNormalizedValue(originalValue, isOriginalAmountNegative),
    );

    // Ref used to programmatically focus the input when edit mode starts
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
    };

    const handleStartEditing = () => {
        setIsNegative(isOriginalAmountNegative);
        startEditing();
    };

    const handleAmountChange = (amountString: string) => {
        setLocalValue(amountString);
    };

    const onFormatAmount = (amountAsInt: number, currencyParam?: string) => {
        const decimals = getCurrencyDecimals(currencyParam);
        return convertToFrontendAmountAsString(amountAsInt, decimals);
    };

    const toggleNegative = () => setIsNegative((prev) => !prev);

    const clearNegative = () => setIsNegative(false);

    const handleEscape = () => {
        cancelEditing();
        inputRef.current?.blur();
    };

    // Some currencies display with a space between symbol and amount (e.g., "CZK 100.00") in convertToDisplayString (in preview).
    // We detect this spacing and apply matching padding to the input to prevent visual flicker when entering edit mode.
    // See: https://github.com/Expensify/App/pull/83127#issuecomment-4240055145
    const hasSymbolSpaceInPreview = formatToParts(preferredLocale, 0, {
        style: 'currency',
        currency,
        minimumFractionDigits: getCurrencyDecimals(currency),
        maximumFractionDigits: CONST.DEFAULT_CURRENCY_DECIMALS,
    }).some((part) => part.type === 'literal' && part.value.trim() === '');

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
            onStartEditing={handleStartEditing}
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
                    allowFlippingAmount={!isSplitBill && allowNegative}
                    isNegative={isNegative}
                    toggleNegative={toggleNegative}
                    clearNegative={clearNegative}
                    // EditableCell is responsible for the cell's hover and focus styles (border, background).
                    // Suppress MoneyRequestAmountInput's own border and background to avoid visual conflicts.
                    containerStyle={[styles.editableCellInputStyle]}
                    inputStyle={[styles.textAlignRight, styles.pr0]}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                    scrollViewStyle={[styles.flexRow, styles.justifyContentEnd]}
                    symbolTextStyle={[styles.editableCellSymbolStyle, hasSymbolSpaceInPreview && styles.pr1]}
                    negativeSymbolStyle={styles.editableCellSymbolStyle}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default TotalCell;
