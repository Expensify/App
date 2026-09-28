import usePrevious from '@hooks/usePrevious';

import {setMoneyRequestTaxAmount, setMoneyRequestTaxRateValues} from '@libs/actions/IOU/MoneyRequest';

import type {Policy, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

import type useDistanceRequestState from './hooks/useDistanceRequestState';

import useTaxAmount from './hooks/useTaxAmount';

type TaxControllerProps = {
    /** ID of the transaction being confirmed */
    transactionID: string | undefined;

    /** Policy ID of the resolved policy. Re-seeds the tax rate on a policy switch even when the default code stays the same. */
    policyID: string | undefined;

    /** Whether the confirmation is read-only */
    isReadOnly: boolean;

    /** Whether the tax fields are shown for this expense */
    shouldShowTax: boolean;

    /** Whether the expense is being moved off a track expense */
    isMovingTransactionFromTrackExpense: boolean;

    /** Transaction being confirmed */
    transaction: OnyxEntry<Transaction>;

    /** The resolved policy */
    policy: OnyxEntry<Policy>;

    /** The policy a track expense is being moved to */
    policyForMovingExpenses: OnyxEntry<Policy>;

    /** The selected distance rate ID */
    customUnitRateID: string;

    /**
     * Only the distance surface passes this. `useTaxAmount` computes the taxable amount from the route rather than
     * from the stored transaction amount inside distance branches.
     */
    distanceState?: Pick<ReturnType<typeof useDistanceRequestState>, 'distance' | 'unit'>;
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
    transaction,
    policy,
    policyForMovingExpenses,
    customUnitRateID,
    distanceState,
}: TaxControllerProps) {
    const transactionTaxAmount = transaction?.taxAmount;

    const previousTransactionCurrency = usePrevious(transaction?.currency);

    const {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits} = useTaxAmount({
        transaction,
        policy,
        policyForMovingExpenses,
        isDistanceRequest: !!distanceState,
        isMovingTransactionFromTrackExpense,
        customUnitRateID,
        distance: distanceState?.distance ?? 0,
        distanceUnit: distanceState?.unit,
        previousTransactionCurrency,
    });

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
