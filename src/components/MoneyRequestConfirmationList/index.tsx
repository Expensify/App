import {isScanRequest as isScanRequestUtil} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {MoneyRequestConfirmationListProps} from './types';

import DefaultConfirmationList from './variants/DefaultConfirmationList';
import PerDiemConfirmationList from './variants/PerDiemConfirmationList';
import ScanConfirmationList from './variants/ScanConfirmationList';
import TimeConfirmationList from './variants/TimeConfirmationList';

/**
 * Selects the confirmation list variant for the expense type being confirmed.
 *
 * The branches are keyed the same way, and in the same order, as the footer variants in
 * `MoneyRequestConfirmationListFooter` — on the request type and the action, since a type confirmed outside its
 * own flow confirms as a plain expense. Types that have no variant yet fall through to `DefaultConfirmationList`.
 */
function MoneyRequestConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {transaction, iouType = CONST.IOU.TYPE.SUBMIT, action = CONST.IOU.ACTION.CREATE, isPerDiemRequest = false, isTimeRequest = false} = props;

    // Invoice is checked before the request type, matching the footer, so an invoice never reaches a
    // request-type variant. It has no variant of its own yet.
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;

    // Per diem being moved off a track expense submits through RequestMoney rather than CreatePerDiemExpense,
    // and confirms as a plain expense.
    if (!isTypeInvoice && isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
        return <PerDiemConfirmationList {...props} />;
    }

    // Outside CREATE a time expense shows Merchant and hides the hours/rate fields, which is what the manual
    // confirmation renders anyway.
    if (!isTypeInvoice && isTimeRequest && action === CONST.IOU.ACTION.CREATE) {
        return <TimeConfirmationList {...props} />;
    }

    // The footer checks the distance variants before this one, but a transaction carries a single request type,
    // so a scan can never also be a distance request and the two branches cannot both match.
    if (!isTypeInvoice && isScanRequestUtil(transaction)) {
        return <ScanConfirmationList {...props} />;
    }

    return <DefaultConfirmationList {...props} />;
}

export default MoneyRequestConfirmationList;
