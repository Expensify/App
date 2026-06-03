import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {isPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import MultiScanGate from './components/MultiScanGate';
import ScanEditReceipt from './components/ScanEditReceipt';
import ScanFromReport from './components/ScanFromReport';
import ScanGlobalCreate from './components/ScanGlobalCreate';
import ScanSkipConfirmation from './components/ScanSkipConfirmation';

type ScanRouterProps = {
    report: OnyxEntry<Report>;
    action: IOUAction;
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backTo: Route | undefined;
    backToReport: string | undefined;
};

type NonGlobalCreateProps = {
    report: OnyxEntry<Report>;
    action: IOUAction;
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
};

type NewReceiptProps = NonGlobalCreateProps;

const policyRequiresTagOrCategorySelector = (policy: OnyxEntry<Policy>) => !!policy?.requiresCategory || !!policy?.requiresTag;

/**
 * Owns the policy + skip-confirmation subscriptions so the edit and global-create branches don't pay for them.
 * Decides between SkipConfirmation (quick action) and FromReport (report (+) entry).
 */
function ScanNonGlobalCreate({report, action, iouType, reportID, transactionID, transaction, backToReport}: NonGlobalCreateProps) {
    const [policyRequiresTagOrCategory] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {selector: policyRequiresTagOrCategorySelector});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const shouldSkipConfirmation = !!skipConfirmation && !!report?.reportID && !(isPolicyExpenseChat(report) && policyRequiresTagOrCategory);

    if (shouldSkipConfirmation) {
        return (
            <ScanSkipConfirmation
                report={report}
                action={action}
                iouType={iouType}
                reportID={reportID}
                transactionID={transactionID}
                transaction={transaction}
                backToReport={backToReport}
            />
        );
    }

    return (
        <ScanFromReport
            report={report}
            iouType={iouType}
            reportID={reportID}
            transactionID={transactionID}
            transaction={transaction}
            backToReport={backToReport}
        />
    );
}

ScanNonGlobalCreate.displayName = 'ScanNonGlobalCreate';

/**
 * Splits new-receipt flows: global-create (FAB) vs. report-scoped (FromReport / SkipConfirm).
 * The archived-report check lives here so neither global-create nor non-global-create variants need to subscribe.
 */
function ScanNewReceipt({report, action, iouType, reportID, transactionID, transaction, backToReport}: NewReceiptProps) {
    const isArchived = useReportIsArchived(report?.reportID);
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;

    if (!isFromGlobalCreate && !isArchived && iouType !== CONST.IOU.TYPE.CREATE) {
        return (
            <ScanNonGlobalCreate
                report={report}
                action={action}
                iouType={iouType}
                reportID={reportID}
                transactionID={transactionID}
                transaction={transaction}
                backToReport={backToReport}
            />
        );
    }

    return (
        <ScanGlobalCreate
            iouType={iouType}
            reportID={reportID}
            transactionID={transactionID}
            transaction={transaction}
            backToReport={backToReport}
        />
    );
}

ScanNewReceipt.displayName = 'ScanNewReceipt';

/**
 * ScanRouter — selects the appropriate scan variant based on route params and transaction state.
 *
 * Edit branch is a fast-path that subscribes to nothing extra. Non-edit branches go through MultiScanGate
 * and the layered ScanNewReceipt/ScanNonGlobalCreate components, which scope their subscriptions to the
 * narrowest variant that needs them.
 */
function ScanRouter({report, action, iouType, reportID, transactionID, transaction, backTo, backToReport}: ScanRouterProps) {
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    if (backTo || isEditing) {
        return (
            <ScanEditReceipt
                report={report}
                transactionID={transactionID}
                backTo={backTo}
                isEditing={isEditing}
            />
        );
    }

    return (
        <MultiScanGate>
            <ScanNewReceipt
                report={report}
                action={action}
                iouType={iouType}
                reportID={reportID}
                transactionID={transactionID}
                transaction={transaction}
                backToReport={backToReport}
            />
        </MultiScanGate>
    );
}

ScanRouter.displayName = 'ScanRouter';

export default ScanRouter;
