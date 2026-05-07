import {useEffect} from 'react';
import {setMoneyRequestTaxAmount, setMoneyRequestTaxRateValues} from '@libs/actions/IOU';

type TaxControllerProps = {
    transactionID: string | undefined;
    policyID: string | undefined;
    isReadOnly: boolean;
    shouldShowTax: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    defaultTaxCode: string;
    defaultTaxValue: string | null;
    shouldKeepCurrentTaxSelection: boolean;
    taxAmountInSmallestCurrencyUnits: number;
    transactionTaxAmount: number | undefined;
};

/**
 * Side-effect-only component that syncs tax rate defaults
 * and tax amount when the transaction or policy changes.
 */
function TaxController({
    transactionID,
    policyID,
    isReadOnly,
    shouldShowTax,
    isMovingTransactionFromTrackExpense,
    defaultTaxCode,
    defaultTaxValue,
    shouldKeepCurrentTaxSelection,
    taxAmountInSmallestCurrencyUnits,
    transactionTaxAmount,
}: TaxControllerProps) {
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
