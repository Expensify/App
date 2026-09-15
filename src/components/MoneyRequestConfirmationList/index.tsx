import {isDistanceRequest as isDistanceRequestUtil, isScanRequest as isScanRequestUtil} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {MoneyRequestConfirmationListProps} from './types';

import DefaultConfirmationList from './variants/DefaultConfirmationList';
import InvoiceConfirmationList from './variants/InvoiceConfirmationList';
import ManualConfirmationList from './variants/ManualConfirmationList';
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

    // Invoice is keyed on `iouType` rather than the request type, and is checked first. That is safe because an
    // invoice can never also be a distance or scan request, and it keeps every branch below free of an invoice
    // guard.
    if (iouType === CONST.IOU.TYPE.INVOICE) {
        return <InvoiceConfirmationList {...props} />;
    }

    // Per diem being moved off a track expense submits through RequestMoney rather than CreatePerDiemExpense,
    // and confirms as a plain expense.
    if (isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
        return <PerDiemConfirmationList {...props} />;
    }

    // Outside CREATE a time expense shows Merchant and hides the hours/rate fields, which is what the manual
    // confirmation renders anyway.
    if (isTimeRequest && action === CONST.IOU.ACTION.CREATE) {
        return <TimeConfirmationList {...props} />;
    }

    // The footer checks the distance variants before this one, but a transaction carries a single request type,
    // so a scan can never also be a distance request and the two branches cannot both match.
    if (isScanRequestUtil(transaction)) {
        return <ScanConfirmationList {...props} />;
    }

    // Manual is the residual rather than a fallback: it also serves pay, per diem being moved off a track
    // expense, and a time expense outside CREATE, all of which confirm as a plain expense. Distance is excluded
    // explicitly because its three variants have not been extracted yet.
    if (!isDistanceRequestUtil(transaction)) {
        return <ManualConfirmationList {...props} />;
    }

    // Distance only.
    return <DefaultConfirmationList {...props} />;
}

export default MoneyRequestConfirmationList;
