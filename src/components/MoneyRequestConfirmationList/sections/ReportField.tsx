import MenuItemFieldHTML from '@components/MenuItem/presets/MenuItemFieldHTML';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOutstandingReports from '@hooks/useOutstandingReports';
import usePermissions from '@hooks/usePermissions';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getReportName} from '@libs/ReportNameUtils';
import {
    generateReportID,
    getNewestOutstandingReportForUser,
    getOutstandingReportsForUser,
    isMoneyRequestReport,
    isReportOutstanding,
    shouldCreateNewMoneyRequestReport,
    sortOutstandingReportsBySelected,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {createOutstandingReportsForPolicySelector} from '@selectors/Report';
import React from 'react';

import ExpenseFieldRow from './ExpenseFieldRow';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
import {reportFieldTransactionStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type ReportFieldProps = {
    selectedParticipants: Participant[];
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;

    /** The action to perform */
    action: IOUAction;

    transactionID: string | undefined;
    isPerDiemRequest: boolean;
    isPolicyExpenseChat: boolean;
};

function ReportField({selectedParticipants, iouType, reportID, reportActionID, action, transactionID, isPerDiemRequest, isPolicyExpenseChat}: ReportFieldProps) {
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();

    const policyID = selectedParticipants?.at(0)?.policyID;
    const [outstandingReportsForPolicy] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {selector: createOutstandingReportsForPolicySelector(policyID)});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    // Self-resolved narrow slice of the transaction; replaces the previously prop-drilled `transaction` object.
    const transactionState = useTransactionSelector(transactionID, reportFieldTransactionStateSelector);
    const transactionReportID = transactionState?.reportID;
    const participantReportID = transactionState?.participantReportID;
    const isFromGlobalCreate = transactionState?.isFromGlobalCreate ?? false;
    const isScanRequest = transactionState?.isScanRequest ?? false;

    // Per-key report subscriptions instead of full COLLECTION.REPORT
    const [transactionReportEntry] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionReportID}`);
    const [mainReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`);
    const iouReportIDFromMain = mainReport?.iouReportID;
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportIDFromMain}`);

    const isUnreported = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    /**
     * We need to check if the transaction report exists first in order to prevent the outstanding reports from being used.
     * Also we need to check if transaction report exists in outstanding reports in order to show a correct report name.
     */
    const transactionReportNameValuePair = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${transactionReportID}`];
    const shouldUseTransactionReport = (!!transactionReportEntry && isReportOutstanding(transactionReportEntry, policyID, rules, transactionReportNameValuePair, false)) || isUnreported;

    const ownerAccountID = selectedParticipants?.at(0)?.ownerAccountID;

    const availableOutstandingReports = getOutstandingReportsForUser(policyID, ownerAccountID, rules, reportNameValuePairs, outstandingReportsForPolicy ?? {}, false).sort(
        (report1, report2) => sortOutstandingReportsBySelected(report1, report2, undefined, localeCompare),
    );

    // Resolve the default report the same way the save path (MoneyRequestBuilder) does, so the field never shows a report
    // the expense won't be added to. For example, a submitted report awaiting approval can still accept expenses when picked,
    // but it is never used as the default, so the field shows "New report" instead.
    const newestOutstandingReport = iouReport ? undefined : getNewestOutstandingReportForUser(policyID, ownerAccountID, rules, reportNameValuePairs, outstandingReportsForPolicy ?? {});
    const defaultReport = iouReport ?? newestOutstandingReport;
    const shouldCreateNewReport = shouldCreateNewMoneyRequestReport(defaultReport, mainReport, isScanRequest, isBetaEnabled(CONST.BETAS.ASAP_SUBMIT), rules, action);
    const defaultReportID = shouldCreateNewReport ? undefined : defaultReport?.reportID;

    const outstandingReportID = isPolicyExpenseChat ? defaultReportID : reportID;

    const [selectedReportID, selectedReport] = (() => {
        const reportIDToUse = shouldUseTransactionReport ? transactionReportID : outstandingReportID;
        if (!reportIDToUse) {
            // Even if we have no report to use we still need a report id for proper navigation
            return [generateReportID(), undefined] as const;
        }
        // Resolve from already-fetched per-key reports or available outstanding reports
        let reportToUse: OnyxEntry<OnyxTypes.Report> | undefined;
        if (reportIDToUse === transactionReportID) {
            reportToUse = transactionReportEntry;
        } else if (reportIDToUse === reportID) {
            reportToUse = mainReport;
        } else if (reportIDToUse === iouReportIDFromMain) {
            reportToUse = iouReport;
        } else if (reportIDToUse === newestOutstandingReport?.reportID) {
            reportToUse = newestOutstandingReport;
        } else {
            reportToUse = availableOutstandingReports.find((r) => r?.reportID === reportIDToUse);
        }
        return [reportIDToUse, reportToUse ?? undefined] as const;
    })();

    const derivedReportName = useDerivedReportNameByReportID(selectedReportID);

    const reportName = (() => {
        const name = getReportName(selectedReport, derivedReportName);
        if (!name) {
            return isUnreported ? translate('common.none') : translate('iou.newReport');
        }
        return name;
    })();

    const outstandingReports = useOutstandingReports(undefined, isFromGlobalCreate && !isPerDiemRequest ? undefined : policyID, ownerAccountID, false);
    // When creating an expense in an individual report, the report field becomes read-only
    // since the destination is already determined and there's no need to show a selectable list.
    const shouldReportBeEditable = (isUnreported ? outstandingReports.length >= 1 : outstandingReports.length > 1) && !isMoneyRequestReport(reportID);

    const openReportPage = () => {
        if (!transactionID || !selectedReportID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(action, iouType, transactionID, selectedReportID, reportActionID)));
    };

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldRow
                name={translate('common.report')}
                // The field row renders plain text, so an HTML report name (e.g. a room with a markup name) is
                // flattened first. Plain names pass through unchanged, with their entities decoded.
                value={Parser.htmlToText(reportName)}
                onPress={openReportPage}
                // A report the user cannot change reads as a disabled field, the same as every other locked field
                // on this form: the row itself owns that rule.
                isInteractive={shouldReportBeEditable}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.REPORT_FIELD}
            />
        );
    }

    return (
        <MenuItemFieldHTML
            name={translate('common.report')}
            value={reportName}
            onPress={shouldReportBeEditable ? openReportPage : undefined}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.REPORT_FIELD}
            testID="menu-item-Report"
        />
    );
}

export default ReportField;
