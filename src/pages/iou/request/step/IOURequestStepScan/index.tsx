import React from 'react';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {isPolicyExpenseChat} from '@libs/ReportUtils';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {MultiScanGate} from './components/MultiScanContext';
import ScanEditReceipt from './components/ScanEditReceipt';
import ScanFromReport from './components/ScanFromReport';
import ScanGlobalCreate from './components/ScanGlobalCreate';
import {ScanRouteProvider} from './components/ScanRouteContext';
import ScanSkipConfirmation from './components/ScanSkipConfirmation';
import type IOURequestStepScanProps from './types';

/**
 * Thin router that determines which scan variant to render based on the scan context.
 * Each variant is a self-contained component that reads its own route params and Onyx data.
 * The router only subscribes to per-key data needed for branching.
 */
function IOURequestStepScan({report, route, transaction: initialTransaction}: Omit<IOURequestStepScanProps, 'user'>) {
    const {action, iouType, transactionID: initialTransactionID, backTo} = route.params;
    const policy = usePolicy(report?.policyID);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`);
    const isArchived = useReportIsArchived(report?.reportID);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isFromGlobalCreate = !!initialTransaction?.isFromGlobalCreate;
    const shouldSkipConfirmation =
        !!skipConfirmation && !!report?.reportID && !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));

    let content: React.ReactNode;
    if (backTo || isEditing) {
        content = <ScanEditReceipt />;
    } else if (!isFromGlobalCreate && !isArchived && iouType !== CONST.IOU.TYPE.CREATE) {
        content = shouldSkipConfirmation ? (
            <MultiScanGate>
                <ScanSkipConfirmation />
            </MultiScanGate>
        ) : (
            <MultiScanGate>
                <ScanFromReport />
            </MultiScanGate>
        );
    } else {
        content = (
            <MultiScanGate>
                <ScanGlobalCreate />
            </MultiScanGate>
        );
    }

    return <ScanRouteProvider route={route}>{content}</ScanRouteProvider>;
}

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScan, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
