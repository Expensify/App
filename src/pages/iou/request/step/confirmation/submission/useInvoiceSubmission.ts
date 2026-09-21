import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';

import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {getIsFromGlobalCreate} from '@libs/TransactionUtils';

import {getReceiverType, sendInvoice} from '@userActions/IOU/SendInvoice';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import type {CreateTransactionParams, SubmissionHandle} from './types';
import type {SubmissionRecentlyUsedData} from './useSubmissionRecentlyUsedData';

type UseInvoiceSubmissionParams = {
    transaction: OnyxEntry<Transaction>;
    receiptFiles: Record<string, Receipt>;
    report: OnyxEntry<Report>;
    reportID: string;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    draftTransactionIDs: string[] | undefined;

    /** TEMP: hoisted in useExpenseSubmission so these Onyx keys open once across all mounted submission hooks.
     *  Read them here again once the page forks into per-path variants and only one hook mounts. */
    recentlyUsedData: SubmissionRecentlyUsedData;
    policyTags: OnyxEntry<PolicyTagLists>;
};

function useInvoiceSubmission({
    transaction,
    receiptFiles,
    report,
    reportID,
    policy,
    policyCategories,
    currentUserPersonalDetails,
    action,
    draftTransactionIDs,
    recentlyUsedData,
    policyTags,
}: UseInvoiceSubmissionParams): SubmissionHandle {
    const {formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();

    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = recentlyUsedData;

    const receiverParticipant = transaction?.participants?.find((p) => p?.accountID) ?? report?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST.DEFAULT_NUMBER_ID;
    const receiverType = getReceiverType(receiverParticipant);
    const senderWorkspaceID = transaction?.participants?.find((p) => p?.isSender)?.policyID;
    const [senderWorkspacePolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${senderWorkspaceID}`);
    const existingInvoiceReport = useParticipantsInvoiceReport(receiverAccountID, receiverType, senderWorkspaceID);

    function createTransaction({shouldHandleNavigation = true}: CreateTransactionParams) {
        const currentTransactionReceiptFile = transaction?.transactionID ? receiptFiles[transaction.transactionID] : undefined;
        const invoiceChatReport = !isEmptyObject(report) && report?.reportID ? report : existingInvoiceReport;
        const invoiceChatReportID = invoiceChatReport ? undefined : reportID;

        sendInvoice({
            getCurrencyDecimals,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            transaction,
            policyRecentlyUsedCurrencies,
            invoiceChatReport,
            invoiceChatReportID,
            receiptFile: currentTransactionReceiptFile,
            policy,
            policyTagList: policyTags,
            policyCategories,
            policyRecentlyUsedCategories,
            isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            policyRecentlyUsedTags,
            senderPolicyTags: senderWorkspacePolicyTags ?? {},
            formatPhoneNumber,
            delegateAccountID,
        });
        if (shouldHandleNavigation) {
            cleanupAndNavigateAfterExpenseCreate({
                report: undefined,
                action,
                draftTransactionIDs,
                transactionID: transaction?.transactionID,
                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                optimisticChatReportID: invoiceChatReport?.reportID ?? invoiceChatReportID,
                isInvoice: true,
            });
        } else {
            cleanupAfterExpenseCreate({draftTransactionIDs});
        }
        markSubmitExpenseEnd();
    }

    return {createTransaction};
}

export default useInvoiceSubmission;
