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

function MoneyRequestConfirmationListFooter(props: MoneyRequestConfirmationListFooterProps) {
    const {action, isTypeInvoice, isScanRequest, isPerDiemRequest, isTimeRequest, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} = useConfirmationFields();

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

    if (isDistanceRequest) {
        return <DistanceMapFooter {...props} />;
    }

    if (isScanRequest) {
        return <ScanFooter {...props} />;
    }

    return <ManualFooter {...props} />;
}

export default MoneyRequestConfirmationListFooter;
