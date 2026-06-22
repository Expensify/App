import type {OnyxEntry} from 'react-native-onyx';
import {navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import {getScanGlobalCreateNavigationData} from '@libs/ScanGlobalCreateNavigationData';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {endSpan} from '@libs/telemetry/activeSpans';
import {setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type Transaction from '@src/types/onyx/Transaction';
import startScanProcessSpan from './startScanProcessSpan';

type NavigateGlobalCreateParams = {
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
    transactionIDs: string[];
    isMultiScanEnabled: boolean;
    accountID: number;
};

/**
 * Pure (non-hook) form of `navigateGlobalCreate`. Reads policy / self-DM /
 * billing data from the module-level mirror (`ScanGlobalCreateNavigationData`)
 * so the scan-camera screen no longer subscribes to those Onyx keys on mount.
 */
function navigateGlobalCreate({iouType, reportID, transactionID, transaction, backToReport, transactionIDs, isMultiScanEnabled, accountID}: NavigateGlobalCreateParams): void {
    startScanProcessSpan(isMultiScanEnabled);

    const {defaultExpensePolicy, personalPolicy, selfDMReport, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd} = getScanGlobalCreateNavigationData();

    if (!shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, accountID)) {
        endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
        navigateToParticipantPage(iouType, transactionID, reportID);
        return;
    }

    const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
    const targetReport = shouldAutoReport ? getPolicyExpenseChat(accountID, defaultExpensePolicy?.id) : selfDMReport;
    const transactionReportID = isSelfDM(targetReport) ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
    const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

    // If the user previously selected different participants in confirmation, preserve that choice
    if (transaction?.participants && transaction.participants.at(0)?.reportID !== targetReport?.reportID) {
        const isTrackExpense = transaction.participants.at(0)?.reportID === selfDMReport?.reportID;
        const setParticipantsPromises = transactionIDs.map((tid) => setMoneyRequestParticipants(tid, transaction.participants));
        Promise.all(setParticipantsPromises).then(() => {
            if (isTrackExpense) {
                endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, transactionID, selfDMReport?.reportID));
                return;
            }
            navigateToConfirmationPage(iouType, transactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, transaction.reportID);
        });
        return;
    }

    const setParticipantsPromises = transactionIDs.map((tid) => {
        setTransactionReport(tid, {reportID: transactionReportID}, true);
        return setMoneyRequestParticipantsFromReport(tid, targetReport, accountID);
    });
    Promise.all(setParticipantsPromises).then(() => {
        endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, transactionID, targetReport?.reportID));
    });
}

export default navigateGlobalCreate;
export type {NavigateGlobalCreateParams};
