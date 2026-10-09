import {EditableCell, useInlineEditState} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString, hasSpaceBetweenSymbolAndAmount} from '@libs/CurrencyUtils';
import {parseFloatAnyLocale, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getTransactionDisplayAmount, isInvoiceReport, isSettled, shouldEnableNegative} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isExpenseUnreported, isFailedScanAmountPlaceholder, isScanning} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';

import React, {useRef, useState} from 'react';

import type TransactionDataCellProps from './TransactionDataCellProps';

type TotalCellProps = TransactionDataCellProps &
    EditableProps<number> & {
        /** Report passed explicitly (used in IOU report view where transactionItem.report may be undefined) */
        report?: Report;

        /** Policy passed explicitly (used in IOU report view where transactionItem.policy may be undefined) */
        policy?: Policy;
    };
type TransactionItem = TransactionDataCellProps['transactionItem'];

function getTransactionItemIouType(transactionItem: TransactionItem) {
    if (isInvoiceReport(transactionItem.report)) {
        return CONST.IOU.TYPE.INVOICE;
    }

    const isSplitTransaction = transactionItem.comment?.source === CONST.IOU.TYPE.SPLIT || !!transactionItem.comment?.splits;
    return isSplitTransaction ? CONST.IOU.TYPE.SPLIT : CONST.IOU.TYPE.SUBMIT;
}

function TotalCell({shouldShowTooltip, transactionItem, canEdit, onSave, report, policy}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const currency = getTransactionCurrency(transactionItem);

    const effectiveReport = report ?? transactionItem.report;
    const effectivePolicy = policy ?? transactionItem.policy;
    const amount = getTransactionDisplayAmount(transactionItem, effectiveReport, effectivePolicy);
    const hasFailedScanAmountPlaceholder = isFailedScanAmountPlaceholder(transactionItem, isSettled(effectiveReport));
    let amountToDisplay = convertToDisplayString(amount, currency);
    if (isScanning(transactionItem)) {
        amountToDisplay = translate('iou.receiptStatusTitle');
    } else if (hasFailedScanAmountPlaceholder) {
        amountToDisplay = '';
    }

    const iouType = getTransactionItemIouType({...transactionItem, report: effectiveReport});
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isUnreportedExpense = isExpenseUnreported(transactionItem);
    const allowNegative = isUnreportedExpense || shouldEnableNegative(effectiveReport, effectivePolicy, iouType, transactionItem.participants);

    const absoluteAmount = Math.abs(amount ?? 0);
    const isOriginalAmountNegative = (amount ?? 0) < 0;
    const [isNegative, setIsNegative] = useState(isOriginalAmountNegative);
    // Tracks whether the user actually typed in this edit session, so that merely opening and
    // closing the cell without input isn't mistaken for an explicit confirmation of the amount.
    const hasUserTypedRef = useRef(false);

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
        // A failed-scan placeholder amount that the user actually typed into is treated as changed so that
        // explicitly re-entering 0 still submits and clears the scan-failure error, mirroring submitEditAmount in
        // IOUAmountSubmission.ts. Merely opening and blurring the cell without typing is left as a no-op.
        (value, originalValue) =>
            !(hasFailedScanAmountPlaceholder && hasUserTypedRef.current) && getNormalizedValue(value, isNegative) === getNormalizedValue(originalValue, isOriginalAmountNegative),
    );

    // Ref used to programmatically focus the input when edit mode starts
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
    };

    const handleStartEditing = () => {
        setIsNegative(isOriginalAmountNegative);
        hasUserTypedRef.current = false;
        startEditing();
    };

    const handleAmountChange = (amountString: string) => {
        hasUserTypedRef.current = true;
        setLocalValue(amountString);
    };

    const onFormatAmount = (amountAsInt: number, currencyParam?: string) => {
        // Seed the edit input as empty for a failed-scan placeholder, matching the blanked display above and the
        // same falsy-amount-is-blank convention MoneyRequestAmountForm already uses for an unset amount.
        if (hasFailedScanAmountPlaceholder) {
            return '';
        }
        const decimals = getCurrencyDecimals(currencyParam);
        return convertToFrontendAmountAsString(amountAsInt, decimals);
    };

    const toggleNegative = () => setIsNegative((prev) => !prev);

    const clearNegative = () => setIsNegative(false);

    const handleEscape = () => {
        cancelEditing();
        inputRef.current?.blur();
    };

    const hasSymbolSpaceInPreview = hasSpaceBetweenSymbolAndAmount(preferredLocale, currency);

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
            editIconPosition="left"
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
