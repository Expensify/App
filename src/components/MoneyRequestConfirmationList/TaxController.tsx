import {setMoneyRequestTaxAmount, setMoneyRequestTaxRateValues} from '@libs/actions/IOU/MoneyRequest';

import {useEffect} from 'react';

import {useConfirmationData} from './ConfirmationDataContext';

/**
 * Side-effect-only component that syncs tax rate defaults
 * and tax amount when the transaction or policy changes.
 *
 * Mounted only by the variants whose expense type can show a tax field.
 */
function TaxController() {
    const {
        transactionID,
        policyID,
        isReadOnly,
        shouldShowTax,
        isMovingTransactionFromTrackExpense,
        transaction,
        tax: {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits},
    } = useConfirmationData();
    const transactionTaxAmount = transaction?.taxAmount;

    useEffect(() => {
        if (!transactionID || isReadOnly || !shouldShowTax || isMovingTransactionFromTrackExpense) {
            return;
        }

        // Keep the user's current selection when it's still valid for the active policy.
        if (shouldKeepCurrentTaxSelection) {
            return;
        }

        setMoneyRequestTaxRateValues(transactionID, {
            taxCode: defaultTaxCode,
            taxValue: defaultTaxValue,
            taxAmount: transactionTaxAmount ?? null,
        });
        // trigger this useEffect also when policyID changes - the defaultTaxCode may stay the same
    }, [defaultTaxCode, defaultTaxValue, isMovingTransactionFromTrackExpense, isReadOnly, transactionID, policyID, shouldShowTax, shouldKeepCurrentTaxSelection, transactionTaxAmount]);

    useEffect(() => {
        if (!transactionID || isReadOnly || !shouldShowTax || isMovingTransactionFromTrackExpense) {
            return;
        }
        setMoneyRequestTaxAmount(transactionID, taxAmountInSmallestCurrencyUnits);
    }, [transactionID, taxAmountInSmallestCurrencyUnits, isReadOnly, shouldShowTax, isMovingTransactionFromTrackExpense]);

    return null;
}

TaxController.displayName = 'TaxController';

export default TaxController;
