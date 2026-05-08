import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOutstandingReports from '@hooks/useOutstandingReports';
import useReportAttributes from '@hooks/useReportAttributes';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getReportName} from '@libs/ReportNameUtils';
import {generateReportID, getOutstandingReportsForUser, isMoneyRequestReport, isReportOutstanding} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type ReportFieldProps = {
    /** The selected participants */
    selectedParticipants: Participant[];

    /** The type of the IOU */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** The report ID */
    reportID: string;

    /** The report action ID */
    reportActionID: string | undefined;

    /** The action to perform */
    action: IOUAction;

    /** The transaction ID */
    transactionID: string | undefined;

    /** The transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Flag indicating if it is a per diem request */
    isPerDiemRequest: boolean;

    /** Flag indicating if it is a policy expense chat */
    isPolicyExpenseChat: boolean;
};

function ReportField({selectedParticipants, iouType, reportID, reportActionID, action, transactionID, transaction, isPerDiemRequest, isPolicyExpenseChat}: ReportFieldProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const reportAttributes = useReportAttributes();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

    // Per-key report subscriptions instead of full COLLECTION.REPORT
    const [transactionReportEntry] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [mainReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const iouReportIDFromMain = mainReport?.iouReportID;
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportIDFromMain}`);

    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;

    /**
     * We need to check if the transaction report exists first in order to prevent the outstanding reports from being used.
     * Also we need to check if transaction report exists in outstanding reports in order to show a correct report name.
     */
    const policyID = selectedParticipants?.at(0)?.policyID;
    const shouldUseTransactionReport = (!!transactionReportEntry && isReportOutstanding(transactionReportEntry, policyID, undefined, false)) || isUnreported;

    const ownerAccountID = selectedParticipants?.at(0)?.ownerAccountID;

    const availableOutstandingReports = getOutstandingReportsForUser(
        policyID,
        ownerAccountID,
        outstandingReportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
        reportNameValuePairs,
        false,
    ).sort((a, b) => localeCompare(a?.reportName?.toLowerCase() ?? '', b?.reportName?.toLowerCase() ?? ''));

    const outstandingReportID = isPolicyExpenseChat ? (iouReportIDFromMain ?? availableOutstandingReports.at(0)?.reportID) : reportID;

    const [selectedReportID, selectedReport] = (() => {
        const reportIDToUse = shouldUseTransactionReport ? transaction?.reportID : outstandingReportID;
        if (!reportIDToUse) {
            // Even if we have no report to use we still need a report id for proper navigation
            return [generateReportID(), undefined] as const;
        }
        // Resolve from already-fetched per-key reports or available outstanding reports
        let reportToUse: OnyxEntry<OnyxTypes.Report> | undefined;
        if (reportIDToUse === transaction?.reportID) {
            reportToUse = transactionReportEntry;
        } else if (reportIDToUse === reportID) {
            reportToUse = mainReport;
        } else if (reportIDToUse === iouReportIDFromMain) {
            reportToUse = iouReport;
        } else {
            reportToUse = availableOutstandingReports.find((r) => r?.reportID === reportIDToUse);
        }
        return [reportIDToUse, reportToUse ?? undefined] as const;
    })();

    const reportName = (() => {
        const name = getReportName(selectedReport, reportAttributes);
        if (!name) {
            return isUnreported ? translate('common.none') : translate('iou.newReport');
        }
        return name;
    })();

    const outstandingReports = useOutstandingReports(undefined, isFromGlobalCreate && !isPerDiemRequest ? undefined : policyID, ownerAccountID, false);
    // When creating an expense in an individual report, the report field becomes read-only
    // since the destination is already determined and there's no need to show a selectable list.
    const shouldReportBeEditable = (isUnreported ? outstandingReports.length >= 1 : outstandingReports.length > 1) && !isMoneyRequestReport(reportID);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={shouldReportBeEditable}
            title={reportName}
            description={translate('common.report')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID || !selectedReportID) {
                    return;
                }
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(action, iouType, transactionID, selectedReportID, Navigation.getActiveRoute(), reportActionID));
            }}
            interactive={shouldReportBeEditable}
            shouldRenderAsHTML
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.REPORT_FIELD}
        />
    );
}

export default ReportField;
