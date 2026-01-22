import {Str} from 'expensify-common';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PaymentMethodType} from '@components/KYCWall/types';
import * as API from '@libs/API';
import type {SendMoneyParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    buildOptimisticChatReport,
    buildOptimisticIOUReport,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticReportPreview,
    getChatByParticipants,
    getParsedComment,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import {notifyNewAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {dismissModalAndOpenReportInInboxTab} from '.';

type SendMoneyParamsData = {
    params: SendMoneyParams;
    optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
        >
    >;
    successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    >;
    failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    >;
};

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function getSendMoneyParams({
    report,
    quickAction,
    amount,
    currency,
    commentParam,
    paymentMethodType,
    managerID,
    recipient,
    created,
    merchant,
    receipt,
}: {
    report: OnyxEntry<OnyxTypes.Report>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    amount: number;
    currency: string;
    commentParam: string;
    paymentMethodType: PaymentMethodType;
    managerID: number;
    recipient: Participant;
    created?: string;
    merchant?: string;
    receipt?: Receipt;
}): SendMoneyParamsData {
    const recipientEmail = addSMSDomainIfPhoneNumber(recipient.login ?? '');
    const recipientAccountID = Number(recipient.accountID);
    const comment = getParsedComment(commentParam);
    const newIOUReportDetails = JSON.stringify({
        amount,
        currency,
        requestorEmail: recipientEmail,
        requestorAccountID: recipientAccountID,
        comment,
        idempotencyKey: Str.guid(),
        ...(created && {created}),
        ...(merchant && {merchant}),
    });

    let chatReport = !isEmptyObject(report) && report?.reportID ? report : getChatByParticipants([recipientAccountID, managerID]);
    let isNewChat = false;
    if (!chatReport) {
        chatReport = buildOptimisticChatReport({
            participantList: [recipientAccountID, managerID],
        });
        isNewChat = true;
    }
    const optimisticIOUReport = buildOptimisticIOUReport(recipientAccountID, managerID, amount, chatReport.reportID, currency, true);

    const optimisticTransaction = buildOptimisticTransaction({
        transactionParams: {
            amount,
            currency,
            reportID: optimisticIOUReport.reportID,
            comment,
            created,
            merchant,
            receipt,
        },
    });
    const optimisticTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
        value: optimisticTransaction,
    };

    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, optimisticIOUReportAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        buildOptimisticMoneyRequestEntities({
            iouReport: optimisticIOUReport,
            type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            amount,
            currency,
            comment,
            payeeEmail: recipientEmail,
            participants: [recipient],
            transactionID: optimisticTransaction.transactionID,
            paymentType: paymentMethodType,
            isSendMoneyFlow: true,
        });

    const reportPreviewAction = buildOptimisticReportPreview(chatReport, optimisticIOUReport);

    // Change the method to set for new reports because it doesn't exist yet, is faster,
    // and we need the data to be available when we navigate to the chat page
    const optimisticChatReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = isNewChat
        ? {
              onyxMethod: Onyx.METHOD.SET,
              key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
              value: {
                  ...chatReport,
                  // Set and clear pending fields on the chat report
                  pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                  lastReadTime: DateUtils.getDBTime(),
                  lastVisibleActionCreated: reportPreviewAction.created,
              },
          }
        : {
              onyxMethod: Onyx.METHOD.MERGE,
              key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
              value: {
                  ...chatReport,
                  lastReadTime: DateUtils.getDBTime(),
                  lastVisibleActionCreated: reportPreviewAction.created,
              },
          };
    const optimisticQuickActionData: OnyxUpdate<typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE> = {
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: {
            action: CONST.QUICK_ACTIONS.SEND_MONEY,
            chatReportID: chatReport.reportID,
            isFirstQuickAction: isEmptyObject(quickAction),
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
        value: {
            ...optimisticIOUReport,
            lastMessageText: getReportActionText(optimisticIOUReportAction),
            lastMessageHtml: getReportActionHtml(optimisticIOUReportAction),
            pendingFields: {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticTransactionThreadData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
        value: optimisticTransactionThread,
    };
    const optimisticIOUReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
        value: {
            [optimisticCreatedActionForIOUReport.reportActionID]: optimisticCreatedActionForIOUReport,
            [optimisticIOUReportAction.reportActionID]: {
                ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticChatReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [reportPreviewAction.reportActionID]: reportPreviewAction,
        },
    };
    const optimisticTransactionThreadReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> | undefined = optimisticCreatedActionForTransactionThread
        ? {
              onyxMethod: Onyx.METHOD.MERGE,
              key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
              value: {[optimisticCreatedActionForTransactionThread?.reportActionID]: optimisticCreatedActionForTransactionThread},
          }
        : undefined;

    const optimisticMetaData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReport.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticTransactionThread.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
    ];

    const successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [];

    // Add optimistic personal details for recipient
    let optimisticPersonalDetailListData: OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST> | null = null;
    const optimisticPersonalDetailListAction = isNewChat
        ? {
              [recipientAccountID]: {
                  accountID: recipientAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: recipient.displayName || recipient.login,
                  login: recipient.login,
              },
          }
        : {};

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(optimisticPersonalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        for (const accountIDKey of Object.keys(optimisticPersonalDetailListAction)) {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        }

        optimisticPersonalDetailListData = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        };
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: {
                    createChat: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                participants: redundantParticipants,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticTransactionThread.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
            value: {
                [optimisticCreatedActionForIOUReport.reportActionID]: {pendingAction: null},
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReport.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    isOptimisticAction: null,
                    pendingAction: null,
                    childLastActorAccountID: reportPreviewAction.childLastActorAccountID,
                },
            },
        },
    );

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                errorFields: {
                    createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        },
    ];

    if (optimisticCreatedActionForTransactionThread?.reportActionID) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {[optimisticCreatedActionForTransactionThread?.reportActionID]: {pendingAction: null}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {[optimisticCreatedActionForTransactionThread?.reportActionID]: {errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage')}},
        });
    }

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {pendingFields: null, participants: redundantParticipants},
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
                value: {
                    [optimisticIOUReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        );

        const optimisticChatReportActionsValue = optimisticChatReportActionsData.value as Record<string, OnyxTypes.ReportAction>;

        if (optimisticChatReportActionsValue) {
            // Add an optimistic created action to the optimistic chat reportActions data
            optimisticChatReportActionsValue[optimisticCreatedActionForChat.reportActionID] = optimisticCreatedActionForChat;
        }
    } else {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        });
    }

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
        >
    > = [
        optimisticChatReportData,
        optimisticQuickActionData,
        optimisticIOUReportData,
        optimisticChatReportActionsData,
        optimisticIOUReportActionsData,
        optimisticTransactionData,
        optimisticTransactionThreadData,
        ...optimisticMetaData,
    ];

    if (optimisticTransactionThreadReportActionsData) {
        optimisticData.push(optimisticTransactionThreadReportActionsData);
    }
    if (!isEmptyObject(optimisticPersonalDetailListData)) {
        optimisticData.push(optimisticPersonalDetailListData);
    }

    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            transactionID: optimisticTransaction.transactionID,
            newIOUReportDetails,
            createdReportActionID: isNewChat ? optimisticCreatedActionForChat.reportActionID : undefined,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
            receipt,
            receiptState: receipt?.state,
        },
        optimisticData,
        successData,
        failureData,
    };
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyElsewhere(
    report: OnyxEntry<OnyxTypes.Report>,
    quickAction: OnyxEntry<OnyxTypes.QuickAction>,
    amount: number,
    currency: string,
    comment: string,
    managerID: number,
    recipient: Participant,
    created?: string,
    merchant?: string,
    receipt?: Receipt,
) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams({
        report,
        quickAction,
        amount,
        currency,
        commentParam: comment,
        paymentMethodType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        managerID,
        recipient,
        created,
        merchant,
        receipt,
    });
    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.SEND_MONEY_ELSEWHERE, params, {optimisticData, successData, failureData});

    dismissModalAndOpenReportInInboxTab(params.chatReportID);
    notifyNewAction(params.chatReportID, managerID);
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyWithWallet(
    report: OnyxEntry<OnyxTypes.Report>,
    quickAction: OnyxEntry<OnyxTypes.QuickAction>,
    amount: number,
    currency: string,
    comment: string,
    managerID: number,
    recipient: Participant | OptionData,
    created?: string,
    merchant?: string,
    receipt?: Receipt,
) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams({
        report,
        quickAction,
        amount,
        currency,
        commentParam: comment,
        paymentMethodType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
        managerID,
        recipient,
        created,
        merchant,
        receipt,
    });
    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.SEND_MONEY_WITH_WALLET, params, {optimisticData, successData, failureData});

    dismissModalAndOpenReportInInboxTab(params.chatReportID);
    notifyNewAction(params.chatReportID, managerID);
}

export {sendMoneyElsewhere, sendMoneyWithWallet};
