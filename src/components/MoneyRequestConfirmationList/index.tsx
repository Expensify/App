import {isDistanceRequest as isDistanceRequestUtil, isScanRequest as isScanRequestUtil} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {MoneyRequestConfirmationListProps} from './types';

import DistanceConfirmationList from './variants/DistanceConfirmationList';
import InvoiceConfirmationList from './variants/InvoiceConfirmationList';
import ManualConfirmationList from './variants/ManualConfirmationList';
import PerDiemConfirmationList from './variants/PerDiemConfirmationList';
import ScanConfirmationList from './variants/ScanConfirmationList';
import TimeConfirmationList from './variants/TimeConfirmationList';

/**
 * Selects the confirmation list variant for the expense type being confirmed.
 */
function MoneyRequestConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {transaction, iouType, action, isPerDiemRequest, isTimeRequest} = props;

    // Invoice is keyed on `iouType` rather than the request type, and is checked first. That is safe because an
    // invoice can never also be a distance or scan request.
    if (iouType === CONST.IOU.TYPE.INVOICE) {
        return <InvoiceConfirmationList {...props} />;
    }

    // Per diem being moved off a track expense submits through ManualConfirmationList.
    if (isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
        return <PerDiemConfirmationList {...props} />;
    }

    // Outside CREATE a time expense shows Merchant and hides the hours/rate fields, which is what ManualConfirmationList renders.
    if (isTimeRequest && action === CONST.IOU.ACTION.CREATE) {
        return <TimeConfirmationList {...props} />;
    }

    if (isScanRequestUtil(transaction)) {
        return <ScanConfirmationList {...props} />;
    }

    if (isDistanceRequestUtil(transaction)) {
        return <DistanceConfirmationList {...props} />;
    }

    return <ManualConfirmationList {...props} />;
}

export default MoneyRequestConfirmationList;
