import {eachDayOfInterval, format} from 'date-fns';
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {SearchContextProps} from '@components/Search/types';
import * as API from '@libs/API';
import type {CompleteSplitBillParams, RevertSplitTransactionParams, SplitBillParams, SplitTransactionParams, SplitTransactionSplitsParam, StartSplitBillParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {calculateAmount as calculateIOUAmount, updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
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
import {
    buildOptimisticTransaction,
    getAmount,
    getChildTransactions,
    getCurrency,
    getOriginalTransactionWithSplitInfo,
    getUpdatedTransaction,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isOnHold,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
} from '@libs/TransactionUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {notifyNewAction} from '@userActions/Report';
import {removeDraftSplitTransaction, removeDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import DistanceRequestUtils from '@src/libs/DistanceRequestUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant, Split, SplitExpense} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Unit} from '@src/types/onyx/Policy';
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
    getUserAccountID,
    mergePolicyRecentlyUsedCategories,
    mergePolicyRecentlyUsedCurrencies,
} from './index';
import type {BuildOnyxDataForMoneyRequestKeys, MoneyRequestInformationParams, OneOnOneIOUReport, StartSplitBilActionParams, UpdateMoneyRequestDataKeys} from './index';

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
    betas: OnyxEntry<OnyxTypes.Beta[]>;
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
    betas: OnyxEntry<OnyxTypes.Beta[]>;
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
    betas,
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
        betas,
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

    notifyNewAction(splitData.chatReportID, undefined, true);
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
    betas,
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
        betas,
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
    notifyNewAction(splitData.chatReportID, undefined, true);
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

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
            | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
        >
    > = [
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
    notifyNewAction(splitChatReport.reportID, undefined, true);

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
    betas: OnyxEntry<OnyxTypes.Beta[]>,
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
                ? buildOptimisticExpenseReport({
                      chatReportID: oneOnOneChatReport?.reportID,
                      policyID: participant.policyID,
                      payeeAccountID: sessionAccountID,
                      total: splitAmount,
                      currency: currency ?? '',
                      optimisticIOUReportID: optimisticExpenseReportID,
                      reportTransactions,
                      betas,
                  })
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
    notifyNewAction(chatReportID, undefined, true);
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
    betas,
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

    const onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys | UpdateMoneyRequestDataKeys> = {
        successData: [],
        failureData: [],
        optimisticData: [],
    };

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
            betas,
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

        const {
            transactionThreadReportID,
            createdReportActionIDForThread,
            onyxData: moneyRequestInformationOnyxData,
            iouAction,
        } = getMoneyRequestInformation({
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
            betas,
        });

        let updateMoneyRequestParamsOnyxData: OnyxData<UpdateMoneyRequestDataKeys> = {};
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

        onyxData.optimisticData?.push(...(moneyRequestInformationOnyxData.optimisticData ?? []), ...(updateMoneyRequestParamsOnyxData.optimisticData ?? []));
        onyxData.successData?.push(...(moneyRequestInformationOnyxData.successData ?? []), ...(updateMoneyRequestParamsOnyxData.successData ?? []));
        onyxData.failureData?.push(...(moneyRequestInformationOnyxData.failureData ?? []), ...(updateMoneyRequestParamsOnyxData.failureData ?? []));
    }

    // All transactions that were deleted in the split list will be marked as deleted in onyx
    const undeletedTransactions = originalChildTransactions.filter(
        (currentTransaction) => !processedChildTransactionIDs.includes(currentTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID),
    );

    for (const undeletedTransaction of undeletedTransactions) {
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${undeletedTransaction?.transactionID}`];
        const splitReportActions = getAllReportActions(splitTransaction?.reportID);
        const reportNameValuePairs = allReportNameValuePairsList?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${splitTransaction?.reportID}`];
        const splitTransactionReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitTransaction?.reportID}`];
        const isReportArchived = isArchivedReport(reportNameValuePairs);
        const currentReportAction = Object.values(splitReportActions).find((action) => {
            const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
            return transactionID === undeletedTransaction?.transactionID;
        }) as ReportAction;

        // For a reverse split operation (i.e. deleting one transaction from a 2-split), the other split(undeleted)
        // transaction also gets marked for deletion optimistically. This causes the undeleted split to remain visible,
        // resulting in 3 transactions(deleted, undeleted, and original) being shown at the same time when offline.
        // Since original transaction will be reverted and both splits will eventually be deleted, we remove
        // the undeleted split entirely instead of marking it for deletion.
        const forceDeleteSplitTransactionID = isReverseSplitOperation ? splitExpenses.at(0)?.transactionID : undefined;

        const {
            optimisticData: deleteExpenseOptimisticData,
            failureData: deleteExpenseFailureData,
            successData: deleteExpenseSuccessData,
        } = getDeleteTrackExpenseInformation(
            splitTransactionReport,
            undeletedTransaction?.transactionID,
            currentReportAction,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            isReportArchived || undeletedTransaction?.transactionID === forceDeleteSplitTransactionID,
        );

        onyxData.optimisticData?.push(...(deleteExpenseOptimisticData ?? []));
        onyxData.successData?.push(...(deleteExpenseSuccessData ?? []));
        onyxData.failureData?.push(...(deleteExpenseFailureData ?? []));
    }

    if (!isReverseSplitOperation) {
        // Use SET to update originalTransaction more quickly in Onyx as compared to MERGE to prevent UI inconsistency
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: {
                ...originalTransaction,
                reportID: CONST.REPORT.SPLIT_REPORT_ID,
            },
        });

        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        onyxData.failureData?.push({
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
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${firstIOU?.childReportID}`,
                value: null,
            });
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: updatedReportAction,
            });

            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [firstIOU.reportActionID]: {
                        ...firstIOU,
                        pendingAction: null,
                    },
                },
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${firstIOU?.childReportID}`,
                value: transactionThread ?? null,
            });
        }

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContext?.currentSearchHash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`]: null,
                },
            },
        });

        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContext?.currentSearchHash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`]: originalTransaction,
                },
            },
        });
    } else {
        onyxData.optimisticData?.push({
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
        API.write(WRITE_COMMANDS.REVERT_SPLIT_TRANSACTION, parameters, onyxData);
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
                        onyxData.optimisticData?.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitReportID}`,
                            value: {
                                [newHoldReportActionID]: newHoldReportAction,
                                [newHoldReportActionCommentID]: newHoldReportActionComment,
                            },
                        });

                        // Add successData to clear pendingAction after API call succeeds
                        onyxData.successData?.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitReportID}`,
                            value: {
                                [newHoldReportActionID]: {pendingAction: null},
                                [newHoldReportActionCommentID]: {pendingAction: null},
                            },
                        });

                        // Add failureData to remove optimistic hold report actions if the request fails
                        onyxData.failureData?.push({
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
            API.write(WRITE_COMMANDS.SPLIT_TRANSACTION, splitParameters, onyxData);
        } else {
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            API.write(WRITE_COMMANDS.UPDATE_SPLIT_TRANSACTION, splitParameters, onyxData);
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
        Navigation.navigateBackToLastSuperWideRHPScreen();

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

/**
 * Sets the `splitShares` map that holds individual shares of a split bill
 */
function setSplitShares(transaction: OnyxEntry<OnyxTypes.Transaction>, amount: number, currency: string, newAccountIDs: number[]) {
    if (!transaction) {
        return;
    }

    // For pending split distance requests, we don't want to set split shares to zero amount
    // instead we will reset it which would mean splitting the amount equally when the pending distance is resolved.
    if (isDistanceRequestTransactionUtils(transaction) && !amount) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares: null});
        return;
    }

    const oldAccountIDs = Object.keys(transaction.splitShares ?? {}).map((key) => Number(key));

    // Create an array containing unique IDs of the current transaction participants and the new ones
    // The current userAccountID might not be included in newAccountIDs if this is called from the participants step using Global Create
    // If this is called from an existing group chat, it'll be included. So we manually add them to account for both cases.
    const accountIDs = [...new Set<number>([getUserAccountID(), ...newAccountIDs, ...oldAccountIDs])];

    const splitShares: SplitShares = accountIDs.reduce((acc: SplitShares, accountID): SplitShares => {
        // We want to replace the contents of splitShares to contain only `newAccountIDs` entries
        // In the case of going back to the participants page and removing a participant
        // a simple merge will have the previous participant still present in the splitShares object
        // So we manually set their entry to null
        if (!newAccountIDs.includes(accountID) && accountID !== getUserAccountID()) {
            acc[accountID] = null;
            return acc;
        }

        const isPayer = accountID === getUserAccountID();
        const participantsLength = newAccountIDs.includes(getUserAccountID()) ? newAccountIDs.length - 1 : newAccountIDs.length;
        const splitAmount = calculateIOUAmount(participantsLength, amount, currency, isPayer);
        acc[accountID] = {
            amount: splitAmount,
            isModified: false,
        };
        return acc;
    }, {});

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares});
}

function resetSplitShares(transaction: OnyxEntry<OnyxTypes.Transaction>, newAmount?: number, currency?: string) {
    if (!transaction) {
        return;
    }
    const accountIDs = Object.keys(transaction.splitShares ?? {}).map((key) => Number(key));
    if (!accountIDs) {
        return;
    }
    setSplitShares(transaction, newAmount ?? transaction.amount, currency ?? transaction.currency, accountIDs);
}

function setDraftSplitTransaction(
    transactionID: string | undefined,
    splitTransactionDraft: OnyxEntry<OnyxTypes.Transaction>,
    transactionChanges: TransactionChanges = {},
    policy?: OnyxEntry<OnyxTypes.Policy>,
) {
    if (!transactionID) {
        return undefined;
    }
    let draftSplitTransaction = splitTransactionDraft;

    if (!draftSplitTransaction) {
        draftSplitTransaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    }

    const updatedTransaction = draftSplitTransaction
        ? getUpdatedTransaction({
              transaction: draftSplitTransaction,
              transactionChanges,
              isFromExpenseReport: false,
              shouldUpdateReceiptState: false,
              policy,
          })
        : null;

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, updatedTransaction);
}

/**
 * Adjusts remaining unmodified shares when another share is modified
 * E.g. if total bill is $100 and split between 3 participants, when the user changes the first share to $50, the remaining unmodified shares will become $25 each.
 */
function adjustRemainingSplitShares(transaction: NonNullable<OnyxTypes.Transaction>) {
    const modifiedShares = Object.keys(transaction.splitShares ?? {}).filter((key: string) => transaction?.splitShares?.[Number(key)]?.isModified);

    if (!modifiedShares.length) {
        return;
    }

    const sumOfManualShares = modifiedShares
        .map((key: string): number => transaction?.splitShares?.[Number(key)]?.amount ?? 0)
        .reduce((prev: number, current: number): number => prev + current, 0);

    const unmodifiedSharesAccountIDs = Object.keys(transaction.splitShares ?? {})
        .filter((key: string) => !transaction?.splitShares?.[Number(key)]?.isModified)
        .map((key: string) => Number(key));

    const remainingTotal = transaction.amount - sumOfManualShares;
    if (remainingTotal < 0) {
        return;
    }

    const splitShares: SplitShares = unmodifiedSharesAccountIDs.reduce((acc: SplitShares, accountID: number, index: number): SplitShares => {
        const splitAmount = calculateIOUAmount(unmodifiedSharesAccountIDs.length - 1, remainingTotal, transaction.currency, index === 0);
        acc[accountID] = {
            amount: splitAmount,
        };
        return acc;
    }, {});

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares});
}

/**
 * Sets an individual split share of the participant accountID supplied
 */
function setIndividualShare(transactionID: string, participantAccountID: number, participantShare: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        splitShares: {
            [participantAccountID]: {amount: participantShare, isModified: true},
        },
    });
}

/**
 * Calculate merchant for distance transactions based on distance and rate
 */
function getDistanceMerchantForSplitExpense(distanceInUnits: number, unit: Unit | undefined, rate: number | undefined, currency: string, transactionCurrency?: string): string {
    if (!rate || rate <= 0 || !unit) {
        return '';
    }

    const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distanceInUnits, unit);
    const currencyForMerchant = currency ?? transactionCurrency ?? CONST.CURRENCY.USD;
    const currentLocale = IntlStore.getCurrentLocale();
    return DistanceRequestUtils.getDistanceMerchant(
        true,
        distanceInMeters,
        unit,
        rate,
        currencyForMerchant,
        (phrase, ...parameters) => Localize.translate(currentLocale, phrase, ...parameters),
        (digit) => toLocaleDigit(currentLocale, digit),
        getCurrencySymbol,
    );
}

function initSplitExpenseItemData(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    transactionReport: OnyxEntry<OnyxTypes.Report>,
    {amount, transactionID, reportID, created, isManuallyEdited}: {amount?: number; transactionID?: string; reportID?: string; created?: string; isManuallyEdited?: boolean} = {},
): SplitExpense {
    const transactionDetails = getTransactionDetails(transaction);

    return {
        transactionID: transactionID ?? transactionDetails?.transactionID ?? String(CONST.DEFAULT_NUMBER_ID),
        amount: amount ?? transactionDetails?.amount ?? 0,
        description: transactionDetails?.comment,
        category: transactionDetails?.category,
        tags: transaction?.tag ? [transaction?.tag] : [],
        created: created ?? transactionDetails?.created ?? DateUtils.formatWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
        merchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? ''),
        statusNum: transactionReport?.statusNum ?? 0,
        reportID: reportID ?? transaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
        reimbursable: transactionDetails?.reimbursable,
        isManuallyEdited: isManuallyEdited ?? false,
    };
}

/**
 * Create a draft transaction to set up split expense details for the split expense flow
 */
function initSplitExpense(transactions: OnyxCollection<OnyxTypes.Transaction>, reports: OnyxCollection<OnyxTypes.Report>, transaction: OnyxEntry<OnyxTypes.Transaction>) {
    if (!transaction) {
        return;
    }

    const reportID = transaction.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const originalTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    if (isExpenseSplit) {
        const relatedTransactions = getChildTransactions(transactions, reports, originalTransactionID);
        const transactionDetails = getTransactionDetails(originalTransaction);
        const splitExpenses = relatedTransactions.map((currentTransaction) => {
            const currentTransactionReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`];
            return initSplitExpenseItemData(currentTransaction, currentTransactionReport, {isManuallyEdited: true});
        });
        const draftTransaction = buildOptimisticTransaction({
            originalTransactionID,
            transactionParams: {
                splitExpenses,
                splitExpensesTotal: splitExpenses.reduce((total, item) => total + item.amount, 0),
                amount: transactionDetails?.amount ?? 0,
                currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
                participants: transaction?.participants,
                merchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? ''),
                attendees: transactionDetails?.attendees as Attendee[],
                reportID,
                reimbursable: transactionDetails?.reimbursable,
            },
        });

        Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, draftTransaction);
        if (isSearchTopmostFullScreenRoute()) {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        }
        return;
    }

    const transactionDetails = getTransactionDetails(transaction);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;
    const transactionReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];

    const splitExpenses = [
        initSplitExpenseItemData(transaction, transactionReport, {
            amount: calculateIOUAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', false) ?? 0,
            transactionID: NumberUtils.rand64(),
            isManuallyEdited: false,
        }),
        initSplitExpenseItemData(transaction, transactionReport, {
            amount: calculateIOUAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', true) ?? 0,
            transactionID: NumberUtils.rand64(),
            isManuallyEdited: false,
        }),
    ];

    const draftTransaction = buildOptimisticTransaction({
        originalTransactionID: transaction.transactionID,
        transactionParams: {
            splitExpenses,
            splitExpensesTotal: splitExpenses.reduce((total, item) => total + item.amount, 0),
            amount: transactionDetailsAmount,
            currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
            merchant: transactionDetails?.merchant ?? '',
            participants: transaction?.participants,
            attendees: transactionDetails?.attendees as Attendee[],
            reportID,
            reimbursable: transactionDetails?.reimbursable,
        },
    });

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction?.transactionID}`, draftTransaction);

    if (isSearchTopmostFullScreenRoute()) {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, transaction.transactionID, undefined, Navigation.getActiveRoute()));
    } else {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, transaction.transactionID, undefined, Navigation.getActiveRoute()));
    }
}

/**
 * Create a draft transaction to set up split expense details for edit split details
 */
function initDraftSplitExpenseDataForEdit(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, splitExpenseTransactionID: string, reportID: string) {
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }
    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const originalTransaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const splitTransactionData = draftTransaction?.comment?.splitExpenses?.find((item) => item.transactionID === splitExpenseTransactionID);

    const transactionDetails = getTransactionDetails(originalTransaction);

    const editDraftTransaction = buildOptimisticTransaction({
        existingTransactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        originalTransactionID,
        transactionParams: {
            amount: Number(splitTransactionData?.amount),
            currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
            comment: splitTransactionData?.description,
            tag: splitTransactionData?.tags?.at(0),
            merchant: splitTransactionData?.merchant,
            participants: draftTransaction?.participants,
            attendees: transactionDetails?.attendees as Attendee[],
            reportID,
            created: splitTransactionData?.created ?? '',
            category: splitTransactionData?.category ?? '',
        },
    });

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, editDraftTransaction);
}

/**
 * Redistribute split expense amounts among unedited splits.
 * Manually edited splits are preserved, and remaining amount is distributed among unedited splits.
 *
 * @param splitExpenses - Array of split expenses to redistribute
 * @param total - Total amount to distribute
 * @param currency - Currency for amount calculation
 * @returns Array of split expenses with redistributed amounts
 */
function redistributeSplitExpenseAmounts(splitExpenses: SplitExpense[], total: number, currency: string): SplitExpense[] {
    // Calculate sum of manually edited splits
    const editedSum = splitExpenses.filter((split) => split.isManuallyEdited).reduce((sum, split) => sum + split.amount, 0);

    // Find all unedited splits
    const uneditedSplits = splitExpenses.filter((split) => !split.isManuallyEdited);
    const uneditedCount = uneditedSplits.length;

    // If no unedited splits, return as-is
    if (uneditedCount === 0) {
        return splitExpenses;
    }

    // Redistribute remaining amount among unedited splits
    const remaining = total - editedSum;
    const lastUneditedIndex = uneditedCount - 1;
    let uneditedIndex = 0;

    return splitExpenses.map((split) => {
        if (split.isManuallyEdited) {
            return split;
        }
        const isLast = uneditedIndex === lastUneditedIndex;
        const newAmount = calculateIOUAmount(lastUneditedIndex, remaining, currency, isLast, true);
        uneditedIndex += 1;
        return {...split, amount: newAmount};
    });
}

/**
 * Append a new split expense entry to the draft transaction's splitExpenses array
 * and auto-redistribute amounts among all unedited splits.
 */
function addSplitExpenseField(transaction: OnyxEntry<OnyxTypes.Transaction>, draftTransaction: OnyxEntry<OnyxTypes.Transaction>, transactionReport: OnyxEntry<OnyxTypes.Report>) {
    if (!transaction || !draftTransaction) {
        return;
    }

    const newSplitExpense = initSplitExpenseItemData(transaction, transactionReport, {
        amount: 0,
        transactionID: NumberUtils.rand64(),
        reportID: draftTransaction?.reportID,
        isManuallyEdited: false,
    });

    const existingSplits = draftTransaction.comment?.splitExpenses ?? [];
    const updatedSplitExpenses = [...existingSplits, newSplitExpense];

    // Get total amount and currency for redistribution
    const total = getAmount(draftTransaction, undefined, undefined, true, true);
    const currency = getCurrency(draftTransaction);
    const originalTransactionID = draftTransaction.comment?.originalTransactionID ?? transaction.transactionID;

    const redistributedSplitExpenses = redistributeSplitExpenseAmounts(updatedSplitExpenses, total, currency);

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: redistributedSplitExpenses,
            splitsStartDate: null,
            splitsEndDate: null,
        },
    });
}

/**
 * Evenly distribute the draft split expense amounts across all split items.
 * Remainders are added to the first or last item to ensure the total matches the original amount.
 *
 * Notes:
 * - Works entirely on the provided `draftTransaction` to avoid direct Onyx reads.
 * - Uses `calculateAmount` utility to handle currency subunits and rounding consistently with existing logic.
 */
function evenlyDistributeSplitExpenseAmounts(draftTransaction: OnyxEntry<OnyxTypes.Transaction>) {
    if (!draftTransaction) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
    const currency = getCurrency(draftTransaction);

    // Use allowNegative=true and disableOppositeConversion=true to preserve original amount sign
    const total = getAmount(draftTransaction, undefined, undefined, true, true);

    // Guard clause for missing data
    if (!originalTransactionID || splitExpenses.length === 0) {
        return;
    }

    // Floor-allocation with full remainder added to the last split so the last is always the largest
    const splitCount = splitExpenses.length;
    const lastIndex = splitCount - 1;

    const updatedSplitExpenses = splitExpenses.map((splitExpense, index) => {
        const amount = calculateIOUAmount(splitCount - 1, total, currency, index === lastIndex, true);
        const updatedSplitExpense: SplitExpense = {
            ...splitExpense,
            amount,
            // Reset isManuallyEdited since user explicitly requested even distribution
            isManuallyEdited: false,
        };

        return updatedSplitExpense;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: updatedSplitExpenses,
        },
    });
}

/**
 * Reset all split expenses and create new ones based on the date range.
 * The original amount is distributed proportionally across all dates.
 *
 * @param transaction - The transaction containing split expenses
 * @param transactionReport - The report of the transaction
 * @param startDate - Start date in format 'YYYY-MM-DD'
 * @param endDate - End date in format 'YYYY-MM-DD'
 */
function resetSplitExpensesByDateRange(transaction: OnyxEntry<OnyxTypes.Transaction>, transactionReport: OnyxEntry<OnyxTypes.Report>, startDate: string, endDate: string) {
    if (!transaction || !startDate || !endDate) {
        return;
    }

    // Generate all dates in the range
    const dates = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
    });

    const transactionDetails = getTransactionDetails(transaction);
    const total = transactionDetails?.amount ?? 0;
    const currency = transactionDetails?.currency ?? CONST.CURRENCY.USD;

    // Create split expenses for each date with proportional amounts
    const lastIndex = dates.length - 1;
    const newSplitExpenses: SplitExpense[] = dates.map((date, index) => {
        const amount = calculateIOUAmount(lastIndex, total, currency, index === lastIndex, true);
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {
            amount,
            transactionID: NumberUtils.rand64(),
            reportID: transaction?.reportID,
            created: format(date, CONST.DATE.FNS_FORMAT_STRING),
        });

        return splitExpense;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`, {
        comment: {
            splitExpenses: newSplitExpenses,
            splitsStartDate: startDate,
            splitsEndDate: endDate,
        },
    });
}

function removeSplitExpenseField(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, splitExpenseTransactionID: string) {
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;

    const splitExpenses = draftTransaction.comment?.splitExpenses?.filter((item) => item.transactionID !== splitExpenseTransactionID) ?? [];
    const total = getAmount(draftTransaction, undefined, undefined, true, true);
    const currency = getCurrency(draftTransaction);

    const redistributedSplitExpenses = redistributeSplitExpenseAmounts(splitExpenses, total, currency);

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: redistributedSplitExpenses,
            splitsStartDate: null,
            splitsEndDate: null,
        },
    });
}

function updateSplitExpenseField(
    splitExpenseDraftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    originalTransactionDraft: OnyxEntry<OnyxTypes.Transaction>,
    splitExpenseTransactionID: string,
) {
    if (!splitExpenseDraftTransaction || !splitExpenseTransactionID || !originalTransactionDraft) {
        return;
    }

    const originalTransactionID = splitExpenseDraftTransaction?.comment?.originalTransactionID;
    const transactionDetails = getTransactionDetails(splitExpenseDraftTransaction);
    let shouldResetDateRange = false;

    const splitExpenses = originalTransactionDraft?.comment?.splitExpenses?.map((item) => {
        if (item.transactionID === splitExpenseTransactionID) {
            if (transactionDetails?.created !== item.created) {
                shouldResetDateRange = true;
            }

            const updatedItem: SplitExpense = {
                ...item,
                description: transactionDetails?.comment,
                category: transactionDetails?.category,
                tags: splitExpenseDraftTransaction?.tag ? [splitExpenseDraftTransaction?.tag] : [],
                created: transactionDetails?.created ?? DateUtils.formatWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
            };

            return updatedItem;
        }
        return item;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses,
            // Reset date range if the created date was modified
            splitsStartDate: shouldResetDateRange ? null : originalTransactionDraft?.comment?.splitsStartDate,
            splitsEndDate: shouldResetDateRange ? null : originalTransactionDraft?.comment?.splitsEndDate,
        },
    });
}

function updateSplitExpenseAmountField(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, currentItemTransactionID: string, amount: number, policy?: OnyxEntry<OnyxTypes.Policy>) {
    if (!draftTransaction?.transactionID || !currentItemTransactionID || Number.isNaN(amount)) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const originalTransaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const isDistanceRequest = originalTransaction && isDistanceRequestTransactionUtils(originalTransaction);
    const splitExpenses = draftTransaction.comment?.splitExpenses ?? [];
    const total = getAmount(draftTransaction, undefined, undefined, true, true);
    const currency = getCurrency(draftTransaction);

    // Mark the edited split and update its amount
    const splitWithUpdatedAmount = splitExpenses.map((splitExpense) => {
        if (splitExpense.transactionID === currentItemTransactionID) {
            let updatedSplitExpense: SplitExpense = {
                ...splitExpense,
                amount,
                isManuallyEdited: true,
            };

            // Update distance for distance transactions based on new amount and rate
            if (isDistanceRequest && originalTransaction && splitExpense.customUnit) {
                const mileageRate = DistanceRequestUtils.getRate({transaction: originalTransaction, policy: policy ?? undefined});
                const {unit, rate} = mileageRate;

                if (rate && rate > 0) {
                    // Calculate distance from amount: distance = amount / rate
                    // Both amount and rate are in cents, so the result is in distance units
                    const distanceInUnits = Math.abs(amount) / rate;
                    const quantity = Number(distanceInUnits.toFixed(CONST.DISTANCE_DECIMAL_PLACES));

                    updatedSplitExpense = {
                        ...updatedSplitExpense,
                        customUnit: {
                            ...splitExpense.customUnit,
                            quantity,
                        },
                    };

                    // Update merchant for distance transactions
                    const currencyForMerchant = mileageRate?.currency ?? originalTransaction.currency ?? CONST.CURRENCY.USD;
                    updatedSplitExpense.merchant = getDistanceMerchantForSplitExpense(distanceInUnits, unit, rate, currencyForMerchant, originalTransaction.currency);
                }
            }

            return updatedSplitExpense;
        }
        return splitExpense;
    });

    const redistributedSplitExpenses = redistributeSplitExpenseAmounts(splitWithUpdatedAmount, total, currency);

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: redistributedSplitExpenses,
        },
    });
}

/**
 * Clear errors from split transaction draft
 */
function clearSplitTransactionDraftErrors(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {
        errors: null,
    });
}

export {
    completeSplitBill,
    splitBill,
    splitBillAndOpenReport,
    startSplitBill,
    updateSplitTransactions,
    updateSplitTransactionsFromSplitExpensesFlow,
    initSplitExpense,
    initSplitExpenseItemData,
    updateSplitExpenseField,
    updateSplitExpenseAmountField,
    clearSplitTransactionDraftErrors,
    addSplitExpenseField,
    resetSplitExpensesByDateRange,
    evenlyDistributeSplitExpenseAmounts,
    removeSplitExpenseField,
    initDraftSplitExpenseDataForEdit,
    adjustRemainingSplitShares,
    setDraftSplitTransaction,
    setIndividualShare,
    setSplitShares,
    resetSplitShares,
};

export type {SplitBillActionsParams, UpdateSplitTransactionsParams};
