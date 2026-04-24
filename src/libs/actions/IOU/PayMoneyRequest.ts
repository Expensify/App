import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {PayInvoiceParams, PayMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getAllReportActions, getReportActionHtml, getReportActionText, isCreatedAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCancelPaymentReportAction,
    buildOptimisticIOUReportAction,
    getReportTransactions,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOutstandingChildRequest,
    isExpenseReport,
    isIndividualInvoiceRoom,
    isInvoiceReport as isInvoiceReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {buildPolicyData, generatePolicyID} from '@userActions/Policy/Policy';
import type {BuildPolicyDataKeys} from '@userActions/Policy/Policy';
import {completeOnboarding, notifyNewAction} from '@userActions/Report';
import {getOnboardingMessages} from '@userActions/Welcome/OnboardingFlow';
import type {OnboardingCompanySize} from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllPersonalDetails, getAllTransactionViolations, getCurrentUserEmail, getReportPreviewAction, getUserAccountID} from '.';
import {getReportFromHoldRequestsOnyxData} from './Hold';

type PayInvoiceArgs = {
    paymentMethodType: PaymentMethodType;
    chatReport: OnyxTypes.Report;
    invoiceReport: OnyxEntry<OnyxTypes.Report>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    invoiceReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    payAsBusiness?: boolean;
    existingB2BInvoiceReport?: OnyxEntry<OnyxTypes.Report>;
    methodID?: number;
    paymentMethod?: PaymentMethod;
    activePolicy?: OnyxTypes.Policy;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean | undefined;
};

type PayMoneyRequestData = {
    params: PayMoneyRequestParams & Partial<PayInvoiceParams>;
    onyxData: OnyxData<
        | typeof ONYXKEYS.NVP_ACTIVE_POLICY_ID
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
        | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        | BuildPolicyDataKeys
    >;
};

type PayMoneyRequestFunctionParams = {
    paymentType: PaymentMethodType;
    chatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    iouReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    currentUserAccountID: number;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    paymentPolicyID?: string;
    full?: boolean;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean | undefined;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd?: OnyxEntry<number>;
    methodID?: number;
    onPaid?: () => void;
};

function getPayMoneyRequestParams({
    initialChatReport,
    iouReport,
    recipient,
    paymentMethodType,
    full,
    reportPolicy,
    payAsBusiness,
    bankAccountID,
    currentUserAccountIDParam,
    currentUserEmailParam,
    introSelected,
    paymentPolicyID,
    lastUsedPaymentMethod,
    existingB2BInvoiceReport,
    activePolicy,
    iouReportCurrentNextStepDeprecated,
    betas,
    isSelfTourViewed,
    formatPhoneNumber,
}: {
    initialChatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    recipient: Participant;
    paymentMethodType: PaymentMethodType;
    full: boolean;
    reportPolicy?: OnyxEntry<OnyxTypes.Policy>;
    payAsBusiness?: boolean;
    bankAccountID?: number;
    paymentPolicyID?: string | undefined;
    lastUsedPaymentMethod?: OnyxTypes.LastPaymentMethodType;
    existingB2BInvoiceReport?: OnyxEntry<OnyxTypes.Report>;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam: number;
    currentUserEmailParam?: string;
    introSelected?: OnyxEntry<OnyxTypes.IntroSelected>;
    iouReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean | undefined;
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'];
}): PayMoneyRequestData {
    const deprecatedCurrentUserEmail = getCurrentUserEmail();
    const allTransactionViolations = getAllTransactionViolations();

    const isInvoiceReport = isInvoiceReportReportUtils(iouReport);
    let payerPolicyID = activePolicy?.id;
    let chatReport = initialChatReport;
    let policyParams = {};
    const onyxData: OnyxData<
        | typeof ONYXKEYS.NVP_ACTIVE_POLICY_ID
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
        | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        | BuildPolicyDataKeys
    > = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };
    const shouldCreatePolicy = !activePolicy || !isPolicyAdmin(activePolicy) || !isPaidGroupPolicy(activePolicy);

    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && shouldCreatePolicy) {
        payerPolicyID = generatePolicyID();
        const {
            optimisticData: policyOptimisticData,
            failureData: policyFailureData,
            successData: policySuccessData,
            params,
        } = buildPolicyData({
            policyOwnerEmail: deprecatedCurrentUserEmail,
            makeMeAdmin: true,
            policyID: payerPolicyID,
            currentUserAccountIDParam: currentUserAccountIDParam ?? CONST.DEFAULT_NUMBER_ID,
            currentUserEmailParam: currentUserEmailParam ?? '',
            introSelected,
            activePolicyID: activePolicy?.id,
            companySize: introSelected?.companySize as OnboardingCompanySize,
            betas,
            isSelfTourViewed,
        });
        const {adminsChatReportID, adminsCreatedReportActionID, expenseChatReportID, expenseCreatedReportActionID, customUnitRateID, customUnitID, ownerEmail, policyName} = params;

        policyParams = {
            policyID: payerPolicyID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        };

        onyxData.optimisticData?.push(...(policyOptimisticData ?? []), {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: payerPolicyID});
        onyxData.successData?.push(...(policySuccessData ?? []));
        onyxData.failureData?.push(...(policyFailureData ?? []), {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: activePolicy?.id ?? null});
    }

    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && existingB2BInvoiceReport) {
        chatReport = existingB2BInvoiceReport;
    }

    let total = (iouReport?.total ?? 0) - (iouReport?.nonReimbursableTotal ?? 0);
    if (hasHeldExpensesReportUtils(iouReport?.reportID) && !full && !!iouReport?.unheldTotal) {
        total = iouReport.unheldTotal - (iouReport?.unheldNonReimbursableTotal ?? 0);
    }

    const optimisticIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount: isExpenseReport(iouReport) ? -total : total,
        currency: iouReport?.currency ?? '',
        comment: '',
        participants: [recipient],
        transactionID: '',
        paymentType: paymentMethodType,
        iouReportID: iouReport?.reportID,
        isSettlingUp: true,
        payAsBusiness,
        bankAccountID,
    });

    // In some instances, the report preview action might not be available to the payer (only whispered to the requestor)
    // hence we need to make the updates to the action safely.
    let optimisticReportPreviewAction = null;
    const reportPreviewAction = getReportPreviewAction(chatReport.reportID, iouReport?.reportID);
    if (reportPreviewAction) {
        optimisticReportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, true);
    }
    let currentNextStepDeprecated = null;
    let optimisticNextStepDeprecated = null;
    let optimisticNextStep = null;
    if (!isInvoiceReport) {
        currentNextStepDeprecated = iouReportCurrentNextStepDeprecated ?? null;
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        optimisticNextStepDeprecated = buildNextStepNew({report: iouReport, predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED, formatPhoneNumber});
        optimisticNextStep = buildOptimisticNextStep({report: iouReport, predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED});
    }

    const optimisticChatReport = {
        ...chatReport,
        lastReadTime: DateUtils.getDBTime(),
        hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport?.reportID, deprecatedCurrentUserEmail, currentUserAccountIDParam, allTransactionViolations, undefined),
        iouReportID: null,
        lastMessageText: getReportActionText(optimisticIOUReportAction),
        lastMessageHtml: getReportActionHtml(optimisticIOUReportAction),
    };
    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && payerPolicyID) {
        optimisticChatReport.invoiceReceiver = {
            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
            policyID: payerPolicyID,
        };
    }

    onyxData.optimisticData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: optimisticChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                lastMessageText: getReportActionText(optimisticIOUReportAction),
                lastMessageHtml: getReportActionHtml(optimisticIOUReportAction),
                lastVisibleActionCreated: optimisticIOUReportAction.created,
                hasOutstandingChildRequest: false,
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                pendingFields: {
                    preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                nextStep: optimisticNextStep,
                errors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
            value: optimisticNextStepDeprecated,
        },
    );

    if (iouReport?.policyID) {
        const prevLastUsedPaymentMethod = lastUsedPaymentMethod?.lastUsed?.name;
        const usedPaymentOption = paymentPolicyID ?? paymentMethodType;

        const optimisticLastPaymentMethod = {
            [iouReport.policyID]: {
                ...(iouReport.type ? {[iouReport.type]: {name: usedPaymentOption}} : {}),
                ...(isInvoiceReport ? {invoice: {name: paymentMethodType, bankAccountID}} : {}),
                lastUsed: {
                    name: prevLastUsedPaymentMethod !== usedPaymentOption && !!prevLastUsedPaymentMethod ? prevLastUsedPaymentMethod : usedPaymentOption,
                },
            },
        };

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: optimisticLastPaymentMethod,
        });
    }

    onyxData.successData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                pendingFields: {
                    preview: null,
                    reimbursed: null,
                    partial: null,
                    nextStep: null,
                },
                errors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    );

    onyxData.failureData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other', 0),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                ...iouReport,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: chatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
            value: currentNextStepDeprecated,
        },
    );

    // In case the report preview action is loaded locally, let's update it.
    if (optimisticReportPreviewAction) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction,
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: {
                    created: optimisticReportPreviewAction.created,
                },
            },
        });
    }

    // Optimistically unhold all transactions if we pay all requests
    if (full) {
        const reportTransactions = getReportTransactions(iouReport?.reportID);
        for (const transaction of reportTransactions) {
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: null,
                    },
                },
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: transaction.comment?.hold,
                    },
                },
            });
        }

        const optimisticTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = reportTransactions.map(({transactionID}) => {
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: null,
            };
        });
        onyxData.optimisticData?.push(...optimisticTransactionViolations);

        const failureTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = reportTransactions.map(({transactionID}) => {
            const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: violations,
            };
        });
        onyxData.failureData?.push(...failureTransactionViolations);
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    if (!full) {
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData({chatReport, iouReport, recipient, policy: reportPolicy, betas});

        onyxData.optimisticData?.push(...holdReportOnyxData.optimisticData);
        onyxData.successData?.push(...holdReportOnyxData.successData);
        onyxData.failureData?.push(...holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
    }

    return {
        params: {
            iouReportID: iouReport?.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            full,
            amount: Math.abs(total),
            optimisticHoldReportID,
            optimisticHoldActionID,
            optimisticHoldReportExpenseActionIDs,
            ...(bankAccountID != null ? {bankAccountID} : {}),
            ...policyParams,
        },
        onyxData,
    };
}

function cancelPayment(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxTypes.Report,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isASAPSubmitBetaEnabled: boolean,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'],
) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const optimisticReportAction = buildOptimisticCancelPaymentReportAction(
        expenseReport.reportID,
        -((expenseReport.total ?? 0) - (expenseReport?.nonReimbursableTotal ?? 0)),
        expenseReport.currency ?? '',
        currentUserAccountIDParam,
    );
    const approvalMode = policy?.approvalMode ?? CONST.POLICY.APPROVAL_MODE.BASIC;

    const stateNum: ValueOf<typeof CONST.REPORT.STATE_NUM> = CONST.REPORT.STATE_NUM.APPROVED;
    const statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM> = approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.APPROVED;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: statusNum,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        formatPhoneNumber,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: statusNum,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });
    const iouReportActions = getAllReportActions(chatReport.iouReportID);
    const expenseReportActions = getAllReportActions(expenseReport.reportID);
    const iouCreatedAction = Object.values(iouReportActions).find((action) => isCreatedAction(action));
    const expenseCreatedAction = Object.values(expenseReportActions).find((action) => isCreatedAction(action));
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    ...(optimisticReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: (iouCreatedAction?.created ?? '') > (expenseCreatedAction?.created ?? '') ? chatReport?.iouReportID : expenseReport.reportID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                isWaitingOnBankAccount: false,
                lastVisibleActionCreated: optimisticReportAction?.created,
                lastMessageText: getReportActionText(optimisticReportAction),
                lastMessageHtml: getReportActionHtml(optimisticReportAction),
                stateNum,
                statusNum,
                isCancelledIOU: true,
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    });

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                isWaitingOnBankAccount: expenseReport.isWaitingOnBankAccount,
                isCancelledIOU: false,
                nextStep:
                    buildOptimisticNextStep({
                        report: expenseReport,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED,
                    }) ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: stateNum,
                    childStatusNum: statusNum,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    if (chatReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: expenseReport.reportID,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                hasOutstandingChildRequest: chatReport.hasOutstandingChildRequest,
                iouReportID: chatReport.iouReportID,
            },
        });
    }
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        value: buildNextStepNew({
            report: expenseReport,
            predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED,
            formatPhoneNumber,
        }),
    });

    API.write(
        WRITE_COMMANDS.CANCEL_PAYMENT,
        {
            iouReportID: expenseReport.reportID,
            chatReportID: chatReport.reportID,
            managerAccountID: expenseReport.managerID ?? CONST.DEFAULT_NUMBER_ID,
            reportActionID: optimisticReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );

    notifyNewAction(expenseReport.reportID, undefined, true);
}

/**
 * Completes onboarding for invite link flow based on the selected payment option
 *
 * @param paymentSelected based on which we choose the onboarding choice and concierge message
 */
function completePaymentOnboarding(
    paymentSelected: ValueOf<typeof CONST.PAYMENT_SELECTED>,
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
    isSelfTourViewed: boolean | undefined,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
    adminsChatReportID?: string,
    onboardingPolicyID?: string,
) {
    const deprecatedUserAccountID = getUserAccountID();

    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;

    if (isInviteOnboardingComplete || !introSelected?.choice || !introSelected?.inviteType) {
        return;
    }

    const personalDetailsListValues = Object.values(getPersonalDetailsForAccountIDs(deprecatedUserAccountID ? [deprecatedUserAccountID] : [], getAllPersonalDetails()));
    const personalDetails = personalDetailsListValues.at(0);

    let onboardingPurpose = introSelected?.choice;
    if (introSelected?.inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU && paymentSelected === CONST.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST.ONBOARDING_CHOICES.MANAGE_TEAM;
    }

    if (introSelected?.inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE && paymentSelected !== CONST.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST.ONBOARDING_CHOICES.CHAT_SPLIT;
    }
    const {onboardingMessages} = getOnboardingMessages();

    completeOnboarding({
        engagementChoice: onboardingPurpose,
        onboardingMessage: onboardingMessages[onboardingPurpose],
        firstName: personalDetails?.firstName,
        lastName: personalDetails?.lastName,
        adminsChatReportID,
        onboardingPolicyID,
        paymentSelected,
        wasInvited: true,
        companySize: introSelected?.companySize as OnboardingCompanySize,
        introSelected,
        isSelfTourViewed,
        betas,
    });
}

function payMoneyRequest(params: PayMoneyRequestFunctionParams) {
    const {
        paymentType,
        chatReport,
        iouReport,
        introSelected,
        iouReportCurrentNextStepDeprecated,
        currentUserAccountID,
        paymentPolicyID,
        userBillingGracePeriodEnds,
        full = true,
        activePolicy,
        policy,
        betas,
        isSelfTourViewed,
        amountOwed,
        ownerBillingGracePeriodEnd,
        methodID,
        onPaid,
    } = params;
    if (chatReport.policyID && shouldRestrictUserBillableActions(chatReport.policyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(chatReport.policyID));
        return;
    }

    const paymentSelected = paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected, introSelected, isSelfTourViewed, betas);

    const recipient = {accountID: iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const {params: payMoneyRequestParams, onyxData} = getPayMoneyRequestParams({
        initialChatReport: chatReport,
        iouReport,
        recipient,
        paymentMethodType: paymentType,
        full,
        paymentPolicyID,
        activePolicy,
        reportPolicy: policy,
        iouReportCurrentNextStepDeprecated,
        currentUserAccountIDParam: currentUserAccountID,
        betas,
        isSelfTourViewed,
        bankAccountID: paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
    });

    // For now, we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    const apiCommand = paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET : WRITE_COMMANDS.PAY_MONEY_REQUEST;

    onPaid?.();
    playSound(SOUNDS.SUCCESS);
    API.write(apiCommand, payMoneyRequestParams, onyxData);
    notifyNewAction(!full ? (Navigation.getTopmostReportId() ?? iouReport?.reportID) : iouReport?.reportID, undefined, true);
    return payMoneyRequestParams.optimisticHoldReportID;
}

function payInvoice({
    paymentMethodType,
    chatReport,
    invoiceReport,
    introSelected,
    currentUserAccountIDParam,
    currentUserEmailParam,
    payAsBusiness = false,
    existingB2BInvoiceReport,
    methodID,
    paymentMethod,
    activePolicy,
    invoiceReportCurrentNextStepDeprecated,
    betas,
    isSelfTourViewed,
}: PayInvoiceArgs) {
    const recipient = {accountID: invoiceReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const {
        onyxData,
        params: {
            reportActionID,
            policyID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        },
    } = getPayMoneyRequestParams({
        initialChatReport: chatReport,
        iouReport: invoiceReport,
        iouReportCurrentNextStepDeprecated: invoiceReportCurrentNextStepDeprecated,
        recipient,
        paymentMethodType,
        full: true,
        payAsBusiness,
        bankAccountID: methodID,
        existingB2BInvoiceReport,
        activePolicy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        introSelected,
        betas,
        isSelfTourViewed,
    });

    const paymentSelected = paymentMethodType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected, introSelected, isSelfTourViewed, betas);

    let params: PayInvoiceParams = {
        reportID: invoiceReport?.reportID,
        reportActionID,
        paymentMethodType,
        payAsBusiness,
    };

    if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
        params.bankAccountID = methodID;
    }

    if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
        params.fundID = methodID;
    }

    if (policyID) {
        params = {
            ...params,
            policyID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        };
    }

    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.PAY_INVOICE, params, onyxData);
}

/** Save the preferred payment method for a policy or personal DM */
function savePreferredPaymentMethod(
    policyID: string | undefined,
    paymentMethod: string,
    type: ValueOf<typeof CONST.LAST_PAYMENT_METHOD> | undefined,
    prevPaymentMethod?: OnyxTypes.LastPaymentMethodType | string,
) {
    if (!policyID) {
        return;
    }

    // to make it easier to revert to the previous last payment method, we will save it to this key
    Onyx.merge(`${ONYXKEYS.NVP_LAST_PAYMENT_METHOD}`, {
        [policyID]: type
            ? {
                  [type]: {name: paymentMethod},
                  [CONST.LAST_PAYMENT_METHOD.LAST_USED]: {name: typeof prevPaymentMethod === 'string' ? prevPaymentMethod : (prevPaymentMethod?.lastUsed?.name ?? paymentMethod)},
              }
            : paymentMethod,
    });
}

export {cancelPayment, completePaymentOnboarding, payInvoice, payMoneyRequest, savePreferredPaymentMethod};
export type {PayInvoiceArgs, PayMoneyRequestData, PayMoneyRequestFunctionParams};
