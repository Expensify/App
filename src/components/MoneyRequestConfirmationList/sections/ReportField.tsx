import DropdownField from '@components/DropdownField';
import MenuItemFieldHTML from '@components/MenuItem/presets/MenuItemFieldHTML';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOutstandingReports from '@hooks/useOutstandingReports';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';

import {isMovingTransactionFromTrackExpense} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getReportName} from '@libs/ReportNameUtils';
import {
    canAddTransaction,
    generateReportID,
    getDefaultMoneyRequestReport,
    getMoneyRequestReportCandidate,
    getOutstandingReportsForUser,
    isMoneyRequestReport,
    isOpenExpenseReport,
    isReportOutstanding,
    isSavedThroughMoneyRequestBuilder,
    sortOutstandingReportsBySelected,
} from '@libs/ReportUtils';

import useReportPickerChoices from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportPickerChoices';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {createOutstandingReportsForPolicySelector} from '@selectors/Report';
import React from 'react';

import ExpenseFieldContainer from './ExpenseFieldContainer';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
import ReportFieldDropdown from './ReportFieldDropdown';
import {reportFieldTransactionStateSelector, shouldReportFieldBeEditable} from './selectors';
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
    const ownerAccountID = selectedParticipants?.at(0)?.ownerAccountID;
    const [ownerPersonalDetail] = usePersonalDetail(ownerAccountID);

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
    const isTimeRequest = transactionState?.isTimeRequest ?? false;
    const isUnreportedManagedCardTransaction = transactionState?.isUnreportedManagedCardTransaction ?? false;

    // Per-key report subscriptions instead of full COLLECTION.REPORT
    const [transactionReportEntry] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionReportID}`);
    const [mainReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`);
    const iouReportIDFromMain = mainReport?.iouReportID;
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportIDFromMain}`);

    const isUnreported = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingExpense = action === CONST.IOU.ACTION.CREATE;
    const isMovingTrackedExpense = isMovingTransactionFromTrackExpense(action);

    /**
     * We need to check if the transaction report exists first in order to prevent the outstanding reports from being used.
     * Also we need to check if transaction report exists in outstanding reports in order to show a correct report name.
     */
    const transactionReportNameValuePair = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${transactionReportID}`];
    const shouldUseTransactionReport = (!!transactionReportEntry && isReportOutstanding(transactionReportEntry, policyID, rules, transactionReportNameValuePair, false)) || isUnreported;

    const availableOutstandingReports = getOutstandingReportsForUser(policyID, ownerAccountID, rules, reportNameValuePairs, outstandingReportsForPolicy ?? {}, false).sort(
        (report1, report2) => sortOutstandingReportsBySelected(report1, report2, undefined, localeCompare),
    );

    // Match the save path's automatic destination before checking eligibility, rather than falling back to a report it would not use.
    const candidateReport = getMoneyRequestReportCandidate(iouReport, action, policyID, ownerAccountID, rules, reportNameValuePairs, outstandingReportsForPolicy);
    const defaultReport = candidateReport ?? (isSavedThroughMoneyRequestBuilder(action) ? undefined : availableOutstandingReports.at(0));
    const defaultReportID = getDefaultMoneyRequestReport(defaultReport, mainReport, isScanRequest, isBetaEnabled(CONST.BETAS.ASAP_SUBMIT), rules, action)?.reportID;

    const outstandingReportID = isPolicyExpenseChat ? defaultReportID : reportID;
    const reportIDToUse = shouldUseTransactionReport ? transactionReportID : outstandingReportID;

    const [selectedReportID, selectedReport] = (() => {
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
        } else if (reportIDToUse === defaultReport?.reportID) {
            reportToUse = defaultReport;
        } else {
            reportToUse = availableOutstandingReports.find((r) => r?.reportID === reportIDToUse);
        }
        if (isCreatingExpense && reportToUse && !canAddTransaction(reportToUse, rules)) {
            return [generateReportID(), undefined] as const;
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

    const allOutstandingReports = useOutstandingReports(undefined, isFromGlobalCreate && !isPerDiemRequest ? undefined : policyID, ownerAccountID, false, ownerPersonalDetail?.login);
    // A tracked expense moved to a workspace can only join an open report, so the picker lists only those. Count the same reports here.
    const outstandingReports = isMovingTrackedExpense ? allOutstandingReports.filter(isOpenExpenseReport) : allOutstandingReports;
    const eligibleOutstandingReports = isCreatingExpense ? outstandingReports.filter((report) => canAddTransaction(report, rules)) : outstandingReports;
    // Use the default rather than the picked report, so picking the only outstanding report keeps the field editable to switch back.
    const hasOtherReport = shouldReportFieldBeEditable(eligibleOutstandingReports, selectedReportID, isUnreported || !outstandingReportID);
    // The list also offers a new report when there is a workspace to make it on, and no report at all for an expense
    // being created, so either is a choice too. The row asks through the hook the list uses, so it never opens an
    // empty list, e.g. for someone with no workspace submitting a tracked expense.
    const {canCreateReport, canLeaveUnreported} = useReportPickerChoices({
        action,
        iouType,
        isPerDiemRequest,
        isTimeRequest,
        isUnreportedManagedCardTransaction,
        expensePolicyID: policyID,
    });
    // Editing an expense that is already on a report can hide the new report option (someone else's expense, edited by
    // a non-admin), so there the row needs another report to choose from. Creating from inside an expense report locks
    // the row, since the expense can only go on that report.
    const mayHideListOptions = action === CONST.IOU.ACTION.EDIT && !isUnreported;
    const hasReportChoice = mayHideListOptions ? hasOtherReport : hasOtherReport || canCreateReport || canLeaveUnreported;
    const shouldReportBeEditable = hasReportChoice && !isMoneyRequestReport(reportID);
    // Editing a saved expense's report and moving a per diem expense both navigate on from the list (to the report, or to
    // the destination step when the workspace changes), so those keep the full page.
    const shouldOpenInDropdown = !!transactionID && shouldReportBeEditable && action !== CONST.IOU.ACTION.EDIT && !isPerDiemRequest;

    const openReportPage = () => {
        if (!transactionID || !selectedReportID) {
            return;
        }
        // With no report to show yet, the page opens from the chat the expense is being created in, as the anchored list
        // does, rather than from the placeholder ID.
        const reportIDForPage = selectedReport ? selectedReportID : reportID || selectedReportID;
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(action, iouType, transactionID, reportIDForPage, reportActionID)));
    };

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldContainer>
                <DropdownField
                    name={translate('common.report')}
                    // The field row renders plain text, so an HTML report name (e.g. a room with a markup name) is
                    // flattened first. Plain names pass through unchanged, with their entities decoded.
                    value={Parser.htmlToText(reportName)}
                    onPress={openReportPage}
                    shouldOpenInDropdown={shouldOpenInDropdown}
                    listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                    renderDropdown={(dropdownProps) =>
                        !!transactionID && (
                            <ReportFieldDropdown
                                {...dropdownProps}
                                transactionID={transactionID}
                            />
                        )
                    }
                    // A report the user cannot change reads as a disabled field, the same as every other locked field
                    // on this form: the row itself owns that rule.
                    isInteractive={shouldReportBeEditable}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.REPORT_FIELD}
                />
            </ExpenseFieldContainer>
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
