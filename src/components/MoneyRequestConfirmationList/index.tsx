import {isDistanceRequest as isDistanceRequestUtil, isScanRequest as isScanRequestUtil} from '@libs/TransactionUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {MoneyRequestConfirmationListProps} from './types';

import DistanceConfirmationList from './variants/DistanceConfirmationList';
import ManualConfirmationList from './variants/ManualConfirmationList';
import ScanConfirmationList from './variants/ScanConfirmationList';
import TimeConfirmationList from './variants/TimeConfirmationList';

/**
 * Selects the confirmation list variant for the expense type being confirmed. Invoices and per diem expenses being
 * created never reach it: InvoiceConfirmation and PerDiemConfirmation render their own list directly. A per diem
 * moved off a track expense does come here, and confirms as a plain expense through ManualConfirmationList.
 */
function MoneyRequestConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {transaction, action, isTimeRequest} = props;

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
