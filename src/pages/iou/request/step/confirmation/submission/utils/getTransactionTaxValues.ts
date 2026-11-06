import {isTaxTrackingEnabled, resolveCurrentTaxCode} from '@libs/PolicyUtils';
import {getDefaultTaxCode, getRequestType, getTaxValue, isDistanceExpenseType, isExpenseUnreported} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
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
    iouType: IOUType;
    isPolicyExpenseChat: boolean;
    isSelfDMDestination: boolean;
};

function getTransactionTaxValues({transaction, policy, iouType, isPolicyExpenseChat, isSelfDMDestination}: GetTransactionTaxValuesParams): TransactionTaxValues {
    const requestType = getRequestType(transaction);
    const isTaxApplicable = isPolicyExpenseChat || isExpenseUnreported(transaction) || iouType === CONST.IOU.TYPE.TRACK || isSelfDMDestination;
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const taxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxCode = isTaxTrackingEnabled(
        isTaxApplicable,
        policy,
        isDistanceExpenseType(requestType),
        requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM,
        requestType === CONST.IOU.REQUEST_TYPE.TIME,
    )
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
