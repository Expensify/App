import {fastMerge} from 'expensify-common';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxInputValue, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import * as API from '@libs/API';
import type {CompleteSplitBillParams, CreateDistanceRequestParams, SplitBillParams, StartSplitBillParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {deferOrExecuteWrite} from '@libs/deferredLayoutWrite';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {calculateAmount as calculateIOUAmount, updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
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
    getReportNotificationPreference,
    getReportOrDraftReport,
    getTransactionDetails,
    hasViolations as hasViolationsReportUtils,
    isExpenseReport,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isOneOnOneChat,
    isOptimisticPersonalDetail,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import type {OptimisticChatReport} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {addOptimization, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {
    buildOptimisticTransaction,
    getUpdatedTransaction,
    isDistanceExpenseType,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isScanRequest as isScanRequestTransactionUtils,
} from '@libs/TransactionUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {notifyNewAction} from '@userActions/Report';
import {sanitizeWaypointsForAPI} from '@userActions/Transaction';
import {removeDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant, Split} from '@src/types/onyx/IOU';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt, ReceiptSource, SplitShares, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllPersonalDetails, getAllReports, getAllTransactionDrafts, getAllTransactions, getMoneyRequestPolicyTags, getPolicyTagsData, getUserAccountID} from './index';
import type {StartSplitBilActionParams} from './index';
import {
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    getMoneyRequestInformation,
    getReceiptError,
    getReportPreviewAction,
    mergePolicyRecentlyUsedCategories,
    mergePolicyRecentlyUsedCurrencies,
} from './MoneyRequestBuilder';
import type {BuildOnyxDataForMoneyRequestKeys, OneOnOneIOUReport} from './MoneyRequestBuilder';
import {dismissModalAndOpenReportInInboxTab, handleNavigateAfterExpenseCreate, highlightTransactionOnSearchRouteIfNeeded} from './NavigationHelpers';
import type BasePolicyParams from './types/BasePolicyParams';
import type BaseTransactionParams from './types/BaseTransactionParams';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

type SplitData = {
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    policyID?: string;
    createdReportActionID?: string;
    chatType?: string;
};

type SplitsAndOnyxData = {
    splitData: SplitData;
    splits: Split[];
    onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys>;
};

type DistanceRequestTransactionParams = BaseTransactionParams & {
    attendees?: Attendee[];
    validWaypoints?: WaypointCollection;
    splitShares?: SplitShares;
    distance?: number;
    receipt?: Receipt;
    odometerStart?: number;
    odometerEnd?: number;
    gpsCoordinates?: string;
};

type CreateDistanceRequestInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
    transactionParams: DistanceRequestTransactionParams;
    policyParams?: BasePolicyParams;
    backToReport?: string;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    customUnitPolicyID?: string;
    shouldHandleNavigation?: boolean;
    shouldPlaySound?: boolean;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    optimisticReportPreviewActionID?: string;
    shouldDeferAutoSubmit?: boolean;
    previousOdometerDraft?: OnyxEntry<OnyxTypes.OdometerDraft>;
};

type CreateSplitsTransactionParams = Omit<BaseTransactionParams, 'customUnitRateID'> & {
    splitShares: SplitShares;
    iouRequestType?: IOURequestType;
    attendees?: Attendee[];
};

type CreateSplitsAndOnyxDataParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    existingSplitChatReportID?: string;
    transactionParams: CreateSplitsTransactionParams;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
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
    taxValue?: string;
    isRetry?: boolean;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
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
    taxValue,
    policyRecentlyUsedCategories,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    policyRecentlyUsedTags,
    betas,
    personalDetails,
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
            taxValue,
        },
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        isASAPSubmitBetaEnabled,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        betas,
        personalDetails,
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
    taxValue,
    existingSplitChatReportID,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    betas,
    personalDetails,
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
            taxValue,
        },
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        betas,
        personalDetails,
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
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));

    dismissModalAndOpenReportInInboxTab(splitData.chatReportID);
    notifyNewAction(splitData.chatReportID, undefined, true);
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
    taxValue,
    shouldPlaySound = true,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    quickAction,
    policyRecentlyUsedCurrencies,
    participantsPolicyTags,
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
            taxValue,
            billable,
            reimbursable,
        },
    });

    const filename = splitTransaction.receipt?.filename;

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitChatCreatedReportAction = buildOptimisticCreatedReportAction({emailCreatingAction: currentUserEmailForIOUSplit});
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
        taxValue,
        quickAction,
        policyRecentlyUsedCurrencies,
        policyRecentlyUsedTags,
        participantsPolicyTags,
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
            policyTags: participant.policyID ? participantsPolicyTags[participant.policyID] : {},
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

    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, splitChatReport.reportID);
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
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>,
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
                    currentUserAccountID: sessionAccountID,
                });
        }

        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport?.iouReportID ? getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const shouldCreateNewOneOnOneIOUReport = shouldCreateNewMoneyRequestReportReportUtils(oneOnOneIOUReport, oneOnOneChatReport, false, betas);

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
                taxValue: updatedTransaction?.taxValue,
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
                currentUserAccountID: sessionAccountID,
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
            personalDetails,
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
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));
    dismissModalAndOpenReportInInboxTab(chatReportID);
    notifyNewAction(chatReportID, undefined, true);
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
              isSplitTransaction: true,
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

function getOrCreateOptimisticSplitChatReport(existingSplitChatReportID: string | undefined, participants: Participant[], participantAccountIDs: number[], currentUserAccountID: number) {
    // The existing chat report could be passed as reportID or exist on the sole "participant" (in this case a report option)
    const existingChatReportID = existingSplitChatReportID ?? participants.at(0)?.reportID;

    // Check if the report is available locally if we do have one
    const allReports = getAllReports();
    const existingSplitChatOnyxData = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingChatReportID}`];
    let existingSplitChatReport = existingChatReportID && existingSplitChatOnyxData ? {...existingSplitChatOnyxData} : undefined;

    const allParticipantsAccountIDs = [...participantAccountIDs, currentUserAccountID];
    if (!existingSplitChatReport) {
        existingSplitChatReport = getChatByParticipants(allParticipantsAccountIDs, undefined, participantAccountIDs.length > 1);
    }

    // We found an existing chat report we are done...
    if (existingSplitChatReport) {
        // Yes, these are the same, but give the caller a way to identify if we created a new report or not
        return {existingSplitChatReport, splitChatReport: existingSplitChatReport};
    }

    // Create a Group Chat if we have multiple participants
    if (participants.length > 1) {
        const splitChatReport = buildOptimisticChatReport({
            participantList: allParticipantsAccountIDs,
            reportName: '',
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            currentUserAccountID,
        });

        return {existingSplitChatReport: null, splitChatReport};
    }

    // Otherwise, create a new 1:1 chat report
    const splitChatReport = buildOptimisticChatReport({
        participantList: participantAccountIDs,
        currentUserAccountID,
    });
    return {existingSplitChatReport: null, splitChatReport};
}

/**
 * Build the Onyx data and IOU split necessary for splitting a bill with 3+ users.
 * 1. Build the optimistic Onyx data for the group chat, i.e. chatReport and iouReportAction creating the former if it doesn't yet exist.
 * 2. Loop over the group chat participant list, building optimistic or updating existing chatReports, iouReports and iouReportActions between the user and each participant.
 * We build both Onyx data and the IOU split that is sent as a request param and is used by Auth to create the chatReports, iouReports and iouReportActions in the database.
 * The IOU split has the following shape:
 *  [
 *      {email: 'currentUser', amount: 100},
 *      {email: 'user2', amount: 100, iouReportID: '100', chatReportID: '110', transactionID: '120', reportActionID: '130'},
 *      {email: 'user3', amount: 100, iouReportID: '200', chatReportID: '210', transactionID: '220', reportActionID: '230'}
 *  ]
 * @param amount - always in the smallest unit of the currency
 * @param existingSplitChatReportID - the report ID where the split expense happens, could be a group chat or a expense chat
 */
function createSplitsAndOnyxData({
    participants,
    currentUserLogin,
    currentUserAccountID,
    existingSplitChatReportID,
    transactionParams: {
        amount,
        comment,
        currency,
        merchant,
        created,
        category,
        tag,
        splitShares = {},
        billable = false,
        reimbursable = false,
        iouRequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
        taxCode = '',
        taxAmount = 0,
        taxValue,
        attendees,
    },
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    betas,
    personalDetails,
}: CreateSplitsAndOnyxDataParams): SplitsAndOnyxData {
    const currentUserEmailForIOUSplit = addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));

    const {splitChatReport, existingSplitChatReport} = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID);
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const receipt: Receipt | undefined = iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN} : undefined;

    const allTransactionDrafts = getAllTransactionDrafts();
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    let splitTransaction = buildOptimisticTransaction({
        existingTransaction,
        transactionParams: {
            amount,
            currency,
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
            comment,
            created,
            merchant: merchant || Localize.translateLocal('iou.expense'),
            receipt,
            category,
            tag,
            taxCode,
            taxAmount,
            taxValue,
            billable,
            reimbursable,
            pendingFields: isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
            attendees,
        },
    });

    // Important data is set on the draft distance transaction, such as the iouRequestType marking it as a distance request, so merge it into the optimistic split transaction
    if (isDistanceRequest) {
        splitTransaction = fastMerge(existingTransaction, splitTransaction, false);
    }

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitCreatedReportAction = buildOptimisticCreatedReportAction({emailCreatingAction: currentUserEmailForIOUSplit});
    const splitIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount,
        currency,
        comment,
        participants,
        transactionID: splitTransaction.transactionID,
        isOwnPolicyExpenseChat,
    });

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = getReportActionText(splitIOUReportAction);
    splitChatReport.lastMessageHtml = getReportActionHtml(splitIOUReportAction);
    splitChatReport.lastActorAccountID = currentUserAccountID;
    splitChatReport.lastVisibleActionCreated = splitIOUReportAction.created;

    if (splitChatReport.participants && getReportNotificationPreference(splitChatReport) === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
        splitChatReport.participants[currentUserAccountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
    }

    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    const optimisticData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
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
                action: iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ? CONST.QUICK_ACTIONS.SPLIT_DISTANCE : CONST.QUICK_ACTIONS.SPLIT_MANUAL,
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
                      [splitCreatedReportAction.reportActionID]: splitCreatedReportAction as OnyxTypes.ReportAction,
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

    const successData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [splitIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {pendingAction: null, pendingFields: null},
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

    const failureData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        },
    ];

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
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
                    [splitIOUReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        );
    }

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const currentUserAmount = splitShares?.[currentUserAccountID]?.amount ?? calculateIOUAmount(participants.length, amount, currency, true);
    const currentUserTaxAmount = calculateIOUAmount(participants.length, taxAmount, currency, true);
    const isPendingDistanceSplitBill = isDistanceRequest && isEmptyObject(splitShares);

    const splits: Split[] = [
        {email: currentUserEmailForIOUSplit, accountID: currentUserAccountID, ...(!isPendingDistanceSplitBill && {amount: currentUserAmount, taxAmount: currentUserTaxAmount})},
    ];

    const allReports = getAllReports();
    const hasMultipleParticipants = participants.length > 1;
    for (const participant of participants) {
        // In a case when a participant is a workspace, even when a current user is not an owner of the workspace
        const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(participant);
        const splitAmount = splitShares?.[participant.accountID ?? CONST.DEFAULT_NUMBER_ID]?.amount ?? calculateIOUAmount(participants.length, amount, currency, false);
        const splitTaxAmount = calculateIOUAmount(participants.length, taxAmount, currency, false);

        // In case the participant is a workspace, email & accountID should remain undefined and won't be used in the rest of this code
        // participant.login is undefined when the request is initiated from a group DM with an unknown user, so we need to add a default
        const email = isOwnPolicyExpenseChat || isPolicyExpenseChat ? '' : addSMSDomainIfPhoneNumber(participant.login ?? '').toLowerCase();
        const accountID = isOwnPolicyExpenseChat || isPolicyExpenseChat ? 0 : Number(participant.accountID);

        if (isPendingDistanceSplitBill) {
            const individualSplit = {
                email,
                accountID,
                ...(participant.isOwnPolicyExpenseChat && {
                    policyID: participant.policyID,
                    chatReportID: splitChatReport.reportID,
                }),
            };

            splits.push(individualSplit);
            continue;
        }

        // To exclude someone from a split, the amount can be 0. The scenario for this is when creating a split from a group chat, we have remove the option to deselect users to exclude them.
        // We can input '0' next to someone we want to exclude.
        if (splitAmount === 0) {
            continue;
        }

        if (email === currentUserEmailForIOUSplit) {
            continue;
        }

        // STEP 1: Get existing chat report OR build a new optimistic one
        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        let oneOnOneChatReport: OnyxTypes.Report | OptimisticChatReport;
        let isNewOneOnOneChatReport = false;
        let shouldCreateOptimisticPersonalDetails = false;

        // If this is a split between two people only and the function
        // wasn't provided with an existing group chat report id
        // or, if the split is being made from the expense chat, then the oneOnOneChatReport is the same as the splitChatReport
        // in this case existingSplitChatReport will belong to the policy expense chat and we won't be
        // entering code that creates optimistic personal details
        if ((!hasMultipleParticipants && !existingSplitChatReportID) || isOwnPolicyExpenseChat || isOneOnOneChat(splitChatReport)) {
            oneOnOneChatReport = splitChatReport;
            shouldCreateOptimisticPersonalDetails = !existingSplitChatReport && isOptimisticPersonalDetail(accountID);
        } else {
            const existingChatReport = getChatByParticipants([accountID, currentUserAccountID]);
            isNewOneOnOneChatReport = !existingChatReport;
            shouldCreateOptimisticPersonalDetails = isNewOneOnOneChatReport && isOptimisticPersonalDetail(accountID);
            oneOnOneChatReport =
                existingChatReport ??
                buildOptimisticChatReport({
                    participantList: [accountID, currentUserAccountID],
                    currentUserAccountID,
                });
        }

        // STEP 2: Get existing IOU/Expense report and update its total OR build a new optimistic one
        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport.iouReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const isScanRequest = isScanRequestTransactionUtils(splitTransaction);
        const shouldCreateNewOneOnOneIOUReport = shouldCreateNewMoneyRequestReportReportUtils(oneOnOneIOUReport, oneOnOneChatReport, isScanRequest, betas);

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            const optimisticExpenseReportID = generateReportID();
            const reportTransactions = buildMinimalTransactionForFormula(
                splitTransaction.transactionID,
                optimisticExpenseReportID,
                splitTransaction.created,
                splitAmount,
                currency,
                splitTransaction.merchant,
            );

            oneOnOneIOUReport = isOwnPolicyExpenseChat
                ? buildOptimisticExpenseReport({
                      chatReportID: oneOnOneChatReport.reportID,
                      policyID: oneOnOneChatReport.policyID,
                      payeeAccountID: currentUserAccountID,
                      total: splitAmount,
                      currency,
                      optimisticIOUReportID: optimisticExpenseReportID,
                      reportTransactions,
                      betas,
                  })
                : buildOptimisticIOUReport(currentUserAccountID, accountID, splitAmount, oneOnOneChatReport.reportID, currency);
        } else if (isOwnPolicyExpenseChat) {
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if (oneOnOneIOUReport?.currency === currency) {
                if (typeof oneOnOneIOUReport.total === 'number') {
                    oneOnOneIOUReport.total -= splitAmount;
                }

                if (typeof oneOnOneIOUReport.unheldTotal === 'number') {
                    oneOnOneIOUReport.unheldTotal -= splitAmount;
                }
            }
        } else {
            oneOnOneIOUReport = updateIOUOwnerAndTotal(oneOnOneIOUReport, currentUserAccountID, splitAmount, currency);
        }

        // STEP 3: Build optimistic transaction
        let oneOnOneTransaction = buildOptimisticTransaction({
            originalTransactionID: splitTransaction.transactionID,
            transactionParams: {
                amount: isExpenseReport(oneOnOneIOUReport) ? -splitAmount : splitAmount,
                currency,
                reportID: oneOnOneIOUReport.reportID,
                comment,
                created,
                merchant: merchant || Localize.translateLocal('iou.expense'),
                category,
                tag,
                taxCode,
                taxAmount: isExpenseReport(oneOnOneIOUReport) ? -splitTaxAmount : splitTaxAmount,
                taxValue,
                billable,
                source: CONST.IOU.TYPE.SPLIT,
            },
        });
        oneOnOneIOUReport.transactionCount = (oneOnOneIOUReport.transactionCount ?? 0) + 1;

        if (isDistanceRequest) {
            oneOnOneTransaction = fastMerge(existingTransaction, oneOnOneTransaction, false);
        }

        // STEP 4: Build optimistic reportActions. We need:
        // 1. CREATED action for the chatReport
        // 2. CREATED action for the iouReport
        // 3. IOU action for the iouReport
        // 4. Transaction Thread and the CREATED action for it
        // 5. REPORT_PREVIEW action for the chatReport
        const [oneOnOneCreatedActionForChat, oneOnOneCreatedActionForIOU, oneOnOneIOUAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
            buildOptimisticMoneyRequestEntities({
                iouReport: oneOnOneIOUReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: splitAmount,
                currency,
                comment,
                payeeEmail: currentUserEmailForIOUSplit,
                participants: [participant],
                transactionID: oneOnOneTransaction.transactionID,
                currentUserAccountID,
            });

        // Add optimistic personal details for new participants
        const oneOnOnePersonalDetailListAction: OnyxTypes.PersonalDetailsList = shouldCreateOptimisticPersonalDetails
            ? {
                  [accountID]: {
                      accountID,
                      // Disabling this line since participant.displayName can be an empty string
                      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                      displayName: formatPhoneNumber(participant.displayName || email),
                      login: participant.login,
                      isOptimisticPersonalDetail: true,
                  },
              }
            : {};

        if (shouldCreateOptimisticPersonalDetails) {
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }

        let oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport.reportID, oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport);
        }

        const optimisticPolicyRecentlyUsedCategories = isPolicyExpenseChat ? mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories) : [];
        const optimisticRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);

        // Add tag to optimistic policy recently used tags when a participant is a workspace
        const optimisticPolicyRecentlyUsedTags = isPolicyExpenseChat
            ? buildOptimisticPolicyRecentlyUsedTags({
                  // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
                  policyTags: getPolicyTagsData(participant.policyID),
                  policyRecentlyUsedTags,
                  transactionTags: tag,
              })
            : {};
        const hasViolations = hasViolationsReportUtils(oneOnOneIOUReport.reportID, transactionViolations, currentUserAccountID, currentUserEmailForIOUSplit);

        // STEP 5: Build Onyx Data
        const {
            optimisticData: oneOnOneOptimisticData,
            successData: oneOnOneSuccessData,
            failureData: oneOnOneFailureData,
        } = buildOnyxDataForMoneyRequest({
            isNewChatReport: isNewOneOnOneChatReport,
            shouldCreateNewMoneyRequestReport: shouldCreateNewOneOnOneIOUReport,
            isOneOnOneSplit: true,
            isASAPSubmitBetaEnabled,
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
                policyRecentlyUsed: {
                    categories: optimisticPolicyRecentlyUsedCategories,
                    tags: optimisticPolicyRecentlyUsedTags,
                    currencies: optimisticRecentlyUsedCurrencies,
                },
                personalDetailListAction: oneOnOnePersonalDetailListAction,
            },
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserLogin,
            hasViolations,
            quickAction,
            personalDetails,
        });

        const individualSplit = {
            email,
            accountID,
            isOptimisticAccount: isOptimisticPersonalDetail(accountID),
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
            taxAmount: splitTaxAmount,
        };

        splits.push(individualSplit);
        optimisticData.push(...(oneOnOneOptimisticData ?? []));
        successData.push(...(oneOnOneSuccessData ?? []));
        failureData.push(...(oneOnOneFailureData ?? []));
    }

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
        value: {
            comment: {
                splits: splits.map((split) => ({accountID: split.accountID, amount: split.amount})),
            },
        },
    });

    const splitData: SplitData = {
        chatReportID: splitChatReport.reportID,
        transactionID: splitTransaction.transactionID,
        reportActionID: splitIOUReportAction.reportActionID,
        policyID: splitChatReport.policyID,
        chatType: splitChatReport.chatType,
    };

    if (!existingSplitChatReport) {
        splitData.createdReportActionID = splitCreatedReportAction.reportActionID;
    }

    return {
        splitData,
        splits,
        onyxData: {optimisticData, successData, failureData},
    };
}

/** Requests money based on a distance (e.g. mileage from a map) */
function createDistanceRequest(distanceRequestInformation: CreateDistanceRequestInformation) {
    const {
        report,
        participants,
        currentUserLogin,
        currentUserAccountID,
        iouType = CONST.IOU.TYPE.SUBMIT,
        existingIOUReport,
        existingTransaction,
        transactionParams,
        policyParams = {},
        backToReport,
        isASAPSubmitBetaEnabled,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        recentWaypoints = [],
        customUnitPolicyID,
        shouldHandleNavigation = true,
        shouldPlaySound: shouldPlaySoundParam = true,
        personalDetails,
        betas,
        optimisticReportPreviewActionID,
        shouldDeferAutoSubmit,
        previousOdometerDraft,
    } = distanceRequestInformation;
    const {policy, policyCategories, policyRecentlyUsedCategories, policyRecentlyUsedTags} = policyParams;
    const parsedComment = getParsedComment(transactionParams.comment);
    transactionParams.comment = parsedComment;
    const {
        amount,
        comment,
        distance,
        currency,
        created,
        category,
        tag,
        taxAmount,
        taxCode,
        taxValue,
        merchant,
        modifiedAmount,
        billable,
        reimbursable,
        validWaypoints,
        customUnitRateID = '',
        splitShares = {},
        attendees,
        receipt,
        odometerStart,
        odometerEnd,
        isFromGlobalCreate,
        gpsCoordinates,
    } = transactionParams;

    // If the report is an iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isManualDistanceRequest = isEmptyObject(validWaypoints);

    const optimisticReceipt: Receipt | undefined = !isManualDistanceRequest
        ? {
              source: ReceiptGeneric as ReceiptSource,
              state: CONST.IOU.RECEIPT_STATE.OPEN,
          }
        : receipt;

    let parameters: CreateDistanceRequestParams;
    let onyxData: OnyxData<
        | BuildOnyxDataForMoneyRequestKeys
        | typeof ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE
        | typeof ONYXKEYS.NVP_RECENT_WAYPOINTS
        | typeof ONYXKEYS.GPS_DRAFT_DETAILS
        | typeof ONYXKEYS.ODOMETER_DRAFT
    >;
    let distanceIouReport: OnyxInputValue<OnyxTypes.Report> = null;
    const sanitizedWaypoints = !isManualDistanceRequest ? sanitizeWaypointsForAPI(validWaypoints) : null;
    if (iouType === CONST.IOU.TYPE.SPLIT) {
        const {
            splitData,
            splits,
            onyxData: splitOnyxData,
        } = createSplitsAndOnyxData({
            participants,
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID,
            existingSplitChatReportID: report?.reportID,
            transactionParams: {
                amount,
                comment,
                currency,
                merchant,
                created,
                category: category ?? '',
                tag: tag ?? '',
                splitShares,
                billable,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                taxCode,
                taxAmount,
                taxValue,
                attendees,
            },
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            betas,
            personalDetails,
        });
        onyxData = splitOnyxData;

        // Splits don't use the IOU report param. The split transaction isn't linked to a report shown in the UI, it's linked to a special default reportID of -2.
        // Therefore, any params related to the IOU report are irrelevant and omitted below.
        parameters = {
            transactionID: splitData.transactionID,
            chatReportID: splitData.chatReportID,
            createdChatReportActionID: splitData.createdReportActionID,
            reportActionID: splitData.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            customUnitRateID,
            customUnitPolicyID,
            comment,
            created,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            splits: JSON.stringify(splits),
            chatType: splitData.chatType,
            description: parsedComment,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
            odometerStart,
            odometerEnd,
            gpsCoordinates,
        };
    } else {
        const participant = participants.at(0) ?? {};
        const {
            iouReport,
            chatReport,
            transaction,
            iouAction,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewAction,
            transactionThreadReportID,
            createdReportActionIDForThread,
            payerEmail,
            onyxData: moneyRequestOnyxData,
        } = getMoneyRequestInformation({
            parentChatReport: currentChatReport,
            existingIOUReport,
            existingTransaction,
            moneyRequestReportID,
            participantParams: {
                participant,
                payeeAccountID: currentUserAccountID,
                payeeEmail: currentUserLogin,
            },
            policyParams: {
                policy,
                policyCategories,
                policyTagList: getMoneyRequestPolicyTags({existingIOUReport, moneyRequestReportID, parentChatReport: currentChatReport, participant}),
                policyRecentlyUsedCategories,
                policyRecentlyUsedTags,
            },
            transactionParams: {
                amount,
                distance,
                currency,
                comment,
                created,
                merchant,
                receipt: optimisticReceipt,
                category,
                tag,
                taxCode,
                taxAmount,
                taxValue,
                billable,
                reimbursable,
                attendees,
                waypoints: validWaypoints,
                odometerStart,
                odometerEnd,
            },
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserLogin,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            betas,
            optimisticReportPreviewActionID,
        });

        onyxData = moneyRequestOnyxData;
        distanceIouReport = iouReport;

        const isGPSDistanceRequest = transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS;

        if (isDistanceExpenseType(transaction.iouRequestType)) {
            onyxData?.optimisticData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
                value: transaction.iouRequestType,
            });
        }

        if (isGPSDistanceRequest) {
            onyxData?.optimisticData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.GPS_DRAFT_DETAILS,
                value: null,
            });
        }

        parameters = {
            amount: modifiedAmount ?? undefined,
            comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            distance: distance !== undefined ? roundToTwoDecimalPlaces(distance) : undefined,
            receipt,
            odometerStart,
            odometerEnd,
            created,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            transactionThreadReportID,
            createdReportActionIDForThread,
            payerEmail,
            customUnitRateID,
            customUnitPolicyID,
            description: parsedComment,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
            gpsCoordinates,
            shouldDeferAutoSubmit,
        };
    }

    if (previousOdometerDraft !== undefined && (odometerStart !== undefined || odometerEnd !== undefined)) {
        onyxData?.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.ODOMETER_DRAFT,
            value: null,
        });
        onyxData?.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.ODOMETER_DRAFT,
            value: previousOdometerDraft,
        });
    }

    const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
    onyxData?.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
        value: recentServerValidatedWaypoints,
    });

    if (shouldPlaySoundParam) {
        playSound(SOUNDS.DONE);
    }

    const apiWrite = () => {
        API.write(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    };

    deferOrExecuteWrite(apiWrite, {
        shouldDeferForSearch: !!(shouldHandleNavigation && isFromGlobalCreate && !isReportTopmostSplitNavigator()),
        optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${parameters.transactionID}`,
        onDeferred: () => addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE),
    });

    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));
    const activeReportID = isMoneyRequestReport && report?.reportID ? report.reportID : parameters.chatReportID;

    if (shouldHandleNavigation) {
        highlightTransactionOnSearchRouteIfNeeded(isFromGlobalCreate, parameters.transactionID, CONST.SEARCH.DATA_TYPES.EXPENSE);
        handleNavigateAfterExpenseCreate({activeReportID: backToReport ?? activeReportID, isFromGlobalCreate, transactionID: parameters.transactionID});
    }

    if (!isMoneyRequestReport) {
        notifyNewAction(activeReportID, undefined, true);
    }

    return {iouReport: distanceIouReport};
}

export {
    completeSplitBill,
    createDistanceRequest,
    splitBill,
    splitBillAndOpenReport,
    startSplitBill,
    adjustRemainingSplitShares,
    setDraftSplitTransaction,
    setIndividualShare,
    setSplitShares,
    resetSplitShares,
};

export type {CreateDistanceRequestInformation, SplitBillActionsParams};
