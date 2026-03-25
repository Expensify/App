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
import ScanSkipConfirmation from './components/ScanSkipConfirmation';
import type IOURequestStepScanProps from './types';

/**
 * Thin router that determines which scan variant to render based on the scan context.
 * Each variant is a self-contained component that reads its own route params and Onyx data.
 * The router only subscribes to per-key data needed for branching.
 */
// We pass the parent route explicitly because variant components are rendered
// inside a TopTab.Screen, where useRoute() would return the tab navigator's
// route (which has no params) instead of the MoneyRequest navigator's route.
function IOURequestStepScan({report, route, transaction: initialTransaction}: Omit<IOURequestStepScanProps, 'user'>) {
    const {action, iouType, transactionID: initialTransactionID, backTo} = route.params;
    const policy = usePolicy(report?.policyID);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`);
    const isArchived = useReportIsArchived(report?.reportID);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isFromGlobalCreate = !!initialTransaction?.isFromGlobalCreate;
    const shouldSkipConfirmation =
        !!skipConfirmation && !!report?.reportID && !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));

    if (backTo || isEditing) {
        return <ScanEditReceipt route={route} />;
    }

    if (!isFromGlobalCreate && !isArchived && iouType !== CONST.IOU.TYPE.CREATE) {
        if (shouldSkipConfirmation) {
            return (
                <MultiScanGate route={route}>
                    <ScanSkipConfirmation route={route} />
                </MultiScanGate>
            );
        }
        return (
            <MultiScanGate route={route}>
                <ScanFromReport route={route} />
            </MultiScanGate>
        );
    }

    return (
        <MultiScanGate route={route}>
            <ScanGlobalCreate route={route} />
        </MultiScanGate>
    );
}

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepScan, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepScanWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepScanWithWritableReportOrNotFound);

export default IOURequestStepScanWithFullTransactionOrNotFound;
