import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactions from '@hooks/useReportTransactions';

import {getReusableP2PReportID, resolveOptimisticChatReportID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import {
    findSelfDMReportID,
    generateReportID,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
} from '@libs/ReportUtils';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {getIsFromGlobalCreate} from '@libs/TransactionUtils';

import {isOneToTwoTransactionTransition} from '@userActions/IOU/PendingNewTransactions';
import {getPerDiemExpensePolicyID, hasCompletePerDiemCustomUnit, submitPerDiemExpenseForSelfDM, submitPerDiemExpense as submitPerDiemExpenseIOUActions} from '@userActions/IOU/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, PolicyCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import type {SubmissionHandle} from './types';

import useSubmissionRecentlyUsedData from './useSubmissionRecentlyUsedData';

type UsePerDiemSubmissionParams = {
    transaction: OnyxEntry<Transaction>;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    selectedParticipants: Participant[];
    isTrackExpense: boolean;
    isSelfDMDestination: boolean;
    isLookingAroundUser: boolean;
    isTrackIntentUser: boolean;
    backToReport?: string;
    onExpenseWriteWillStart?: () => void;
};

function usePerDiemSubmission({
    transaction,
    report,
    policy,
    policyCategories,
    personalDetails,
    currentUserPersonalDetails,
    selectedParticipants,
    isTrackExpense,
    isSelfDMDestination,
    isLookingAroundUser,
    isTrackIntentUser,
    backToReport,
    onExpenseWriteWillStart,
}: UsePerDiemSubmissionParams): SubmissionHandle {
    const {formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const policyID = policy?.id;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [recentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`);
    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = useSubmissionRecentlyUsedData(policyID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const reportTransactions = useReportTransactions(report?.reportID);
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');

    const perDiemParticipant = selectedParticipants.at(0);
    const earlyPerDiemExpensePolicyID = perDiemParticipant
        ? getPerDiemExpensePolicyID({
              report,
              participantParams: {
                  payeeEmail: currentUserPersonalDetails.login,
                  payeeAccountID: currentUserPersonalDetails.accountID,
                  participant: perDiemParticipant,
              },
              existingIOUReport: undefined,
              isASAPSubmitBetaEnabled,
              rules,
              currentUserAccountIDParam: currentUserPersonalDetails.accountID,
          })
        : undefined;
    const [perDiemExpensePolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${earlyPerDiemExpensePolicyID}`);

    function createTransaction(locationPermissionGranted = false, shouldHandleNavigation = true) {
        if (!transaction) {
            markSubmitExpenseEnd();
            return;
        }

        const participant = selectedParticipants.at(0);
        if (!participant || isEmptyObject(transaction.comment) || isEmptyObject(transaction.comment.customUnit)) {
            markSubmitExpenseEnd();
            return;
        }
        const trimmedComment = transaction.comment?.comment?.trim() ?? '';
        onExpenseWriteWillStart?.();
        if (isTrackExpense) {
            // Mirror the action's bail: a submit it would no-op must not clean up or dismiss.
            if (!isEmptyObject(policy) && hasCompletePerDiemCustomUnit(transaction.comment?.customUnit)) {
                const optimisticChatReportID = selfDMReport?.reportID ?? generateReportID();
                submitPerDiemExpenseForSelfDM({
                    dateFnsLocale,
                    getCurrencyDecimals,
                    selfDMReport,
                    policy,
                    transactionParams: {
                        currency: transaction.currency,
                        created: transaction.created,
                        comment: trimmedComment,
                        category: transaction.category,
                        tag: transaction.tag,
                        customUnit: transaction.comment?.customUnit,
                        billable: transaction.billable,
                        reimbursable: transaction.reimbursable,
                        attendees: transaction.comment?.attendees,
                        isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                    },
                    currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                    currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                    quickAction,
                    optimisticChatReportID,
                    delegateAccountID,
                    isTrackIntentUser,
                });
                if (shouldHandleNavigation) {
                    cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
                    dismissModalAndOpenReportInInboxTab(optimisticChatReportID, false, false);
                } else {
                    cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
                }
            } else {
                Log.alert('[usePerDiemSubmission] Skipped per diem self-DM submit: missing policy or incomplete custom unit');
            }
            markSubmitExpenseEnd();
            return;
        }

        const isExpenseReport = isMoneyRequestReportReportUtils(report);
        let existingChatReport = report;
        if (isExpenseReport) {
            existingChatReport = getReportOrDraftReport(report?.chatReportID);
        } else if (!report?.reportID && participant.isPolicyExpenseChat && participant.reportID) {
            existingChatReport = getReportOrDraftReport(participant.reportID);
        }
        // The recipient can be swapped without this screen remounting, so `existingChatReport` above
        // can still be whoever was selected before. Use the ID confirmation committed for the current
        // pick instead, so the pre-mounted report stays aligned with a brand-new P2P recipient.
        const transactionReportID = transaction.reportID;
        // Reuse it so the pre-mounted screen subscribes to the report created on submission.
        const reusableP2PReportID = !isExpenseReport ? getReusableP2PReportID(participant, transactionReportID) : undefined;
        const participantAccountIDs = [participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID];
        const reportIDs =
            !isExpenseReport && !participant.isPolicyExpenseChat
                ? resolveOptimisticChatReportID(participantAccountIDs, undefined, reusableP2PReportID)
                : resolveOptimisticChatReportID(participantAccountIDs, existingChatReport);
        const {optimisticChatReportID, chatReportID} = reportIDs;
        const activeReportID = isExpenseReport ? report?.reportID : chatReportID;
        const notifyReportID = isExpenseReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : chatReportID;

        const result = submitPerDiemExpenseIOUActions({
            isVendorMatchingBetaEnabled,
            dateFnsLocale,
            getCurrencyDecimals,
            report,
            participantParams: {
                payeeEmail: currentUserPersonalDetails.login,
                payeeAccountID: currentUserPersonalDetails.accountID,
                participant,
            },
            policyParams: {
                policy,
                policyTagList: policyTags,
                policyRecentlyUsedTags,
                policyCategories,
                policyRecentlyUsedCategories,
            },
            recentlyUsedParams: {
                destinations: recentlyUsedDestinations,
            },
            transactionParams: {
                currency: transaction.currency,
                created: transaction.created,
                comment: trimmedComment,
                category: transaction.category,
                tag: transaction.tag,
                customUnit: transaction.comment?.customUnit,
                billable: transaction.billable,
                reimbursable: transaction.reimbursable,
                attendees: transaction.comment?.attendees,
                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            },
            policyTags: perDiemExpensePolicyTags ?? {},
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            hasViolations,
            policyRecentlyUsedCurrencies,
            quickAction,
            personalDetails,
            optimisticChatReportID,
            notifyReportID,
            formatPhoneNumber,
            delegateAccountID,
            isTrackIntentUser,
            rules,
        });
        const targetReportID = backToReport ?? activeReportID;
        // When backToReport exists we are creating the expense from chat, not the expense report, so no pending transaction registration needed.
        const isOneToTwoTransition = !backToReport && isOneToTwoTransactionTransition(isMoneyRequestReport, reportTransactions);

        if (result) {
            cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: shouldHandleNavigation});
        }
        if (result && targetReportID) {
            navigateAfterExpenseCreate({
                activeReportID: targetReportID,
                transactionID: result.transactionID,
                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                hasMultipleTransactions: reportTransactions.length > 0,
                shouldAddPendingNewTransactionIDs: (shouldHandleNavigation && targetReportID === chatReportID) || isOneToTwoTransition,
                shouldNavigate: shouldHandleNavigation,
                isLookingAroundUser,
                isSelfDMDestination,
            });
        }
        markSubmitExpenseEnd();
    }

    return {createTransaction};
}

export default usePerDiemSubmission;
