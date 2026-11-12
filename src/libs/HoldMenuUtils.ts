import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getNonHeldAndFullAmount, hasOnlyHeldExpenses} from './ReportUtils';

type HoldMenuAmounts = {
    nonHeldAmount: string | undefined;
    fullAmount: string;
    hasNonHeldExpenses: boolean;
    transactionCount: number;
};

/** Builds the amount props the hold menu shows for a report: the non-held and full amounts, and the transaction count */
function getHoldMenuAmounts(
    report: OnyxEntry<Report>,
    shouldShowPayButton: boolean,
    transactions: Transaction[],
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
): HoldMenuAmounts {
    const hasNonHeldExpenses = !hasOnlyHeldExpenses(transactions);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(report, shouldShowPayButton, transactions, convertToDisplayString);
    return {
        nonHeldAmount: hasNonHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined,
        fullAmount,
        hasNonHeldExpenses,
        transactionCount: transactions.length,
    };
}

export default getHoldMenuAmounts;
