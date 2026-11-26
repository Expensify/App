import {showOriginalReceipt, showReceiptTranslation, translateReceipt} from '@libs/actions/ReceiptTranslation';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Growl from '@libs/Growl';
// eslint-disable-next-line no-restricted-imports -- Translate receipt is a paid feature.
import {isPaidGroupPolicy, isPolicyAdmin, isWorkflowApprover} from '@libs/PolicyUtils';
import {isOpenExpenseReport, isReportManager} from '@libs/ReportUtils';
import {hasReceiptSource, isDistanceRequest, isPerDiemRequest, isReceiptScanBlockingEdit} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {loginSelector} from '@selectors/PersonalDetails';
import {emailAndAccountIDSelector} from '@selectors/Session';

import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';
import usePolicy from './usePolicy';

const expenseReportApproverSelector = (report: OnyxEntry<Report>) =>
    report && {
        reportID: report.reportID,
        policyID: report.policyID,
        managerID: report.managerID,
        ownerAccountID: report.ownerAccountID,
        type: report.type,
        stateNum: report.stateNum,
        statusNum: report.statusNum,
        total: report.total,
    };

type ExpenseReportApprover = ReturnType<typeof expenseReportApproverSelector>;

// A hook of its own so the compiler memoizes the rules selector
function useIsOpenReportWorkflowApprover(
    expenseReport: ExpenseReportApprover,
    policy: OnyxEntry<Policy>,
    ownerLogin: string | undefined,
    email: string | undefined,
    isAdminOrReportManager: boolean,
): boolean {
    // A draft report's managerID can be stale, so we also check the policy's approver. Admins and the report's approver skip the rules scan.
    const [isOpenReportWorkflowApprover = false] = useOnyx(ONYXKEYS.COLLECTION.RULE, {
        selector: (rules) => !isAdminOrReportManager && isOpenExpenseReport(expenseReport) && isWorkflowApprover(policy, ownerLogin, rules, expenseReport?.total ?? 0, email),
    });
    return isOpenReportWorkflowApprover;
}

function useReceiptTranslation(transaction: OnyxEntry<Transaction>) {
    const {translate, preferredLocale} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const transactionID = transaction?.transactionID;
    const [receiptTranslation] = useOnyx(`${ONYXKEYS.COLLECTION.RECEIPT_TRANSLATIONS}${getNonEmptyStringOnyxID(transactionID)}`);
    const [receiptTranslationState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_RECEIPT_TRANSLATION_STATE}${getNonEmptyStringOnyxID(transactionID)}`);
    const [expenseReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`, {selector: expenseReportApproverSelector});
    const policy = usePolicy(expenseReport?.policyID);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: emailAndAccountIDSelector});
    const [ownerLogin] = usePersonalDetail(expenseReport?.ownerAccountID, loginSelector);
    const isAdminOrReportManager = isPolicyAdmin(policy) || isReportManager(expenseReport, session?.accountID);
    const isOpenReportWorkflowApprover = useIsOpenReportWorkflowApprover(expenseReport, policy, ownerLogin, session?.email, isAdminOrReportManager);

    const locale = preferredLocale ?? CONST.LOCALES.DEFAULT;
    const receiptID = transaction?.receipt?.receiptID;
    const savedTranslation = receiptTranslation?.[locale];

    // The server sends the transaction's receiptID as a string but the translation's as a number
    const isSameReceipt = !!receiptID && !!savedTranslation && String(savedTranslation.receiptID) === String(receiptID);
    const savedTranslationState = isSameReceipt ? savedTranslation.state : undefined;
    const savedTranslationRows = savedTranslationState === CONST.RECEIPT.TRANSLATION_STATE.TRANSLATED ? savedTranslation?.rows : undefined;
    const isTranslating = receiptTranslationState?.requestState === CONST.RECEIPT.TRANSLATION_REQUEST_STATE.LOADING;
    const translatedReceiptRows = receiptTranslationState?.isShowingTranslation && !isTranslating ? savedTranslationRows : undefined;

    const showTranslationError = (state: ValueOf<typeof CONST.RECEIPT.TRANSLATION_STATE> | undefined) => {
        if (state === CONST.RECEIPT.TRANSLATION_STATE.TRANSLATED) {
            return;
        }
        Growl.error({bodyText: translate(state ? `receipt.translationError.${state}` : 'receipt.translationError.generic')});
    };

    const startTranslation = () => {
        if (!transactionID || !receiptID) {
            return;
        }
        if (savedTranslationRows) {
            showReceiptTranslation(transactionID);
            return;
        }
        if (savedTranslationState && savedTranslationState !== CONST.RECEIPT.TRANSLATION_STATE.TRANSLATED) {
            showTranslationError(savedTranslationState);
            return;
        }
        translateReceipt(transactionID, locale).then(showTranslationError);
    };

    const showOriginal = () => {
        if (!transactionID) {
            return;
        }
        showOriginalReceipt(transactionID);
    };

    // Distance and per diem receipts are generated by us, so there is nothing to translate
    const isGeneratedReceipt = isDistanceRequest(transaction) || isPerDiemRequest(transaction);

    // Employees often open Translate and then do nothing with it
    const isReceiptReviewer = isAdminOrReportManager || isOpenReportWorkflowApprover;

    return {
        canTranslate: isBetaEnabled(CONST.BETAS.RECEIPT_TRANSLATION) && hasReceiptSource(transaction) && !isGeneratedReceipt && isPaidGroupPolicy(policy) && isReceiptReviewer,
        isTranslateDisabled: (isOffline && !savedTranslationRows) || isTranslating || !receiptID || !!transaction?.pendingFields?.receipt || isReceiptScanBlockingEdit(transaction),
        isTranslating,
        translatedReceiptRows,
        startTranslation,
        showOriginal,
    };
}

export default useReceiptTranslation;
