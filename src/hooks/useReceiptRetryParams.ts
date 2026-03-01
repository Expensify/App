import type {OnyxEntry} from 'react-native-onyx';
import {isPolicyExpenseChat as isPolicyExpenseChatReportUtils} from '@libs/ReportUtils';
import type {CreateTrackExpenseParams, RequestMoneyInformation} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type ReceiptRetryAction = {
    action: string;
    retryParams: string;
};

function useReceiptRetryParams(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isTrackExpense: boolean,
): ReceiptRetryAction | undefined {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [recentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const {isBetaEnabled} = usePermissions();

    const currentUserAccountID = session?.accountID;
    if (!currentUserAccountID || !transaction) {
        return undefined;
    }

    const payeeAccountID = iouReport?.ownerAccountID ?? currentUserAccountID;
    const payeeEmail = personalDetails?.[payeeAccountID]?.login ?? session?.email;
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const commonPolicyParams = {policy, policyCategories, policyTagList};

    if (isTrackExpense) {
        const params: CreateTrackExpenseParams = {
            report: undefined,
            isDraftPolicy: false,
            participantParams: {payeeEmail, payeeAccountID, participant: {accountID: payeeAccountID, login: payeeEmail}},
            policyParams: commonPolicyParams,
            transactionParams: {
                amount: transaction.amount,
                currency: transaction.currency,
                created: transaction.created,
                merchant: transaction.merchant,
                comment: transaction.comment?.comment,
                category: transaction.category,
                tag: transaction.tag,
                taxCode: transaction.taxCode,
                taxAmount: transaction.taxAmount,
                billable: transaction.billable,
                reimbursable: transaction.reimbursable,
                receipt: undefined,
                attendees: transaction.comment?.attendees,
                customUnitRateID: transaction.comment?.customUnit?.customUnitRateID,
            },
            isRetry: true,
            shouldPlaySound: false,
            shouldHandleNavigation: false,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: session?.email ?? '',
            introSelected,
            activePolicyID,
            quickAction,
            recentWaypoints,
            betas,
        };
        return {action: CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams: JSON.stringify(params)};
    }

    const isPolicyChat = isPolicyExpenseChatReportUtils(chatReport);
    // For policy expense chats, accountID must be 0 and login undefined —
    // the server derives the actual payer from the chatReportID.
    const participant = isPolicyChat
        ? {accountID: CONST.DEFAULT_NUMBER_ID, isPolicyExpenseChat: true as const, reportID: chatReport?.reportID}
        : {accountID: iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID, login: iouReport?.managerID ? personalDetails?.[iouReport.managerID]?.login : undefined};
    const params: RequestMoneyInformation = {
        report: undefined,
        existingIOUReport: undefined,
        participantParams: {payeeEmail, payeeAccountID, participant},
        policyParams: commonPolicyParams,
        transactionParams: {
            amount: transaction.amount,
            currency: transaction.currency,
            created: transaction.created,
            merchant: transaction.merchant,
            comment: transaction.comment?.comment,
            category: transaction.category,
            tag: transaction.tag,
            taxCode: transaction.taxCode,
            taxAmount: transaction.taxAmount,
            billable: transaction.billable,
            reimbursable: transaction.reimbursable,
            customUnitRateID: transaction.comment?.customUnit?.customUnitRateID,
            receipt: undefined,
            attendees: transaction.comment?.attendees,
            waypoints: transaction.comment?.waypoints,
            type: transaction.comment?.type,
            count: transaction.comment?.units?.count,
            rate: transaction.comment?.units?.rate,
            unit: transaction.comment?.units?.unit,
        },
        shouldGenerateTransactionThreadReport: true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam: currentUserAccountID,
        currentUserEmailParam: session?.email ?? '',
        transactionViolations: {},
        quickAction,
        policyRecentlyUsedCurrencies: recentlyUsedCurrencies ?? [],
        existingTransactionDraft: undefined,
        draftTransactionIDs: [],
        isSelfTourViewed: false,
        betas,
        personalDetails,
        isRetry: true,
        shouldPlaySound: false,
        shouldHandleNavigation: false,
    };
    return {action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams: JSON.stringify(params)};
}

export default useReceiptRetryParams;
