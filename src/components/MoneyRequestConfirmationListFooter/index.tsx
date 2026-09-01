import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import CONST from '@src/CONST';

import React from 'react';

import type {MoneyRequestConfirmationListFooterProps} from './types';

import DistanceManualFooter from './variants/DistanceManualFooter';
import DistanceMapFooter from './variants/DistanceMapFooter';
import DistanceOdometerFooter from './variants/DistanceOdometerFooter';
import InvoiceFooter from './variants/InvoiceFooter';
import ManualFooter from './variants/ManualFooter';
import PerDiemFooter from './variants/PerDiemFooter';
import ScanFooter from './variants/ScanFooter';
import TimeFooter from './variants/TimeFooter';

/**
 * Selects the footer variant for the expense type being confirmed. `ManualFooter` is the residual rather than a
 * fallback: it also serves pay, per-diem being moved off a track expense, and a time expense outside CREATE,
 * all of which confirm as a plain expense.
 */
function MoneyRequestConfirmationListFooter(props: MoneyRequestConfirmationListFooterProps) {
    const {action, isTypeInvoice, isScanRequest, isPerDiemRequest, isTimeRequest, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} = useConfirmationFields();

    // Invoice is the one branch keyed on `iouType` rather than the request type, so it is checked first. That is
    // safe because an invoice can never also be a distance or scan request.
    if (isTypeInvoice) {
        return <InvoiceFooter {...props} />;
    }

    // Per-diem being moved off a track expense submits through RequestMoney rather than CreatePerDiemExpense,
    // and renders as a plain expense.
    if (isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
        return <PerDiemFooter {...props} />;
    }

    // Outside CREATE a time expense shows Merchant and hides the hours/rate fields, which is what the manual
    // footer renders anyway.
    if (isTimeRequest && action === CONST.IOU.ACTION.CREATE) {
        return <TimeFooter {...props} />;
    }

    if (isDistanceRequest && isManualDistanceRequest) {
        return <DistanceManualFooter {...props} />;
    }

    if (isDistanceRequest && isOdometerDistanceRequest) {
        return <DistanceOdometerFooter {...props} />;
    }

    if (isDistanceRequest) {
        return <DistanceMapFooter {...props} />;
    }

    if (isScanRequest) {
        return <ScanFooter {...props} />;
    }

    return <ManualFooter {...props} />;
}

export default MoneyRequestConfirmationListFooter;
