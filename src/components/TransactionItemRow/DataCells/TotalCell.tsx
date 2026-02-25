import React, {useRef} from 'react';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import {EditableCell, useInlineEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {parseFloatAnyLocale, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getCurrency as getTransactionCurrency, isScanning} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

type TotalCellProps = TransactionDataCellProps & EditableProps<number>;

function TotalCell({shouldShowTooltip, transactionItem, isEditable, canEdit, onSave}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = getTransactionCurrency(transactionItem);

    const amount = getTransactionDetails(transactionItem)?.amount;
    let amountToDisplay = convertToDisplayString(amount, currency);
    if (isScanning(transactionItem)) {
        amountToDisplay = translate('iou.receiptStatusTitle');
    }

    const absoluteAmount = Math.abs(amount ?? 0);

    const handleAmountSave = (amountString: string) => {
        const parsedValue = parseFloatAnyLocale(amountString);
        if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
            const normalizedValue = roundToTwoDecimalPlaces(parsedValue);
            // Convert back to cents for the save callback
            onSave?.(Math.round(normalizedValue * 100));
        }
    };

    // localValue tracks the frontend-format amount string (e.g. "12.34") while editing
    const {isEditing, setLocalValue, startEditing, save} = useInlineEditState(convertToFrontendAmountAsString(absoluteAmount, currency), handleAmountSave);

    // Ref used to programmatically focus the input when edit mode starts
    const inputRef = useRef<BaseTextInputRef | null>(null);

    const focusOnMount = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
        ref?.focus();
    };

    const handleAmountChange = (amountString: string) => {
        setLocalValue(amountString);
    };

    const handleBlur = () => {
        save();
    };

    const displayContent = (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={amountToDisplay}
            style={[styles.optionDisplayName, styles.justifyContentCenter, styles.flexShrink1, styles.textAlignRight]}
        />
    );

    return (
        <EditableCell
            isEditable={isEditable}
            canEdit={canEdit && !isScanning(transactionItem)}
            isEditing={isEditing}
            onStartEditing={startEditing}
            editContent={
                <MoneyRequestAmountInput
                    ref={focusOnMount}
                    autoGrow={false}
                    amount={absoluteAmount}
                    currency={currency}
                    disableKeyboard={false}
                    isCurrencyPressable={false}
                    hideCurrencySymbol
                    hideFocusedState
                    shouldShowBigNumberPad={false}
                    shouldWrapInputInContainer={false}
                    shouldApplyPaddingToContainer={false}
                    onAmountChange={handleAmountChange}
                    onBlur={handleBlur}
                    // EditableCell is responsible for the cell's hover and focus styles (border, background).
                    // Suppress MoneyRequestAmountInput's own border and background to avoid visual conflicts.
                    containerStyle={[styles.editableCellInputStyle]}
                    inputStyle={[styles.textAlignRight]}
                    touchableInputWrapperStyle={[styles.editableCellInputStyle]}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default TotalCell;
