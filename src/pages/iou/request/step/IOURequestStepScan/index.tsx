import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import type IOURequestStepScanProps from './types';

import ScanRouter from './ScanRouter';

function DynamicIOURequestStepScan({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backToReport},
        name,
    },
    transaction,
}: Omit<IOURequestStepScanProps, 'user'>) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SCAN.path);
    // The page is also mounted as a tab of the static create screen, where there is no dynamic suffix to strip and
    // nothing to go back to within the flow. `ScanRouter` uses the presence of `backTo` to pick the receipt-edit variant.
    const backTo = name === SCREENS.MONEY_REQUEST.DYNAMIC_STEP_SCAN ? backPath : undefined;

    return (
        <ScanRouter
            report={report}
            action={action}
            iouType={iouType}
            reportID={reportID}
            transactionID={transactionID}
            transaction={transaction}
            backTo={backTo}
            backToReport={backToReport}
        />
    );
}

DynamicIOURequestStepScan.displayName = 'DynamicIOURequestStepScan';

const DynamicIOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(DynamicIOURequestStepScan);
const DynamicIOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepScanWithCurrentUserPersonalDetails, true);
const DynamicIOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepScanWithWritableReportOrNotFound);

export default DynamicIOURequestStepScanWithFullTransactionOrNotFound;
