import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {SearchContextProps} from '@components/Search/types';
import * as API from '@libs/API';
import type {CompleteSplitBillParams, RevertSplitTransactionParams, SplitBillParams, SplitTransactionParams, SplitTransactionSplitsParam, StartSplitBillParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {calculateAmount as calculateIOUAmount, updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {getAllReportActions, getOriginalMessage, getReportAction, getReportActionHtml, getReportActionText, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReport,
    buildOptimisticIOUReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticReportPreview,
    generateReportID,
    getChatByParticipants,
    getParsedComment,
    getReportOrDraftReport,
    getTransactionDetails,
    hasViolations as hasViolationsReportUtils,
    isArchivedReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {buildOptimisticTransaction, getChildTransactions, isOnHold, isPerDiemRequest as isPerDiemRequestTransactionUtils} from '@libs/TransactionUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {notifyNewAction} from '@userActions/Report';
import {removeDraftSplitTransaction, removeDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant, Split, SplitExpense} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SplitShares, TransactionChanges} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    createSplitsAndOnyxData,
    dismissModalAndOpenReportInInboxTab,
    getAllPersonalDetails,
    getAllReports,
    getAllTransactions,
    getDeleteTrackExpenseInformation,
    getMoneyRequestInformation,
    getMoneyRequestParticipantsFromReport,
    getOrCreateOptimisticSplitChatReport,
    getPolicyTags,
    getReceiptError,
    getReportPreviewAction,
    getUpdateMoneyRequestParams,
    mergePolicyRecentlyUsedCategories,
    mergePolicyRecentlyUsedCurrencies,
} from './index';
import type {BuildOnyxDataForMoneyRequestKeys, MoneyRequestInformationParams, OneOnOneIOUReport, StartSplitBilActionParams} from './index';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

type UpdateSplitTransactionsParams = {
    allTransactionsList: OnyxCollection<OnyxTypes.Transaction>;
    allReportsList: OnyxCollection<OnyxTypes.Report>;
    allReportNameValuePairsList: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
    transactionData: {
        reportID: string;
        originalTransactionID: string;
        splitExpenses: SplitExpense[];
        splitExpensesTotal?: number;
    };
    searchContext?: Partial<SearchContextProps>;
    policyCategories: OnyxTypes.PolicyCategories | undefined;
    policy: OnyxTypes.Policy | undefined;
    policyRecentlyUsedCategories: OnyxTypes.RecentlyUsedCategories | undefined;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    firstIOU: OnyxEntry<OnyxTypes.ReportAction> | undefined;
    isASAPSubmitBetaEnabled: boolean;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    iouReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

type SplitBillActionsParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    amount: number;
    comment: string;
    currency: string;
    merchant: string;
    created: string;
    category?: string;
    tag?: string;
    billable?: boolean;
    reimbursable?: boolean;
    iouRequestType?: IOURequestType;
    existingSplitChatReportID?: string;
    splitShares?: SplitShares;
    taxCode?: string;
    taxAmount?: number;
    isRetry?: boolean;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

/**
 * @param amount - always in smallest currency unit
 * @param existingSplitChatReportID - Either a group DM or a expense chat
 */
function splitBill({
    participants,
    currentUserLogin,
    currentUserAccountID,
    amount,
    comment,
    currency,
    merchant,
    created,
    category = '',
    tag = '',
    billable = false,
    reimbursable = false,
    iouRequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
    existingSplitChatReportID,
    splitShares = {},
    taxCode = '',
    taxAmount = 0,
    policyRecentlyUsedCategories,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    policyRecentlyUsedTags,
}: SplitBillActionsParams) {
    const parsedComment = getParsedComment(comment);
    const {splitData, splits, onyxData} = createSplitsAndOnyxData({
        participants,
        currentUserLogin,
        currentUserAccountID,
        existingSplitChatReportID,
        transactionParams: {
            amount,
            comment: parsedComment,
            currency,
            merchant,
            created,
            category,
            tag,
            splitShares,
            billable,
            reimbursable,
            iouRequestType,
            taxCode,
            taxAmount,
        },
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        isASAPSubmitBetaEnabled,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    });

    const parameters: SplitBillParams = {
        reportID: splitData.chatReportID,
        amount,
        splits: JSON.stringify(splits),
        currency,
        comment: parsedComment,
        category,
        merchant,
        created,
        tag,
        billable,
        reimbursable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
        taxCode,
        taxAmount,
        description: parsedComment,
    };

    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.SPLIT_BILL, parameters, onyxData);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));

    dismissModalAndOpenReportInInboxTab(existingSplitChatReportID);

    notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/**
 * @param amount - always in the smallest currency unit
 */
function splitBillAndOpenReport({
    participants,
    currentUserLogin,
    currentUserAccountID,
    amount,
    comment,
    currency,
    merchant,
    created,
    category = '',
    tag = '',
    billable = false,
    reimbursable = false,
    iouRequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
    splitShares = {},
    taxCode = '',
    taxAmount = 0,
    existingSplitChatReportID,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
}: SplitBillActionsParams) {
    const parsedComment = getParsedComment(comment);
    const {splitData, splits, onyxData} = createSplitsAndOnyxData({
        participants,
        currentUserLogin,
        currentUserAccountID,
        existingSplitChatReportID,
        isASAPSubmitBetaEnabled,
        transactionParams: {
            amount,
            comment: parsedComment,
            currency,
            merchant,
            created,
            category,
            tag,
            splitShares,
            billable,
            reimbursable,
            iouRequestType,
            taxCode,
            taxAmount,
        },
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    });

    const parameters: SplitBillParams = {
        reportID: splitData.chatReportID,
        amount,
        splits: JSON.stringify(splits),
        currency,
        merchant,
        created,
        comment: parsedComment,
        category,
        tag,
        billable,
        reimbursable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
        taxCode,
        taxAmount,
        description: parsedComment,
    };

    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT, parameters, onyxData);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));

    dismissModalAndOpenReportInInboxTab(splitData.chatReportID);
    notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file [https://github.com/Expensify/App/issues/80401]
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getPolicyTagsData(policyID: string | undefined) {
    const allPolicyTags = getPolicyTags();
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

/** Used exclusively for starting a split expense request that contains a receipt, the split request will be completed once the receipt is scanned
 *  or user enters details manually.
 *
 * @param existingSplitChatReportID - Either a group DM or a expense chat
 */
function startSplitBill({
    participants,
    currentUserLogin,
    currentUserAccountID,
    comment,
    receipt,
    existingSplitChatReportID,
    billable = false,
    reimbursable = false,
    category = '',
    tag = '',
    currency,
    taxCode = '',
    taxAmount = 0,
    shouldPlaySound = true,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    quickAction,
    policyRecentlyUsedCurrencies,
}: StartSplitBilActionParams) {
    const currentUserEmailForIOUSplit = addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));
    const {splitChatReport, existingSplitChatReport} = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID);
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;
    const parsedComment = getParsedComment(comment);

    // ReportID is -2 (aka "deleted") on the group transaction
    const splitTransaction = buildOptimisticTransaction({
        transactionParams: {
            amount: 0,
            currency,
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
            comment: parsedComment,
            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            receipt,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
        },
    });

    const filename = splitTransaction.receipt?.filename;

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitChatCreatedReportAction = buildOptimisticCreatedReportAction(currentUserEmailForIOUSplit);
    const splitIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount: 0,
        currency: CONST.CURRENCY.USD,
        comment: parsedComment,
        participants,
        transactionID: splitTransaction.transactionID,
        isOwnPolicyExpenseChat,
    });

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = getReportActionText(splitIOUReportAction);
    splitChatReport.lastMessageHtml = getReportActionHtml(splitIOUReportAction);

    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: splitChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: CONST.QUICK_ACTIONS.SPLIT_SCAN,
                chatReportID: splitChatReport.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        },
        existingSplitChatReport
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitChatCreatedReportAction.reportActionID]: splitChatCreatedReportAction,
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: splitTransaction,
        },
    ];

    if (!existingSplitChatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${splitChatReport.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        });
    }

    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitChatCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [splitIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {pendingAction: null},
        },
    ];

    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${splitChatReport.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        });
    }

    const redundantParticipants: Record<number, null> = {};
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}, participants: redundantParticipants},
        });
    }

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        },
    ];

    const retryParams = {
        participants: participants.map(({icons, ...rest}) => rest),
        currentUserLogin,
        currentUserAccountID,
        comment,
        receipt,
        existingSplitChatReportID,
        billable,
        reimbursable,
        category,
        tag,
        currency,
        taxCode,
        taxAmount,
        quickAction,
        policyRecentlyUsedCurrencies,
        policyRecentlyUsedTags,
    };

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: getReceiptError(receipt, filename, undefined, undefined, CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL, retryParams),
                },
            },
        });
    } else {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitChatCreatedReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                    [splitIOUReportAction.reportActionID]: {
                        errors: getReceiptError(receipt, filename, undefined, undefined, CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL, retryParams),
                    },
                },
            },
        );
    }

    const splits: Split[] = [{email: currentUserEmailForIOUSplit, accountID: currentUserAccountID}];

    for (const participant of participants) {
        // Disabling this line since participant.login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const email = participant.isOwnPolicyExpenseChat ? '' : addSMSDomainIfPhoneNumber(participant.login || participant.text || '').toLowerCase();
        const accountID = participant.isOwnPolicyExpenseChat ? 0 : Number(participant.accountID);
        if (email === currentUserEmailForIOUSplit) {
            continue;
        }

        // When splitting with a expense chat, we only need to supply the policyID and the workspace reportID as it's needed so we can update the report preview
        if (participant.isOwnPolicyExpenseChat) {
            splits.push({
                policyID: participant.policyID,
                chatReportID: splitChatReport.reportID,
            });
            continue;
        }

        const participantPersonalDetails = getAllPersonalDetails()[participant?.accountID ?? CONST.DEFAULT_NUMBER_ID];
        if (!participantPersonalDetails) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [accountID]: {
                        accountID,
                        // Disabling this line since participant.displayName can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: formatPhoneNumber(participant.displayName || email),
                        // Disabling this line since participant.login can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        login: participant.login || participant.text,
                        isOptimisticPersonalDetail: true,
                    },
                },
            });
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }

        splits.push({
            email,
            accountID,
        });
    }

    for (const participant of participants) {
        const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(participant);
        if (!isPolicyExpenseChat) {
            continue;
        }
        const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
        const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
            // TODO: remove `allPolicyTags` from this file [https://github.com/Expensify/App/issues/80401]
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            policyTags: getPolicyTagsData(participant.policyID),
            policyRecentlyUsedTags,
            transactionTags: tag,
        });
        const optimisticRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);

        if (optimisticPolicyRecentlyUsedCategories.length > 0) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${participant.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }

        if (optimisticRecentlyUsedCurrencies.length > 0) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }

        if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${participant.policyID}`,
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    }

    // Save the new splits array into the transaction's comment in case the user calls CompleteSplitBill while offline
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
        value: {
            comment: {
                splits,
            },
        },
    });

    const parameters: StartSplitBillParams = {
        chatReportID: splitChatReport.reportID,
        reportActionID: splitIOUReportAction.reportActionID,
        transactionID: splitTransaction.transactionID,
        splits: JSON.stringify(splits),
        receipt,
        comment: parsedComment,
        category,
        tag,
        currency,
        isFromGroupDM: !existingSplitChatReport,
        billable,
        reimbursable,
        ...(existingSplitChatReport ? {} : {createdReportActionID: splitChatCreatedReportAction.reportActionID}),
        chatType: splitChatReport?.chatType,
        taxCode,
        taxAmount,
        description: parsedComment,
    };
    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }

    API.write(WRITE_COMMANDS.START_SPLIT_BILL, parameters, {optimisticData, successData, failureData});

    Navigation.dismissModalWithReport({reportID: splitChatReport.reportID});
    notifyNewAction(splitChatReport.reportID, currentUserAccountID);

    // Return the split transactionID for testing purpose
    return {splitTransactionID: splitTransaction.transactionID};
}

/** Used for editing a split expense while it's still scanning or when SmartScan fails, it completes a split expense started by startSplitBill above.
 *
 * @param chatReportID - The group chat or workspace reportID
 * @param reportAction - The split action that lives in the chatReport above
 * @param updatedTransaction - The updated **draft** split transaction
 * @param sessionAccountID - accountID of the current user
 * @param sessionEmail - email of the current user
 */
function completeSplitBill(
    chatReportID: string,
    reportAction: OnyxEntry<OnyxTypes.ReportAction>,
    updatedTransaction: OnyxEntry<OnyxTypes.Transaction>,
    sessionAccountID: number,
    isASAPSubmitBetaEnabled: boolean,
    quickAction: OnyxEntry<OnyxTypes.QuickAction>,
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    sessionEmail?: string,
) {
    if (!reportAction) {
        return;
    }

    const parsedComment = getParsedComment(Parser.htmlToMarkdown(updatedTransaction?.comment?.comment ?? ''));
    if (updatedTransaction?.comment) {
        // eslint-disable-next-line no-param-reassign
        updatedTransaction.comment.comment = parsedComment;
    }
    const currentUserEmailForIOUSplit = addSMSDomainIfPhoneNumber(sessionEmail);
    const transactionID = updatedTransaction?.transactionID;
    const unmodifiedTransaction = getAllTransactions()[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

    // Save optimistic updated transaction and action
    const optimisticData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...updatedTransaction,
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.OPEN,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [reportAction.reportActionID]: {
                    lastModified: DateUtils.getDBTime(),
                    originalMessage: {
                        whisperedTo: [],
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys | typeof ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
            value: {pendingAction: null},
        },
    ];

    const failureData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...unmodifiedTransaction,
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    const splitParticipants: Split[] = updatedTransaction?.comment?.splits ?? [];
    const amount = Number(updatedTransaction?.modifiedAmount);
    const currency = updatedTransaction?.modifiedCurrency;

    // Exclude the current user when calculating the split amount, `calculateAmount` takes it into account
    const splitAmount = calculateIOUAmount(splitParticipants.length - 1, amount ?? 0, currency ?? '', false);
    const splitTaxAmount = calculateIOUAmount(splitParticipants.length - 1, updatedTransaction?.taxAmount ?? 0, currency ?? '', false);

    const splits: Split[] = [{email: currentUserEmailForIOUSplit}];
    for (const participant of splitParticipants) {
        // Skip creating the transaction for the current user
        if (participant.email === currentUserEmailForIOUSplit) {
            continue;
        }
        const isPolicyExpenseChat = !!participant.policyID;

        if (!isPolicyExpenseChat) {
            // In case this is still the optimistic accountID saved in the splits array, return early as we cannot know
            // if there is an existing chat between the split creator and this participant
            // Instead, we will rely on Auth generating the report IDs and the user won't see any optimistic chats or reports created
            const participantPersonalDetails: OnyxTypes.PersonalDetails | null = getAllPersonalDetails()[participant?.accountID ?? CONST.DEFAULT_NUMBER_ID];
            if (!participantPersonalDetails || participantPersonalDetails.isOptimisticPersonalDetail) {
                splits.push({
                    email: participant.email,
                });
                continue;
            }
        }

        let oneOnOneChatReport: OnyxEntry<OnyxTypes.Report>;
        let isNewOneOnOneChatReport = false;
        if (isPolicyExpenseChat) {
            // The expense chat reportID is saved in the splits array when starting a split expense with a workspace
            oneOnOneChatReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.chatReportID}`];
        } else {
            const existingChatReport = getChatByParticipants(participant.accountID ? [participant.accountID, sessionAccountID] : []);
            isNewOneOnOneChatReport = !existingChatReport;
            oneOnOneChatReport =
                existingChatReport ??
                buildOptimisticChatReport({
                    participantList: participant.accountID ? [participant.accountID, sessionAccountID] : [],
                });
        }

        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport?.iouReportID ? getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const shouldCreateNewOneOnOneIOUReport = shouldCreateNewMoneyRequestReportReportUtils(oneOnOneIOUReport, oneOnOneChatReport, false);

        // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
        const optimisticTransactionID = NumberUtils.rand64();
        const optimisticExpenseReportID = generateReportID();

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            const reportTransactions = buildMinimalTransactionForFormula(
                optimisticTransactionID,
                optimisticExpenseReportID,
                updatedTransaction?.modifiedCreated,
                splitAmount,
                currency ?? '',
                updatedTransaction?.modifiedMerchant,
            );

            oneOnOneIOUReport = isPolicyExpenseChat
                ? buildOptimisticExpenseReport(
                      oneOnOneChatReport?.reportID,
                      participant.policyID,
                      sessionAccountID,
                      splitAmount,
                      currency ?? '',
                      undefined,
                      undefined,
                      optimisticExpenseReportID,
                      reportTransactions,
                  )
                : buildOptimisticIOUReport(sessionAccountID, participant.accountID ?? CONST.DEFAULT_NUMBER_ID, splitAmount, oneOnOneChatReport?.reportID, currency ?? '');
        } else if (isPolicyExpenseChat) {
            if (typeof oneOnOneIOUReport?.total === 'number') {
                // Because of the Expense reports are stored as negative values, we subtract the total from the amount
                oneOnOneIOUReport.total -= splitAmount;
            }
        } else {
            oneOnOneIOUReport = updateIOUOwnerAndTotal(oneOnOneIOUReport, sessionAccountID, splitAmount, currency ?? '');
        }

        const oneOnOneTransaction = buildOptimisticTransaction({
            existingTransactionID: optimisticTransactionID,
            originalTransactionID: transactionID,
            transactionParams: {
                amount: isPolicyExpenseChat ? -splitAmount : splitAmount,
                currency: currency ?? '',
                reportID: oneOnOneIOUReport?.reportID,
                comment: parsedComment,
                created: updatedTransaction?.modifiedCreated,
                merchant: updatedTransaction?.modifiedMerchant,
                receipt: {...updatedTransaction?.receipt, state: CONST.IOU.RECEIPT_STATE.OPEN},
                category: updatedTransaction?.category,
                tag: updatedTransaction?.tag,
                taxCode: updatedTransaction?.taxCode,
                taxAmount: isPolicyExpenseChat ? -splitTaxAmount : splitAmount,
                billable: updatedTransaction?.billable,
                reimbursable: updatedTransaction?.reimbursable,
                source: CONST.IOU.TYPE.SPLIT,
                filename: updatedTransaction?.receipt?.filename,
            },
        });
        oneOnOneIOUReport.transactionCount = (oneOnOneIOUReport.transactionCount ?? 0) + 1;

        const [oneOnOneCreatedActionForChat, oneOnOneCreatedActionForIOU, oneOnOneIOUAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
            buildOptimisticMoneyRequestEntities({
                iouReport: oneOnOneIOUReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: splitAmount,
                currency: currency ?? '',
                comment: parsedComment,
                payeeEmail: currentUserEmailForIOUSplit,
                participants: [participant],
                transactionID: oneOnOneTransaction.transactionID,
            });

        let oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport?.reportID, oneOnOneIOUReport?.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport, '', oneOnOneTransaction);
        }
        const hasViolations = hasViolationsReportUtils(oneOnOneIOUReport.reportID, transactionViolations, sessionAccountID, sessionEmail ?? '');

        const {
            optimisticData: oneOnOneOptimisticData = [],
            successData: oneOnOneSuccessData = [],
            failureData: oneOnOneFailureData = [],
        } = buildOnyxDataForMoneyRequest({
            isNewChatReport: isNewOneOnOneChatReport,
            isOneOnOneSplit: true,
            shouldCreateNewMoneyRequestReport: shouldCreateNewOneOnOneIOUReport,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: sessionAccountID,
            currentUserEmailParam: sessionEmail ?? '',
            hasViolations,
            optimisticParams: {
                chat: {
                    report: oneOnOneChatReport,
                    createdAction: oneOnOneCreatedActionForChat,
                    reportPreviewAction: oneOnOneReportPreviewAction,
                },
                iou: {
                    report: oneOnOneIOUReport,
                    createdAction: oneOnOneCreatedActionForIOU,
                    action: oneOnOneIOUAction,
                },
                transactionParams: {
                    transaction: oneOnOneTransaction,
                    transactionThreadReport: optimisticTransactionThread,
                    transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
                },
                policyRecentlyUsed: {},
            },
            quickAction,
        });

        splits.push({
            email: participant.email,
            accountID: participant.accountID,
            policyID: participant.policyID,
            iouReportID: oneOnOneIOUReport?.reportID,
            chatReportID: oneOnOneChatReport?.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        });

        optimisticData.push(...oneOnOneOptimisticData);
        successData.push(...oneOnOneSuccessData);
        failureData.push(...oneOnOneFailureData);
    }

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        created: transactionCreated,
        merchant: transactionMerchant,
        comment: transactionComment,
        category: transactionCategory,
        tag: transactionTag,
        taxCode: transactionTaxCode,
        taxAmount: transactionTaxAmount,
        billable: transactionBillable,
        reimbursable: transactionReimbursable,
    } = getTransactionDetails(updatedTransaction) ?? {};

    const parameters: CompleteSplitBillParams = {
        transactionID,
        amount: transactionAmount,
        currency: transactionCurrency,
        created: transactionCreated,
        merchant: transactionMerchant,
        comment: transactionComment,
        category: transactionCategory,
        tag: transactionTag,
        splits: JSON.stringify(splits),
        taxCode: transactionTaxCode,
        taxAmount: transactionTaxAmount,
        billable: transactionBillable,
        reimbursable: transactionReimbursable,
        description: parsedComment,
    };

    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.COMPLETE_SPLIT_BILL, parameters, {optimisticData, successData, failureData});
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));
    dismissModalAndOpenReportInInboxTab(chatReportID);
    notifyNewAction(chatReportID, sessionAccountID);
}

function updateSplitTransactions({
    allTransactionsList,
    allReportsList,
    allReportNameValuePairsList,
    transactionData,
    searchContext,
    policyCategories,
    policy,
    policyRecentlyUsedCategories,
    iouReport,
    firstIOU,
    isASAPSubmitBetaEnabled,
    currentUserPersonalDetails,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    iouReportNextStep,
}: UpdateSplitTransactionsParams) {
    const transactionReport = getReportOrDraftReport(transactionData?.reportID);
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    const expenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;

    const originalTransactionID = transactionData?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const originalTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const originalTransactionDetails = getTransactionDetails(originalTransaction);
    // TODO: remove `allPolicyTags` from this file [https://github.com/Expensify/App/issues/80401]
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policyTags = getPolicyTagsData(expenseReport?.policyID);
    const participants = getMoneyRequestParticipantsFromReport(expenseReport, currentUserPersonalDetails.accountID);
    const splitExpenses = transactionData?.splitExpenses ?? [];

    // Get all children once (including orphaned), then filter for non-orphaned
    const allChildTransactions = getChildTransactions(allTransactionsList, allReportsList, originalTransactionID, true);
    const originalChildTransactions = allChildTransactions.filter((tx) => tx?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID);
    const processedChildTransactionIDs: string[] = [];

    const splitExpensesTotal = transactionData?.splitExpensesTotal ?? 0;

    const isCreationOfSplits = originalChildTransactions.length === 0;
    const hasEditableSplitExpensesLeft = splitExpenses.some((expense) => (expense.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED);
    // Don't revert split if there are orphaned children (reportID '0') - they're still part of the split
    const isReverseSplitOperation =
        splitExpenses.length === 1 && originalChildTransactions.length > 0 && hasEditableSplitExpensesLeft && allChildTransactions.length === originalChildTransactions.length;

    let changesInReportTotal = 0;
    // Validate custom unit rate before proceeding with split
    const customUnitRateID = originalTransaction?.comment?.customUnit?.customUnitRateID;
    const isPerDiem = isPerDiemRequestTransactionUtils(originalTransaction);

    if (customUnitRateID && policy && !isPerDiem && isCreationOfSplits) {
        const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);

        // If the rate doesn't exist or is disabled, show an error and return early
        if (!customUnitRate || !customUnitRate.enabled) {
            // Show error to user
            Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.invalidRate'),
            });
            return;
        }
    }

    const splits: SplitTransactionSplitsParam =
        splitExpenses.map((split) => {
            const currentDescription = getParsedComment(Parser.htmlToMarkdown(split.description ?? ''));
            changesInReportTotal += split.amount;
            return {
                amount: split.amount,
                category: split.category ?? '',
                tag: split.tags?.[0] ?? '',
                created: split.created,
                merchant: split?.merchant ?? '',
                transactionID: split.transactionID,
                comment: {
                    comment: currentDescription,
                },
                reimbursable: split?.reimbursable,
            };
        }) ?? [];
    changesInReportTotal -= splitExpensesTotal;

    const successData = [] as OnyxUpdate[];
    const failureData = [] as OnyxUpdate[];
    const optimisticData = [] as OnyxUpdate[];

    // The split transactions can be in different reports, so we need to calculate the total for each report.
    const reportTotals = new Map<string, number>();
    const expenseReportID = expenseReport?.reportID;

    if (expenseReportID) {
        const expenseReportKey = `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`;
        const expenseReportTotal = allReportsList?.[expenseReportKey]?.total ?? expenseReport?.total ?? 0;
        reportTotals.set(expenseReportID, expenseReportTotal - changesInReportTotal);
    }

    for (const expense of splitExpenses) {
        const splitExpenseReportID = expense.reportID;
        if (!splitExpenseReportID || reportTotals.has(splitExpenseReportID)) {
            continue;
        }

        const splitExpenseReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpenseReportID}`];
        reportTotals.set(splitExpenseReportID, splitExpenseReport?.total ?? 0);
    }

    for (const [index, splitExpense] of splitExpenses.entries()) {
        const existingTransactionID = isReverseSplitOperation ? originalTransactionID : splitExpense.transactionID;
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`];
        if (splitTransaction) {
            processedChildTransactionIDs.push(splitTransaction.transactionID);
        }

        const splitReportActions = getAllReportActions(isReverseSplitOperation ? expenseReport?.reportID : splitTransaction?.reportID);
        const currentReportAction = Object.values(splitReportActions).find((action) => {
            const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
            return transactionID === existingTransactionID;
        });

        const requestMoneyInformation = {
            participantParams: {
                participant: participants.at(0) ?? ({} as Participant),
                payeeEmail: currentUserPersonalDetails?.login ?? '',
                payeeAccountID: currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            },
            policyParams: {
                policy,
                policyCategories,
                policyTags,
            },
            transactionParams: {
                amount: Math.abs(originalTransaction?.amount ?? 0),
                modifiedAmount: splitExpense.amount ?? 0,
                currency: originalTransactionDetails?.currency ?? CONST.CURRENCY.USD,
                created: splitExpense.created,
                merchant: splitExpense.merchant ?? '',
                comment: splitExpense.description,
                category: splitExpense.category,
                tag: splitExpense.tags?.[0],
                originalTransactionID,
                attendees: originalTransactionDetails?.attendees,
                source: CONST.IOU.TYPE.SPLIT,
                linkedTrackedExpenseReportAction: currentReportAction,
                pendingAction: splitTransaction ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                pendingFields: splitTransaction ? splitTransaction.pendingFields : undefined,
                reimbursable: originalTransactionDetails?.reimbursable,
                taxCode: originalTransactionDetails?.taxCode,
                taxAmount: calculateIOUAmount(splitExpenses.length - 1, originalTransactionDetails?.taxAmount ?? 0, originalTransactionDetails?.currency ?? CONST.CURRENCY.USD, false),
                billable: originalTransactionDetails?.billable,
            },
            parentChatReport: getReportOrDraftReport(getReportOrDraftReport(expenseReport?.chatReportID)?.parentReportID),
            existingTransaction: originalTransaction,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
            currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
        } as MoneyRequestInformationParams;

        if (isReverseSplitOperation) {
            requestMoneyInformation.transactionParams = {
                amount: splitExpense.amount ?? 0,
                currency: originalTransactionDetails?.currency ?? CONST.CURRENCY.USD,
                created: splitExpense.created,
                merchant: splitExpense.merchant ?? '',
                comment: splitExpense.description,
                category: splitExpense.category,
                tag: splitExpense.tags?.[0],
                attendees: originalTransactionDetails?.attendees as Attendee[],
                linkedTrackedExpenseReportAction: currentReportAction,
                taxCode: originalTransactionDetails?.taxCode,
                taxAmount: calculateIOUAmount(splitExpenses.length - 1, originalTransactionDetails?.taxAmount ?? 0, originalTransactionDetails?.currency ?? CONST.CURRENCY.USD, false),
                billable: originalTransactionDetails?.billable,
            };
            requestMoneyInformation.existingTransaction = undefined;
        }

        const {participantParams, policyParams, transactionParams, parentChatReport, existingTransaction} = requestMoneyInformation;
        const parsedComment = getParsedComment(Parser.htmlToMarkdown(transactionParams.comment ?? ''));
        transactionParams.comment = parsedComment;

        const {transactionThreadReportID, createdReportActionIDForThread, onyxData, iouAction} = getMoneyRequestInformation({
            participantParams,
            parentChatReport,
            policyParams,
            transactionParams,
            moneyRequestReportID: splitExpense?.reportID,
            existingTransaction,
            existingTransactionID,
            newReportTotal: reportTotals.get(splitExpense?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)) ?? 0,
            newNonReimbursableTotal: (transactionReport?.nonReimbursableTotal ?? 0) - changesInReportTotal,
            isSplitExpense: true,
            currentReportActionID: currentReportAction?.reportActionID,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
            currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
            transactionViolations,
            quickAction,
            shouldGenerateTransactionThreadReport: !isReverseSplitOperation,
            policyRecentlyUsedCurrencies,
        });

        let updateMoneyRequestParamsOnyxData: OnyxData<OnyxKey> = {};
        const currentSplit = splits.at(index);

        // For existing split transactions, update the field change messages
        // For new transactions, skip this step
        if (splitTransaction) {
            const existing = getTransactionDetails(splitTransaction);
            const transactionChanges = {
                ...currentSplit,
                comment: currentSplit?.comment?.comment,
            } as TransactionChanges;

            if (currentSplit) {
                currentSplit.reimbursable = splitTransaction.reimbursable;
                currentSplit.billable = splitTransaction.billable;
            }

            for (const key of Object.keys(transactionChanges)) {
                const newValue = transactionChanges[key as keyof typeof transactionChanges];
                const oldValue = existing?.[key as keyof typeof existing];
                if (newValue === oldValue) {
                    delete transactionChanges[key as keyof typeof transactionChanges];
                    // Ensure we pass the currency to getUpdateMoneyRequestParams as well, so the amount message is created correctly
                } else if (key === 'amount') {
                    transactionChanges.currency = originalTransactionDetails?.currency;
                }
            }

            if (isReverseSplitOperation) {
                delete transactionChanges.transactionID;
            }

            if (Object.keys(transactionChanges).length > 0) {
                const transactionThreadReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${isReverseSplitOperation ? splitExpense?.reportID : transactionThreadReportID}`];
                const transactionIOUReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpense?.reportID ?? transactionThreadReport?.parentReportID}`];
                const {onyxData: moneyRequestParamsOnyxData, params} = getUpdateMoneyRequestParams({
                    transactionID: existingTransactionID,
                    transactionThreadReport,
                    iouReport: transactionIOUReport,
                    transactionChanges,
                    policy,
                    policyTagList: policyTags ?? null,
                    policyCategories: policyCategories ?? null,
                    newTransactionReportID: splitExpense?.reportID,
                    policyRecentlyUsedCategories,
                    currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
                    currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
                    isASAPSubmitBetaEnabled,
                    iouReportNextStep,
                });
                if (currentSplit) {
                    currentSplit.modifiedExpenseReportActionID = params.reportActionID;
                }
                updateMoneyRequestParamsOnyxData = moneyRequestParamsOnyxData;
            }
            // For new split transactions, set the reportID once the transaction and associated report are created
        } else if (currentSplit) {
            currentSplit.reportID = splitExpense?.reportID;
        }

        if (currentSplit) {
            currentSplit.transactionThreadReportID = transactionThreadReportID;
            currentSplit.createdReportActionIDForThread = createdReportActionIDForThread;
            currentSplit.splitReportActionID = iouAction.reportActionID;
        }

        optimisticData.push(...(onyxData.optimisticData ?? []), ...(updateMoneyRequestParamsOnyxData.optimisticData ?? []));
        successData.push(...(onyxData.successData ?? []), ...(updateMoneyRequestParamsOnyxData.successData ?? []));
        failureData.push(...(onyxData.failureData ?? []), ...(updateMoneyRequestParamsOnyxData.failureData ?? []));
    }

    // All transactions that were deleted in the split list will be marked as deleted in onyx
    const undeletedTransactions = originalChildTransactions.filter(
        (currentTransaction) => !processedChildTransactionIDs.includes(currentTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID),
    );

    for (const undeletedTransaction of undeletedTransactions) {
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${undeletedTransaction?.transactionID}`];
        const splitReportActions = getAllReportActions(splitTransaction?.reportID);
        const reportNameValuePairs = allReportNameValuePairsList?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${splitTransaction?.reportID}`];
        const isReportArchived = isArchivedReport(reportNameValuePairs);
        const currentReportAction = Object.values(splitReportActions).find((action) => {
            const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
            return transactionID === undeletedTransaction?.transactionID;
        }) as ReportAction;

        const {
            optimisticData: deleteExpenseOptimisticData,
            failureData: deleteExpenseFailureData,
            successData: deleteExpenseSuccessData,
        } = getDeleteTrackExpenseInformation(
            splitTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
            undeletedTransaction?.transactionID,
            currentReportAction,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            isReportArchived,
        );

        optimisticData.push(...(deleteExpenseOptimisticData ?? []));
        successData.push(...(deleteExpenseSuccessData ?? []));
        failureData.push(...(deleteExpenseFailureData ?? []));
    }

    if (!isReverseSplitOperation) {
        // Use SET to update originalTransaction more quickly in Onyx as compared to MERGE to prevent UI inconsistency
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: {
                ...originalTransaction,
                reportID: CONST.REPORT.SPLIT_REPORT_ID,
            },
        });

        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: originalTransaction,
        });

        if (firstIOU) {
            const updatedReportAction = {
                [firstIOU.reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    previousMessage: firstIOU.message,
                    message: [
                        {
                            type: 'COMMENT',
                            html: '',
                            text: '',
                            isEdited: true,
                            isDeletedParentAction: true,
                        },
                    ],
                    originalMessage: {
                        IOUTransactionID: null,
                    },
                    errors: null,
                },
            };
            const transactionThread = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${firstIOU.childReportID}`] ?? null;
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${firstIOU?.childReportID}`,
                value: null,
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: updatedReportAction,
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [firstIOU.reportActionID]: {
                        ...firstIOU,
                        pendingAction: null,
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${firstIOU?.childReportID}`,
                value: transactionThread ?? null,
            });
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContext?.currentSearchHash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`]: null,
                },
            },
        });

        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContext?.currentSearchHash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`]: originalTransaction,
                },
            },
        });
    } else {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: {
                errors: null,
            },
        });
    }

    if (isReverseSplitOperation) {
        const parameters = {
            ...splits.at(0),
            comment: splits.at(0)?.comment?.comment,
        } as RevertSplitTransactionParams;
        API.write(WRITE_COMMANDS.REVERT_SPLIT_TRANSACTION, parameters, {optimisticData, successData, failureData});
    } else {
        // Prepare splitApiParams for the Transaction_Split API call which requires a specific format for the splits
        // The format is: splits[0][amount], splits[0][category], splits[0][tag] etc.
        const splitApiParams = {} as Record<string, string | number | boolean>;
        for (const [i, split] of splits.entries()) {
            for (const [key, value] of Object.entries(split)) {
                splitApiParams[`splits[${i}][${key}]`] = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
            }
        }
        if (isCreationOfSplits) {
            const isTransactionOnHold = isOnHold(originalTransaction);

            if (isTransactionOnHold) {
                const holdReportActionIDs: string[] = [];
                const holdReportActionCommentIDs: string[] = [];
                const transactionReportActions = getAllReportActions(firstIOU?.childReportID);
                const holdReportAction = getReportAction(firstIOU?.childReportID, `${originalTransaction?.comment?.hold ?? ''}`);

                const holdReportActionComment = holdReportAction
                    ? Object.values(transactionReportActions ?? {}).find(
                          (action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && action?.timestamp === holdReportAction.timestamp,
                      )
                    : undefined;

                if (holdReportAction && holdReportActionComment) {
                    // Loop through all split expenses and add optimistic hold report actions for each split
                    for (const [index, splitExpense] of splits.entries()) {
                        const splitReportID = splitExpense?.transactionThreadReportID;
                        if (!splitReportID) {
                            continue;
                        }

                        // Generate new IDs and timestamps for each split
                        const newHoldReportActionID = NumberUtils.rand64();
                        const newHoldReportActionCommentID = NumberUtils.rand64();
                        const timestamp = DateUtils.getDBTime();
                        const reportActionTimestamp = DateUtils.addMillisecondsFromDateTime(timestamp, 1);

                        // Store IDs for API parameters
                        holdReportActionIDs[index] = newHoldReportActionID;
                        holdReportActionCommentIDs[index] = newHoldReportActionCommentID;

                        // Create new optimistic hold report action with new ID and timestamp, keeping other information
                        const newHoldReportAction = {
                            ...holdReportAction,
                            reportActionID: newHoldReportActionID,
                            created: timestamp,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        };

                        // Create new optimistic hold report action comment with new ID and timestamp, keeping other information
                        const newHoldReportActionComment = {
                            ...holdReportActionComment,
                            reportActionID: newHoldReportActionCommentID,
                            created: reportActionTimestamp,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        };

                        // Add to optimisticData for this split's reportActions
                        optimisticData.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitReportID}`,
                            value: {
                                [newHoldReportActionID]: newHoldReportAction,
                                [newHoldReportActionCommentID]: newHoldReportActionComment,
                            },
                        });

                        // Add successData to clear pendingAction after API call succeeds
                        successData.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitReportID}`,
                            value: {
                                [newHoldReportActionID]: {pendingAction: null},
                                [newHoldReportActionCommentID]: {pendingAction: null},
                            },
                        });

                        // Add failureData to remove optimistic hold report actions if the request fails
                        failureData.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitReportID}`,
                            value: {
                                [newHoldReportActionID]: null,
                                [newHoldReportActionCommentID]: null,
                            },
                        });
                    }

                    // Add hold report action IDs to API parameters
                    for (const [i, holdReportActionID] of holdReportActionIDs.entries()) {
                        if (holdReportActionID) {
                            splitApiParams[`splits[${i}][holdReportActionID]`] = holdReportActionID;
                        }
                    }
                    for (const [i, holdReportActionCommentID] of holdReportActionCommentIDs.entries()) {
                        if (holdReportActionCommentID) {
                            splitApiParams[`splits[${i}][holdReportActionCommentID]`] = holdReportActionCommentID;
                        }
                    }
                }
            }
        }

        const splitParameters: SplitTransactionParams = {
            ...splitApiParams,
            transactionID: originalTransactionID,
        };

        if (isCreationOfSplits) {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            API.write(WRITE_COMMANDS.SPLIT_TRANSACTION, splitParameters, {optimisticData, successData, failureData});
        } else {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            API.write(WRITE_COMMANDS.UPDATE_SPLIT_TRANSACTION, splitParameters, {optimisticData, successData, failureData});
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftSplitTransaction(originalTransactionID));
}

function updateSplitTransactionsFromSplitExpensesFlow(params: UpdateSplitTransactionsParams) {
    updateSplitTransactions(params);
    const transactionReport = getReportOrDraftReport(params.transactionData?.reportID);
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    const expenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;
    const isSearchPageTopmostFullScreenRoute = isSearchTopmostFullScreenRoute();
    const transactionThreadReportID = params.firstIOU?.childReportID;
    const transactionThreadReportScreen = Navigation.getReportRouteByID(transactionThreadReportID);

    // Reset selected transactions in search after saving split expenses
    const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
    const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;
    if (isUserOnSearchPage) {
        params?.searchContext?.clearSelectedTransactions?.(undefined, true);
    } else {
        params?.searchContext?.clearSelectedTransactions?.(true);
    }

    if (isSearchPageTopmostFullScreenRoute || !transactionReport?.parentReportID) {
        Navigation.dismissToSuperWideRHP();

        // After the modal is dismissed, remove the transaction thread report screen
        // to avoid navigating back to a report removed by the split transaction.
        requestAnimationFrame(() => {
            if (!transactionThreadReportScreen?.key) {
                return;
            }

            Navigation.removeScreenByKey(transactionThreadReportScreen.key);
        });

        return;
    }
    Navigation.dismissModalWithReport({reportID: expenseReport?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)});

    // After the modal is dismissed, remove the transaction thread report screen
    // to avoid navigating back to a report removed by the split transaction.
    requestAnimationFrame(() => {
        if (!transactionThreadReportScreen?.key) {
            return;
        }

        Navigation.removeScreenByKey(transactionThreadReportScreen.key);
    });
}

export {completeSplitBill, splitBill, splitBillAndOpenReport, startSplitBill, updateSplitTransactions, updateSplitTransactionsFromSplitExpensesFlow};

export type {SplitBillActionsParams, UpdateSplitTransactionsParams};
