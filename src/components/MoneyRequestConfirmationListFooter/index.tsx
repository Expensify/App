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
 * Selects the footer variant for the expense type being confirmed.
 *
 * `ManualFooter` is the residual rather than a fallback: besides plain manual expenses it serves pay and the
 * two combinations that confirm as a plain expense. Per-diem being moved off a track expense
 * (`action === SUBMIT`) submits through `RequestMoney` rather than `CreatePerDiemExpense`, and a time expense
 * outside `CREATE` shows Merchant with no hours/rate fields.
 */
function MoneyRequestConfirmationListFooter(props: MoneyRequestConfirmationListFooterProps) {
    const {action, isTypeInvoice, isScanRequest, isPerDiemRequest, isTimeRequest, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} = useConfirmationFields();

    // Invoice is the one branch keyed on `iouType` rather than the request type. It cannot collide with the
    // checks below because the request-type tabs are never offered for an invoice.
    if (isTypeInvoice) {
        return <InvoiceFooter {...props} />;
    }

    if (isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
        return <PerDiemFooter {...props} />;
    }

    if (isTimeRequest && action === CONST.IOU.ACTION.CREATE) {
        return <TimeFooter {...props} />;
    }

    if (isDistanceRequest && isManualDistanceRequest) {
        return <DistanceManualFooter {...props} />;
    }

    if (isDistanceRequest && isOdometerDistanceRequest) {
        return <DistanceOdometerFooter {...props} />;
    }

    // `distance`, `distance-map` and `distance-gps` all reach the route map.
    if (isDistanceRequest) {
        return <DistanceMapFooter {...props} />;
    }

    if (isScanRequest) {
        return <ScanFooter {...props} />;
    }

    return <ManualFooter {...props} />;
}

export default MoneyRequestConfirmationListFooter;
