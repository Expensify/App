import React, {useCallback, useEffect, useRef} from 'react';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {parseFloatAnyLocale, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isScanning} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

type TotalCellProps = TransactionDataCellProps & {
    canEdit?: boolean;
    onSave?: (amount: number) => void;
};

function TotalCell({shouldShowTooltip, transactionItem, canEdit, onSave}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = getTransactionCurrency(transactionItem);

    const amount = getTransactionDetails(transactionItem)?.amount;
    let amountToDisplay = convertToDisplayString(amount, currency);
    if (isScanning(transactionItem)) {
        amountToDisplay = translate('iou.receiptStatusTitle');
    }

    const absoluteAmount = Math.abs(amount ?? 0);

    const handleAmountSave = useCallback(
        (amountString: string) => {
            const parsedValue = parseFloatAnyLocale(amountString);
            if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
                const normalizedValue = roundToTwoDecimalPlaces(parsedValue);
                // Convert back to cents for the save callback
                onSave?.(Math.round(normalizedValue * 100));
            }
        },
        [onSave],
    );

    // localValue tracks the frontend-format amount string (e.g. "12.34") while editing
    const {isEditing, setLocalValue, startEditing, save} = useInlineEditState(convertToFrontendAmountAsString(absoluteAmount, currency), handleAmountSave);

    // Ref used to programmatically focus the input when edit mode starts
    const inputRef = useRef<BaseTextInputRef | null>(null);

    useEffect(() => {
        if (!isEditing) {
            return;
        }
        inputRef.current?.focus();
    }, [isEditing]);

    const handleAmountChange = useCallback(
        (amountString: string) => {
            setLocalValue(amountString);
        },
        [setLocalValue],
    );

    const handleBlur = useCallback(() => {
        save();
    }, [save]);

    const displayContent = (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={amountToDisplay}
            style={[styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink0]}
        />
    );

    if (!canEdit || isScanning(transactionItem)) {
        return displayContent;
    }

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                // MoneyRequestAmountInput handles locale-aware formatting, currency display,
                // and validates numeric input — preferred over a raw TextInput for amounts.
                // disableKeyboard={false} uses the native keyboard (no big number pad) on desktop.
                <MoneyRequestAmountInput
                    ref={inputRef}
                    autoGrow={false}
                    amount={absoluteAmount}
                    currency={currency}
                    disableKeyboard={false}
                    isCurrencyPressable={false}
                    hideCurrencySymbol
                    hideFocusedState
                    formatAmountOnBlur
                    shouldShowBigNumberPad={false}
                    shouldWrapInputInContainer={false}
                    onAmountChange={handleAmountChange}
                    onBlur={handleBlur}
                    inputStyle={[styles.textAlignRight]}
                    touchableInputWrapperStyle={[styles.ph2, {height: 32}]}
                    containerStyle={[styles.flex1]}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default TotalCell;
