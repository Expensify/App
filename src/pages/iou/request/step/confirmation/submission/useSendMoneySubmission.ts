import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';

import {resolveOptimisticChatReportID} from '@libs/IOUUtils';
import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';

import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';

import CONST from '@src/CONST';
import type {QuickAction, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import type {SendMoneyOptions} from './types';

type UseSendMoneySubmissionParams = {
    transaction: OnyxEntry<Transaction>;
    receiptFiles: Record<string, Receipt>;
    report: OnyxEntry<Report>;
    participants: Participant[];
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    setIsConfirmed: (isConfirmed: boolean) => void;

    /** TEMP: hoisted in useExpenseSubmission so these Onyx keys open once across all mounted submission hooks.
     *  Read them here again once the page forks into per-path variants and only one hook mounts. */
    quickAction: OnyxEntry<QuickAction>;
    reportTransactions: Transaction[];
    onExpenseWriteWillStart?: () => void;
};

function useSendMoneySubmission({
    transaction,
    receiptFiles,
    report,
    participants,
    currentUserPersonalDetails,
    setIsConfirmed,
    quickAction,
    reportTransactions,
    onExpenseWriteWillStart,
}: UseSendMoneySubmissionParams) {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();

    function sendMoney(paymentMethod: PaymentMethodType | undefined, options?: SendMoneyOptions) {
        const {shouldHandleNavigation = true, resolvedReportIDs, shouldStartTracking = true, shouldDeferForSearch = false} = options ?? {};
        const currency = transaction?.currency;
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
        const participant = participants?.at(0);

        if (!participant || !transaction?.amount || !currency) {
            return;
        }

        const {optimisticChatReportID, chatReportID} =
            resolvedReportIDs ?? resolveOptimisticChatReportID([participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID], report);
        // An explicit optimistic ID means the selected recipient has no chat yet. Do not let a stale page-level
        // report override that ID in getSendMoneyParams when the recipient changed without remounting this screen.
        const sendMoneyReport = optimisticChatReportID ? undefined : report;
        const sendMoneyParams = {
            getCurrencyDecimals,
            report: sendMoneyReport,
            quickAction,
            amount: transaction.amount,
            currency,
            comment: trimmedComment,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            recipient: participant,
            created: transaction.created,
            merchant: transaction.merchant,
            receipt: receiptFiles[transaction.transactionID],
            optimisticChatReportID,
            shouldStartTracking,
            shouldDeferForSearch,
            delegateAccountID,
        };

        if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            onExpenseWriteWillStart?.();
            setIsConfirmed(true);
            sendMoneyElsewhere(sendMoneyParams);
        } else if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            onExpenseWriteWillStart?.();
            setIsConfirmed(true);
            sendMoneyWithWallet(sendMoneyParams);
        } else {
            return;
        }
        if (shouldHandleNavigation) {
            dismissModalAndOpenReportInInboxTab(chatReportID, undefined, reportTransactions.length > 0);
        }
    }

    return {sendMoney};
}

export default useSendMoneySubmission;
