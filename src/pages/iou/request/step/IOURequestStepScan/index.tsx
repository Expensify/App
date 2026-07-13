import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';

import React from 'react';

import type IOURequestStepScanProps from './types';

import ScanRouter from './ScanRouter';

function IOURequestStepScan({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
    },
    transaction,
}: Omit<IOURequestStepScanProps, 'user'>) {
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

IOURequestStepScan.displayName = 'IOURequestStepScan';

const IOURequestStepScanWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepScan);
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScanWithCurrentUserPersonalDetails, true);
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
