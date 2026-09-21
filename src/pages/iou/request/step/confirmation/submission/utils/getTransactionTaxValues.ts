import {isTaxTrackingEnabled, resolveCurrentTaxCode} from '@libs/PolicyUtils';
import {getDefaultTaxCode, getTaxValue} from '@libs/TransactionUtils';

import type Policy from '@src/types/onyx/Policy';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

type TransactionTaxValues = {
    transactionTaxCode: string;
    transactionTaxAmount: number;
    transactionTaxValue: string;
};

type GetTransactionTaxValuesParams = {
    transaction: OnyxEntry<Transaction>;
    policy: OnyxEntry<Policy>;
    isPolicyExpenseChat: boolean;
    isUnreported: boolean;
    isTrackExpense: boolean;
    isSelfDMDestination: boolean;
    isDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
};

function getTransactionTaxValues({
    transaction,
    policy,
    isPolicyExpenseChat,
    isUnreported,
    isTrackExpense,
    isSelfDMDestination,
    isDistanceRequest,
    isPerDiemRequest,
    isTimeRequest,
}: GetTransactionTaxValuesParams): TransactionTaxValues {
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const taxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxCode = isTaxTrackingEnabled(isPolicyExpenseChat || isUnreported || isTrackExpense || isSelfDMDestination, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest)
        ? resolveCurrentTaxCode(policy, taxCode)
        : '';

    return {
        transactionTaxCode,
        transactionTaxAmount: transaction?.taxAmount ?? 0,
        transactionTaxValue: transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '',
    };
}

export default getTransactionTaxValues;
export type {TransactionTaxValues};
