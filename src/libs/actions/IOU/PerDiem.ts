import {InteractionManager} from 'react-native';
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreatePerDiemRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertAmountToDisplayString, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {deferOrExecuteWrite} from '@libs/deferredLayoutWrite';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {validateAmount} from '@libs/MoneyRequestUtils';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getPerDiemCustomUnit, getPerDiemRateCustomUnitRate} from '@libs/PolicyUtils';
import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
import type {OptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReport,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticReportPreview,
    buildOptimisticSelfDMReport,
    generateReportID,
    getChatByParticipants,
    getReportOrDraftReport,
    isExpenseReport,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {addOptimization} from '@libs/telemetry/submitFollowUpAction';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {notifyNewAction} from '@userActions/Report';
import {removeDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {OnyxData} from '@src/types/onyx/Request';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    dismissModalAndOpenReportInInboxTab,
    getAllPersonalDetails,
    getAllReports,
    getCurrentUserEmail,
    getPolicyTags,
    getReportPreviewAction,
    getUserAccountID,
    highlightTransactionOnSearchRouteIfNeeded,
    mergePolicyRecentlyUsedCategories,
    mergePolicyRecentlyUsedCurrencies,
} from '.';
import type {BaseTransactionParams, MoneyRequestInformation, RequestMoneyParticipantParams} from './index';
import type BasePolicyParams from './types/BasePolicyParams';

function removeSubrate(transaction: OnyxEntry<OnyxTypes.Transaction>, currentIndex: string) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    const existingSubrates = transaction?.comment?.customUnit?.subRates ?? [];

    const newSubrates = [...existingSubrates];
    newSubrates.splice(index, 1);

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction: OnyxTypes.Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as OnyxTypes.Transaction),
        comment: {
            ...transaction?.comment,
            customUnit: {
                ...transaction?.comment?.customUnit,
                subRates: newSubrates,
                quantity: null,
            },
        },
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
}

function updateSubrate(transaction: OnyxEntry<OnyxTypes.Transaction>, currentIndex: string, quantity: number, id: string, name: string, rate: number) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    const existingSubrates = transaction?.comment?.customUnit?.subRates ?? [];

    if (index >= existingSubrates.length) {
        return;
    }

    const newSubrates = [...existingSubrates];
    newSubrates.splice(index, 1, {quantity, id, name, rate});

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction: OnyxTypes.Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as OnyxTypes.Transaction),
        comment: {
            ...transaction?.comment,
            customUnit: {
                ...transaction?.comment?.customUnit,
                subRates: newSubrates,
                quantity: null,
            },
        },
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
}

function clearSubrates(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {subRates: []}}});
}

function addSubrate(transaction: OnyxEntry<OnyxTypes.Transaction>, currentIndex: string, quantity: number, id: string, name: string, rate: number) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    const existingSubrates = transaction?.comment?.customUnit?.subRates ?? [];

    if (index !== existingSubrates.length) {
        return;
    }

    const newSubrates = [...existingSubrates];
    newSubrates.push({quantity, id, name, rate});

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction: OnyxTypes.Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as OnyxTypes.Transaction),
        comment: {
            ...transaction?.comment,
            customUnit: {
                ...transaction?.comment?.customUnit,
                subRates: newSubrates,
                quantity: null,
            },
        },
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
}

function computePerDiemExpenseAmount(customUnit: TransactionCustomUnit) {
    const subRates = customUnit.subRates ?? [];
    return subRates.reduce((total, subRate) => total + subRate.quantity * subRate.rate, 0);
}

function computePerDiemExpenseMerchant(customUnit: TransactionCustomUnit, policy: OnyxEntry<OnyxTypes.Policy>) {
    if (!customUnit.customUnitRateID) {
        return '';
    }
    const policyCustomUnit = getPerDiemCustomUnit(policy);
    const rate = policyCustomUnit?.rates?.[customUnit.customUnitRateID];
    const locationName = rate?.name ?? '';
    const startDate = customUnit.attributes?.dates.start;
    const endDate = customUnit.attributes?.dates.end;
    if (!startDate || !endDate) {
        return locationName;
    }
    const formattedTime = DateUtils.getFormattedDateRangeForPerDiem(new Date(startDate), new Date(endDate));
    return `${locationName}, ${formattedTime}`;
}

function isValidPerDiemExpenseAmount(customUnit: TransactionCustomUnit, decimals: number) {
    const perDiemAmountInCents = computePerDiemExpenseAmount(customUnit);
    const perDiemAmountString = convertToFrontendAmountAsString(perDiemAmountInCents, decimals);
    return validateAmount(perDiemAmountString, decimals, undefined, true);
}

function computeDefaultPerDiemExpenseComment(customUnit: TransactionCustomUnit, currency: string) {
    const subRates = customUnit.subRates ?? [];
    const subRateComments = subRates.map((subRate) => {
        const rate = subRate.rate ?? 0;
        const rateComment = subRate.name ?? '';
        const quantity = subRate.quantity ?? 0;
        return `${quantity}x ${rateComment} @ ${convertAmountToDisplayString(rate, currency)}`;
    });
    return subRateComments.join(', ');
}

type PerDiemExpenseTransactionParams = Omit<BaseTransactionParams, 'amount' | 'merchant' | 'customUnitRateID' | 'taxAmount' | 'taxCode' | 'comment'> & {
    attendees?: Attendee[];
    customUnit: TransactionCustomUnit;
    comment?: string;
};

type RecentlyUsedParams = {
    destinations?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
};

type PerDiemExpenseInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    recentlyUsedParams?: RecentlyUsedParams;
    transactionParams: PerDiemExpenseTransactionParams;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    customUnitPolicyID?: string;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    shouldPlaySound?: boolean;
    optimisticReportPreviewActionID?: string;
    shouldDeferAutoSubmit?: boolean;
    optimisticChatReportID?: string;
    shouldHandleNavigation?: boolean;
};

type PerDiemExpenseInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    transactionParams: PerDiemExpenseTransactionParams;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    recentlyUsedParams?: RecentlyUsedParams;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    moneyRequestReportID?: string;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    optimisticReportPreviewActionID?: string;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    optimisticChatReportID?: string;
};

type PerDiemExpenseInformationForSelfDM = {
    selfDMReport: OnyxTypes.Report | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    transactionParams: PerDiemExpenseTransactionParams;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    shouldHandleNavigation?: boolean;
};

type PerDiemExpenseInformationForSelfDMResult = {
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
    onyxData: OnyxData<
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
    >;
};

/**
 * Gathers all the data needed to submit a per diem expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getPerDiemExpenseInformation(perDiemExpenseInformation: PerDiemExpenseInformationParams): MoneyRequestInformation {
    const {
        parentChatReport,
        transactionParams,
        participantParams,
        policyParams = {},
        recentlyUsedParams = {},
        existingIOUReport: existingIOUReportParam,
        moneyRequestReportID = '',
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        betas,
        optimisticReportPreviewActionID,
        personalDetails,
        optimisticChatReportID,
    } = perDiemExpenseInformation;
    const {payeeAccountID = getUserAccountID(), payeeEmail = getCurrentUserEmail(), participant} = participantParams;
    const {policy, policyCategories, policyTagList, policyRecentlyUsedCategories, policyRecentlyUsedTags} = policyParams;
    const {destinations: recentlyUsedDestinations} = recentlyUsedParams;
    const {comment = '', currency, created, category, tag, customUnit, billable, attendees, reimbursable} = transactionParams;

    const amount = computePerDiemExpenseAmount(customUnit);
    const merchant = computePerDiemExpenseMerchant(customUnit, policy);
    const defaultComment = computeDefaultPerDiemExpenseComment(customUnit, currency);
    const finalComment = comment || defaultComment;

    const payerEmail = addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    const allReports = getAllReports();
    const allPersonalDetails = getAllPersonalDetails();

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    if (!chatReport) {
        chatReport = getChatByParticipants([payerAccountID, payeeAccountID]) ?? null;
    }

    // If we still don't have a report, it likely doesn't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = buildOptimisticChatReport({
            participantList: [payerAccountID, payeeAccountID],
            optimisticReportID: optimisticChatReportID,
            currentUserAccountID: currentUserAccountIDParam,
        });
    }

    // STEP 2: Get the Expense/IOU report. If the existingIOUReport or moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    if (existingIOUReportParam) {
        iouReport = existingIOUReportParam;
    } else if (moneyRequestReportID) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
    } else {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
    }

    const shouldCreateNewMoneyRequestReport = shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, false, betas);

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = NumberUtils.rand64();
    const optimisticReportID = generateReportID();

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticReportID, created, amount, currency, merchant);

        iouReport = isPolicyExpenseChat
            ? buildOptimisticExpenseReport({
                  chatReportID: chatReport.reportID,
                  policyID: chatReport.policyID,
                  payeeAccountID,
                  total: amount,
                  currency,
                  optimisticIOUReportID: optimisticReportID,
                  reportTransactions,
                  betas,
              })
            : buildOptimisticIOUReport(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency);
    } else if (isPolicyExpenseChat) {
        iouReport = {...iouReport};
        // Because of the Expense reports are stored as negative values, we subtract the total from the amount
        if (iouReport?.currency === currency) {
            if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
                iouReport.total -= amount;
            }

            if (typeof iouReport.unheldTotal === 'number') {
                iouReport.unheldTotal -= amount;
            }
        }
    } else {
        iouReport = updateIOUOwnerAndTotal(iouReport, payeeAccountID, amount, currency);
    }

    // STEP 3: Build an optimistic transaction
    const optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        policy,
        transactionParams: {
            amount: isExpenseReport(iouReport) ? -amount : amount,
            currency,
            reportID: iouReport.reportID,
            comment: finalComment,
            created,
            category,
            merchant,
            tag,
            customUnit,
            billable,
            reimbursable,
            pendingFields: {subRates: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            attendees,
        },
    });
    iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;

    // This is to differentiate between a normal expense and a per diem expense
    optimisticTransaction.iouRequestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
    optimisticTransaction.hasEReceipt = true;
    const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
    const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
        // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        policyTags: getPolicyTags()?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${iouReport.policyID}`] ?? {},
        policyRecentlyUsedTags,
        transactionTags: tag,
    });
    const optimisticPolicyRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);
    const optimisticPolicyRecentlyUsedDestinations = customUnit.customUnitRateID ? [...new Set([customUnit.customUnitRateID, ...(recentlyUsedDestinations ?? [])])] : [];

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        buildOptimisticMoneyRequestEntities({
            iouReport,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment,
            payeeEmail,
            participants: [participant],
            transactionID: optimisticTransaction.transactionID,
        });

    let reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

    if (reportPreviewAction) {
        reportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    } else {
        reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction, undefined, optimisticReportPreviewActionID);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;

        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }

    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[payerAccountID];
    // Add optimistic personal details for participant
    const optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? {
              [payerAccountID]: {
                  accountID: payerAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: formatPhoneNumber(participant.displayName || payerEmail),
                  login: participant.login,
                  isOptimisticPersonalDetail: true,
              },
          }
        : {};

    const predictedNextStatus =
        iouReport.statusNum ?? (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.OPEN);
    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: iouReport,
        predictedNextStatus,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        policy,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: iouReport,
        predictedNextStatus,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        policy,
    });

    // STEP 5: Build Onyx Data
    const {optimisticData, successData, failureData} = buildOnyxDataForMoneyRequest({
        participant,
        isNewChatReport,
        shouldCreateNewMoneyRequestReport,
        policyParams: {
            policy,
            policyCategories,
            policyTagList,
        },
        isASAPSubmitBetaEnabled,
        optimisticParams: {
            chat: {
                report: chatReport,
                createdAction: optimisticCreatedActionForChat,
                reportPreviewAction,
            },
            iou: {
                report: iouReport,
                createdAction: optimisticCreatedActionForIOUReport,
                action: iouAction,
            },
            transactionParams: {
                transaction: optimisticTransaction,
                transactionThreadReport: optimisticTransactionThread,
                transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            },
            policyRecentlyUsed: {
                categories: optimisticPolicyRecentlyUsedCategories,
                tags: optimisticPolicyRecentlyUsedTags,
                currencies: optimisticPolicyRecentlyUsedCurrencies,
                destinations: optimisticPolicyRecentlyUsedDestinations,
            },
            personalDetailListAction: optimisticPersonalDetailListAction,
            nextStep: optimisticNextStep,
            nextStepDeprecated: optimisticNextStepDeprecated,
        },
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        personalDetails,
    });

    return {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : undefined,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread?.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
        billable,
        reimbursable,
    };
}

/**
 * Gathers all the data needed to submit a per diem expense from self DM.
 */
function getPerDiemExpenseInformationForSelfDM(perDiemExpenseInformation: PerDiemExpenseInformationForSelfDM): PerDiemExpenseInformationForSelfDMResult {
    const {selfDMReport, transactionParams, policy, currentUserAccountIDParam, currentUserEmailParam, quickAction} = perDiemExpenseInformation;
    const {comment = '', currency, created, category, tag, customUnit, billable, attendees, reimbursable} = transactionParams;

    const amount = computePerDiemExpenseAmount(customUnit);
    const merchant = computePerDiemExpenseMerchant(customUnit, policy);
    const defaultComment = computeDefaultPerDiemExpenseComment(customUnit, currency);
    const finalComment = comment || defaultComment;

    const onyxData: OnyxData<
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
    > = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };

    let chatReport = selfDMReport;

    let optimisticSelfDMReportID: string | undefined;
    let optimisticSelfDMCreatedReportActionID: string | undefined;

    // If we don't have a self DM report, create an optimistic one
    if (!chatReport) {
        const currentTime = DateUtils.getDBTime();
        const optimisticSelfDMReport = buildOptimisticSelfDMReport(currentTime);
        const selfDMCreatedReportAction = buildOptimisticCreatedReportAction(currentUserEmailParam, currentTime);
        optimisticSelfDMReportID = optimisticSelfDMReport.reportID;
        optimisticSelfDMCreatedReportActionID = selfDMCreatedReportAction.reportActionID;
        chatReport = optimisticSelfDMReport;

        onyxData.optimisticData?.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticSelfDMReportID}`,
                value: {
                    ...optimisticSelfDMReport,
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticSelfDMReportID}`,
                value: {isOptimisticReport: true},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticSelfDMReportID}`,
                value: {
                    [optimisticSelfDMCreatedReportActionID]: selfDMCreatedReportAction,
                },
            },
        );
        onyxData.successData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticSelfDMReportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticSelfDMReportID}`,
                value: {isOptimisticReport: false},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticSelfDMReportID}`,
                value: {
                    [optimisticSelfDMCreatedReportActionID]: {
                        pendingAction: null,
                    },
                },
            },
        );
        onyxData.failureData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticSelfDMReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticSelfDMReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticSelfDMReportID}`,
                value: null,
            },
        );
    }

    onyxData.optimisticData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: {
            action: CONST.QUICK_ACTIONS.TRACK_PER_DIEM,
            chatReportID: chatReport?.reportID,
            isFirstQuickAction: isEmptyObject(quickAction),
            perDiemPolicyID: policy?.id,
        },
    });
    onyxData.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: quickAction ?? null,
    });

    const optimisticTransactionID = NumberUtils.rand64();
    const optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        policy,
        transactionParams: {
            amount: -amount,
            currency,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            comment: finalComment,
            created,
            category,
            merchant,
            tag,
            customUnit,
            billable,
            reimbursable,
            pendingFields: {subRates: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            attendees,
        },
    });

    optimisticTransaction.iouRequestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
    optimisticTransaction.hasEReceipt = true;

    const participant: Participant = {
        accountID: currentUserAccountIDParam,
        login: currentUserEmailParam,
    };

    const [, , iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] = buildOptimisticMoneyRequestEntities({
        iouReport: chatReport,
        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        amount,
        currency,
        comment: finalComment,
        payeeEmail: currentUserEmailParam,
        participants: [participant],
        transactionID: optimisticTransaction.transactionID,
        isPersonalTrackingExpense: true,
    });

    onyxData.optimisticData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                lastMessageText: getReportActionText(iouAction),
                lastMessageHtml: getReportActionHtml(iouAction),
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: iouAction.created,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: optimisticTransaction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                ...optimisticTransactionThread,
                pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticTransactionThread.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
    );

    if (!isEmptyObject(optimisticCreatedActionForTransactionThread)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {
                [optimisticCreatedActionForTransactionThread.reportActionID]: optimisticCreatedActionForTransactionThread,
            },
        });
    }

    onyxData.successData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticTransactionThread.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
    );

    if (!isEmptyObject(optimisticCreatedActionForTransactionThread)) {
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {
                [optimisticCreatedActionForTransactionThread.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    onyxData.failureData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticTransactionThread.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
    );

    return {
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        onyxData,
    };
}

/**
 * Submit per diem expense to another user
 */
function submitPerDiemExpense(submitPerDiemExpenseInformation: PerDiemExpenseInformation) {
    const {
        report,
        participantParams,
        policyParams = {},
        recentlyUsedParams = {},
        transactionParams,
        existingIOUReport,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        betas,
        customUnitPolicyID,
        personalDetails,
        shouldPlaySound: shouldPlaySoundParam = true,
        optimisticReportPreviewActionID,
        shouldDeferAutoSubmit,
        optimisticChatReportID,
        shouldHandleNavigation = true,
    } = submitPerDiemExpenseInformation;
    const {currency, comment = '', category, tag, created, customUnit, attendees, isFromGlobalCreate} = transactionParams;

    if (
        isEmptyObject(policyParams.policy) ||
        isEmptyObject(customUnit) ||
        !customUnit.customUnitID ||
        !customUnit.customUnitRateID ||
        (customUnit.subRates ?? []).length === 0 ||
        isEmptyObject(customUnit.attributes)
    ) {
        return;
    }

    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

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
        onyxData,
        billable,
        reimbursable,
    } = getPerDiemExpenseInformation({
        parentChatReport: currentChatReport,
        participantParams,
        policyParams,
        recentlyUsedParams,
        transactionParams,
        existingIOUReport,
        moneyRequestReportID,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        betas,
        optimisticReportPreviewActionID,
        personalDetails,
        optimisticChatReportID,
    });

    const activeReportID = isMoneyRequestReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : chatReport.reportID;

    const customUnitRate = getPerDiemRateCustomUnitRate(policyParams.policy, customUnit.customUnitRateID);

    const customUnitRateParam = {
        id: customUnitRate?.customUnitRateID,
        name: customUnitRate?.name,
    };

    const parameters: CreatePerDiemRequestParams = {
        policyID: policyParams.policy.id,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: customUnit.customUnitRateID,
        customUnitRate: JSON.stringify(customUnitRateParam),
        subRates: JSON.stringify(customUnit.subRates),
        startDateTime: customUnit.attributes.dates.start,
        endDateTime: customUnit.attributes.dates.end,
        currency,
        description: comment,
        created,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        category,
        tag,
        transactionThreadReportID,
        createdReportActionIDForThread,
        billable,
        reimbursable,
        attendees: attendees ? JSON.stringify(attendees) : undefined,
        customUnitPolicyID,
        shouldDeferAutoSubmit,
    };

    if (shouldPlaySoundParam) {
        playSound(SOUNDS.DONE);
    }

    const apiWrite = () => {
        API.write(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST, parameters, onyxData);
    };

    deferOrExecuteWrite(apiWrite, {
        shouldDeferForSearch: !!(shouldHandleNavigation && isFromGlobalCreate && !isReportTopmostSplitNavigator()),
        optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
        onDeferred: () => addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE),
    });

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));

    highlightTransactionOnSearchRouteIfNeeded(isFromGlobalCreate, transaction.transactionID, CONST.SEARCH.DATA_TYPES.EXPENSE);

    if (activeReportID) {
        notifyNewAction(activeReportID, undefined, participantParams.payeeAccountID === currentUserAccountIDParam);
    }

    return {iouReport};
}

/**
 * Submit a per diem expense from self DM
 */
function submitPerDiemExpenseForSelfDM(submitPerDiemExpenseInformation: PerDiemExpenseInformationForSelfDM) {
    const {selfDMReport, policy, transactionParams, currentUserAccountIDParam, currentUserEmailParam, quickAction, shouldHandleNavigation = true} = submitPerDiemExpenseInformation;
    const {currency, comment = '', category, tag, created, customUnit, attendees, billable, reimbursable} = transactionParams;

    if (
        isEmptyObject(policy) ||
        isEmptyObject(customUnit) ||
        !customUnit.customUnitID ||
        !customUnit.customUnitRateID ||
        (customUnit.subRates ?? []).length === 0 ||
        isEmptyObject(customUnit.attributes)
    ) {
        return;
    }

    const {chatReport, transaction, iouAction, transactionThreadReportID, createdReportActionIDForThread, onyxData} = getPerDiemExpenseInformationForSelfDM({
        selfDMReport,
        policy,
        transactionParams,
        currentUserAccountIDParam,
        currentUserEmailParam,
        quickAction,
    });

    const customUnitRate = getPerDiemRateCustomUnitRate(policy, customUnit.customUnitRateID);

    const customUnitRateParam = {
        id: customUnitRate?.customUnitRateID,
        name: customUnitRate?.name,
    };

    const parameters: CreatePerDiemRequestParams = {
        policyID: policy?.id,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: customUnit.customUnitRateID,
        customUnitRate: JSON.stringify(customUnitRateParam),
        subRates: JSON.stringify(customUnit.subRates),
        startDateTime: customUnit.attributes.dates.start,
        endDateTime: customUnit.attributes.dates.end,
        currency,
        description: comment,
        created,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        reportPreviewReportActionID: '',
        category,
        tag,
        transactionThreadReportID,
        createdReportActionIDForThread,
        billable,
        reimbursable,
        attendees: attendees ? JSON.stringify(attendees) : undefined,
    };

    playSound(SOUNDS.DONE);

    const apiWrite = () => {
        API.write(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST, parameters, onyxData);
    };

    // Self-DM always navigates to a report (dismissModalAndOpenReportInInboxTab),
    // never to Search, so the SEARCH channel would never be flushed.
    deferOrExecuteWrite(apiWrite, {
        shouldDeferForSearch: false,
        optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
        onDeferred: () => addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE),
    });

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));

    if (shouldHandleNavigation) {
        dismissModalAndOpenReportInInboxTab(chatReport.reportID);
    }

    notifyNewAction(chatReport.reportID, undefined, true);
}

export {
    removeSubrate,
    updateSubrate,
    clearSubrates,
    addSubrate,
    computePerDiemExpenseAmount,
    isValidPerDiemExpenseAmount,
    getPerDiemExpenseInformation,
    submitPerDiemExpense,
    submitPerDiemExpenseForSelfDM,
};

export type {PerDiemExpenseTransactionParams, PerDiemExpenseInformation};
