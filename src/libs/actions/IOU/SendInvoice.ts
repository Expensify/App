import {InteractionManager} from 'react-native';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {SendInvoiceParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    buildOptimisticChatReport,
    buildOptimisticInvoiceReport,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticReportPreview,
    doesReportReceiverMatchParticipant,
    getParsedComment,
    getPersonalDetailsForAccountID,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import {buildOptimisticPolicyRecentlyUsedTags, getPolicyTagsData} from '@userActions/Policy/Tag';
import {notifyNewAction} from '@userActions/Report';
import {removeDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {InvoiceReceiver, InvoiceReceiverType} from '@src/types/onyx/Report';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllPersonalDetails, getReceiptError, getSearchOnyxUpdate, mergePolicyRecentlyUsedCategories, mergePolicyRecentlyUsedCurrencies} from '.';
import type {BasePolicyParams} from '.';

type SendInvoiceInformation = {
    senderWorkspaceID: string | undefined;
    receiver: Partial<OnyxTypes.PersonalDetails>;
    invoiceRoom: OnyxTypes.Report;
    createdChatReportActionID: string;
    invoiceReportID: string;
    reportPreviewReportActionID: string;
    transactionID: string;
    transactionThreadReportID: string;
    createdIOUReportActionID: string;
    createdReportActionIDForThread: string | undefined;
    reportActionID: string;
    onyxData: OnyxData<
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
        | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
        | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
        | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
        | typeof ONYXKEYS.COLLECTION.POLICY
        | typeof ONYXKEYS.COLLECTION.SNAPSHOT
    >;
};

type SendInvoiceOptions = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    currentUserAccountID: number;
    policyRecentlyUsedCurrencies: string[];
    invoiceChatReport?: OnyxEntry<OnyxTypes.Report>;
    invoiceChatReportID?: string;
    receiptFile?: Receipt;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    companyName?: string;
    companyWebsite?: string;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags?: OnyxEntry<OnyxTypes.RecentlyUsedTags>;
};

type BuildOnyxDataForInvoiceParams = {
    chat: {
        report: OnyxEntry<OnyxTypes.Report>;
        createdAction: OptimisticCreatedReportAction;
        reportPreviewAction: OnyxTypes.ReportAction;
        isNewReport: boolean;
    };
    iou: {
        createdAction: OptimisticCreatedReportAction;
        action: OptimisticIOUReportAction;
        report: OnyxTypes.Report;
    };
    transactionParams: {
        transaction: OnyxTypes.Transaction;
        threadReport: OptimisticChatReport;
        threadCreatedReportAction: OptimisticCreatedReportAction | null;
    };
    policyParams: BasePolicyParams;
    optimisticData: {
        recentlyUsedCurrencies?: string[];
        policyRecentlyUsedCategories: string[];
        policyRecentlyUsedTags: OnyxTypes.RecentlyUsedTags;
        personalDetailListAction: OnyxTypes.PersonalDetailsList;
    };
    companyName?: string;
    companyWebsite?: string;
    participant?: Participant;
};

/** Builds the Onyx data for an invoice */
function buildOnyxDataForInvoice(
    invoiceParams: BuildOnyxDataForInvoiceParams,
): OnyxData<
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
    | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
    | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
    | typeof ONYXKEYS.COLLECTION.POLICY
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
> {
    const {chat, iou, transactionParams, policyParams, optimisticData: optimisticDataParams, companyName, companyWebsite, participant} = invoiceParams;
    const transaction = transactionParams.transaction;

    const clearedPendingFields = Object.fromEntries(Object.keys(transactionParams.transaction.pendingFields ?? {}).map((key) => [key, null]));
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
            | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report?.reportID}`,
            value: {
                ...iou.report,
                lastMessageText: getReportActionText(iou.action),
                lastMessageHtml: getReportActionHtml(iou.action),
                pendingFields: {
                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionParams.transaction.transactionID}`,
            value: transactionParams.transaction,
        },
        chat.isNewReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
                  value: {
                      [chat.createdAction.reportActionID]: chat.createdAction,
                      [chat.reportPreviewAction.reportActionID]: chat.reportPreviewAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
                  value: {
                      [chat.reportPreviewAction.reportActionID]: chat.reportPreviewAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report?.reportID}`,
            value: {
                [iou.createdAction.reportActionID]: iou.createdAction as OnyxTypes.ReportAction,
                [iou.action.reportActionID]: iou.action as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionParams.threadReport.reportID}`,
            value: transactionParams.threadReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionParams.threadReport?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
    ];

    if (transactionParams.threadCreatedReportAction?.reportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionParams.threadReport.reportID}`,
            value: {
                [transactionParams.threadCreatedReportAction.reportActionID]: transactionParams.threadCreatedReportAction,
            },
        });
    }

    const successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
        >
    > = [];

    if (chat.report) {
        optimisticData.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: chat.isNewReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report.reportID}`,
            value: {
                ...chat.report,
                lastReadTime: DateUtils.getDBTime(),
                iouReportID: iou.report?.reportID,
                ...(chat.isNewReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        });

        if (chat.isNewReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            });
        }
    }

    if (optimisticDataParams.policyRecentlyUsedCategories.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iou.report?.policyID}`,
            value: optimisticDataParams.policyRecentlyUsedCategories,
        });
    }

    if (optimisticDataParams.recentlyUsedCurrencies?.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
            value: optimisticDataParams.recentlyUsedCurrencies,
        });
    }

    if (!isEmptyObject(optimisticDataParams.policyRecentlyUsedTags)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iou.report?.policyID}`,
            value: optimisticDataParams.policyRecentlyUsedTags,
        });
    }

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(optimisticDataParams.personalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        for (const accountIDKey of Object.keys(optimisticDataParams.personalDetailListAction)) {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticDataParams.personalDetailListAction,
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report?.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report?.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionParams.threadReport.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionParams.threadReport.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionParams.transaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
            value: {
                ...(chat.isNewReport
                    ? {
                          [chat.createdAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                          },
                      }
                    : {}),
                [chat.reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                    isOptimisticAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report?.reportID}`,
            value: {
                [iou.createdAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
                [iou.action.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    );

    if (transactionParams.threadCreatedReportAction?.reportActionID) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionParams.threadReport.reportID}`,
            value: {
                [transactionParams.threadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    if (chat.isNewReport) {
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report?.reportID}`,
                value: {
                    participants: redundantParticipants,
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );
    }

    const errorKey = DateUtils.getMicroseconds();

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.POLICY>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report?.reportID}`,
            value: {
                iouReportID: chat.report?.iouReportID,
                lastReadTime: chat.report?.lastReadTime,
                pendingFields: null,
                hasOutstandingChildRequest: chat.report?.hasOutstandingChildRequest,
                ...(chat.isNewReport
                    ? {
                          errorFields: {
                              createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                          },
                      }
                    : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: {
                    createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionParams.threadReport.reportID}`,
            value: {
                errorFields: {
                    createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionParams.transaction.transactionID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateInvoiceFailureMessage'),
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report?.reportID}`,
            value: {
                [iou.createdAction.reportActionID]: {
                    errors: getReceiptError(transactionParams.transaction.receipt, transactionParams.transaction.receipt?.filename, false, errorKey),
                },
                [iou.action.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateInvoiceFailureMessage'),
                },
            },
        },
    ];

    if (transactionParams.threadCreatedReportAction?.reportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionParams.threadReport.reportID}`,
            value: {
                [transactionParams.threadCreatedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateInvoiceFailureMessage', errorKey),
                },
            },
        });
    }

    if (companyName && companyWebsite) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyParams.policy?.id}`,
            value: {
                invoice: {
                    companyName,
                    companyWebsite,
                    pendingFields: {
                        companyName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        companyWebsite: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyParams.policy?.id}`,
            value: {
                invoice: {
                    pendingFields: {
                        companyName: null,
                        companyWebsite: null,
                    },
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyParams.policy?.id}`,
            value: {
                invoice: {
                    companyName: null,
                    companyWebsite: null,
                    pendingFields: {
                        companyName: null,
                        companyWebsite: null,
                    },
                },
            },
        });
    }

    const searchUpdate = getSearchOnyxUpdate({
        transaction,
        participant,
        iouReport: iou.report,
        iouAction: iou.action,
        policy: policyParams.policy,
        isInvoice: true,
        transactionThreadReportID: transactionParams.threadReport.reportID,
    });

    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push(...searchUpdate.successData);
        }
    }

    return {optimisticData, successData, failureData};
}

/**
 * Get the invoice receiver type based on the receiver participant.
 * @param receiverParticipant The participant who will receive the invoice or the invoice receiver object directly.
 * @returns The invoice receiver type.
 */
function getReceiverType(receiverParticipant: Participant | InvoiceReceiver | undefined): InvoiceReceiverType {
    if (!receiverParticipant) {
        Log.warn('getReceiverType called with no receiverParticipant');
        return CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    }
    if ('type' in receiverParticipant && receiverParticipant.type) {
        return receiverParticipant.type;
    }
    if ('policyID' in receiverParticipant && receiverParticipant.policyID && receiverParticipant.policyID !== CONST.POLICY.ID_FAKE) {
        return CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS;
    }
    return CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
}

/** Gathers all the data needed to create an invoice. */
function getSendInvoiceInformation({
    transaction,
    currentUserAccountID,
    policyRecentlyUsedCurrencies,
    invoiceChatReport,
    invoiceChatReportID,
    receiptFile,
    policy,
    policyTagList,
    policyCategories,
    companyName,
    companyWebsite,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
}: SendInvoiceOptions): SendInvoiceInformation {
    const {amount = 0, currency = '', created = '', merchant = '', category = '', tag = '', taxCode = '', taxAmount = 0, billable, comment, participants} = transaction ?? {};
    const trimmedComment = (comment?.comment ?? '').trim();
    const senderWorkspaceID = participants?.find((participant) => participant?.isSender)?.policyID;
    const receiverParticipant: Participant | InvoiceReceiver | undefined =
        participants?.find((participant) => participant?.accountID && !participant?.isSender) ?? invoiceChatReport?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST.DEFAULT_NUMBER_ID;
    const invoiceChatReportReceiverMatches = doesReportReceiverMatchParticipant(invoiceChatReport, receiverAccountID);
    let receiver = getPersonalDetailsForAccountID(receiverAccountID);
    let optimisticPersonalDetailListAction = {};

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(invoiceChatReport) && invoiceChatReport?.reportID && invoiceChatReportReceiverMatches ? invoiceChatReport : null;

    if (!chatReport) {
        isNewChatReport = true;
        chatReport = buildOptimisticChatReport({
            optimisticReportID: invoiceChatReportID,
            participantList: [receiverAccountID, currentUserAccountID],
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            policyID: senderWorkspaceID,
        });
    }

    // STEP 2: Create a new optimistic invoice report.
    const optimisticInvoiceReport = buildOptimisticInvoiceReport(
        chatReport.reportID,
        senderWorkspaceID,
        receiverAccountID,
        receiver.displayName ?? (receiverParticipant as Participant)?.login ?? '',
        amount,
        currency,
    );

    // STEP 3: Build optimistic receipt and transaction
    const optimisticTransaction = buildOptimisticTransaction({
        transactionParams: {
            amount: amount * -1,
            currency,
            reportID: optimisticInvoiceReport.reportID,
            comment: trimmedComment,
            created,
            merchant,
            receipt: receiptFile,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable: true,
        },
    });

    const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
    const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
        policyTags: getPolicyTagsData(optimisticInvoiceReport.policyID),
        policyRecentlyUsedTags,
        transactionTags: tag,
    });
    const optimisticRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);

    // STEP 4: Add optimistic personal details for participant
    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !getAllPersonalDetails()[receiverAccountID];
    if (shouldCreateOptimisticPersonalDetails) {
        const receiverLogin = receiverParticipant && 'login' in receiverParticipant && receiverParticipant.login ? receiverParticipant.login : '';
        receiver = {
            accountID: receiverAccountID,
            displayName: formatPhoneNumber(receiverLogin),
            login: receiverLogin,
            isOptimisticPersonalDetail: true,
        };

        optimisticPersonalDetailListAction = {[receiverAccountID]: receiver};
    }

    // STEP 5: Build optimistic reportActions.
    const reportPreviewAction = buildOptimisticReportPreview(chatReport, optimisticInvoiceReport, trimmedComment, optimisticTransaction);
    optimisticInvoiceReport.parentReportActionID = reportPreviewAction.reportActionID;
    chatReport.lastVisibleActionCreated = reportPreviewAction.created;
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        buildOptimisticMoneyRequestEntities({
            iouReport: optimisticInvoiceReport,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment: trimmedComment,
            payeeEmail: receiver.login ?? '',
            participants: [receiver],
            transactionID: optimisticTransaction.transactionID,
        });

    // STEP 6: Build Onyx Data
    const onyxData = buildOnyxDataForInvoice({
        chat: {report: chatReport, createdAction: optimisticCreatedActionForChat, reportPreviewAction, isNewReport: isNewChatReport},
        iou: {createdAction: optimisticCreatedActionForIOUReport, action: iouAction, report: optimisticInvoiceReport},
        transactionParams: {
            transaction: optimisticTransaction,
            threadReport: optimisticTransactionThread,
            threadCreatedReportAction: optimisticCreatedActionForTransactionThread,
        },
        policyParams: {policy, policyTagList, policyCategories},
        optimisticData: {
            personalDetailListAction: optimisticPersonalDetailListAction,
            recentlyUsedCurrencies: optimisticRecentlyUsedCurrencies,
            policyRecentlyUsedCategories: optimisticPolicyRecentlyUsedCategories,
            policyRecentlyUsedTags: optimisticPolicyRecentlyUsedTags,
        },
        participant: receiver,
        companyName,
        companyWebsite,
    });

    return {
        createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        reportActionID: iouAction.reportActionID,
        senderWorkspaceID,
        receiver,
        invoiceRoom: chatReport,
        createdChatReportActionID: optimisticCreatedActionForChat.reportActionID,
        invoiceReportID: optimisticInvoiceReport.reportID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        transactionID: optimisticTransaction.transactionID,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        onyxData,
    };
}

function sendInvoice({
    currentUserAccountID,
    transaction,
    policyRecentlyUsedCurrencies,
    invoiceChatReport,
    receiptFile,
    policy,
    policyTagList,
    policyCategories,
    invoiceChatReportID,
    companyName,
    companyWebsite,
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
}: SendInvoiceOptions) {
    const parsedComment = getParsedComment(transaction?.comment?.comment?.trim() ?? '');
    if (transaction?.comment) {
        // eslint-disable-next-line no-param-reassign
        transaction.comment.comment = parsedComment;
    }
    const {
        senderWorkspaceID,
        receiver,
        invoiceRoom,
        createdChatReportActionID,
        invoiceReportID,
        reportPreviewReportActionID,
        transactionID,
        transactionThreadReportID,
        createdIOUReportActionID,
        createdReportActionIDForThread,
        reportActionID,
        onyxData,
    } = getSendInvoiceInformation({
        transaction,
        currentUserAccountID,
        policyRecentlyUsedCurrencies,
        invoiceChatReportID,
        invoiceChatReport,
        receiptFile,
        policy,
        policyTagList,
        policyCategories,
        companyName,
        companyWebsite,
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
    });

    const parameters: SendInvoiceParams = {
        createdIOUReportActionID,
        createdReportActionIDForThread,
        reportActionID,
        senderWorkspaceID,
        accountID: currentUserAccountID,
        amount: transaction?.amount ?? 0,
        currency: transaction?.currency ?? '',
        comment: parsedComment,
        merchant: transaction?.merchant ?? '',
        category: transaction?.category,
        date: transaction?.created ?? '',
        invoiceRoomReportID: invoiceRoom.reportID,
        createdChatReportActionID,
        invoiceReportID,
        reportPreviewReportActionID,
        transactionID,
        transactionThreadReportID,
        companyName,
        companyWebsite,
        description: parsedComment,
        ...(invoiceChatReport?.reportID ? {receiverInvoiceRoomID: invoiceChatReport.reportID} : {receiverEmail: receiver.login ?? ''}),
    };

    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.SEND_INVOICE, parameters, onyxData);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));

    if (isSearchTopmostFullScreenRoute()) {
        Navigation.dismissModal();
    } else {
        Navigation.dismissModalWithReport({reportID: invoiceRoom.reportID});
    }

    notifyNewAction(invoiceRoom.reportID, currentUserAccountID);
}

export {getReceiverType, getSendInvoiceInformation, sendInvoice};
