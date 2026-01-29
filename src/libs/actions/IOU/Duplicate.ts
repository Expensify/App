import {format} from 'date-fns';
import type {NullishDeep, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep} from 'type-fest';
import * as API from '@libs/API';
import type {MergeDuplicatesParams, ResolveDuplicatesParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {getIOUActionForReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticDismissedViolationReportAction,
    buildOptimisticHoldReportAction,
    buildOptimisticResolvedDuplicatesReportAction,
    buildTransactionThread,
    getTransactionDetails,
} from '@libs/ReportUtils';
import {getRequestType, getTransactionType} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type {CreateDistanceRequestInformation, CreateTrackExpenseParams, RequestMoneyInformation} from '.';
import {
    createDistanceRequest,
    getAllReportActionsFromIOU,
    getAllReports,
    getAllTransactions,
    getAllTransactionViolations,
    getCurrentUserEmail,
    getMoneyRequestParticipantsFromReport,
    getPolicyTags,
    getRecentWaypoints,
    getUserAccountID,
    requestMoney,
    trackExpense,
} from '.';

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file https://github.com/Expensify/App/issues/80049
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getPolicyTagsData(policyID: string | undefined) {
    const allPolicyTags = getPolicyTags();
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

function getIOUActionForTransactions(transactionIDList: Array<string | undefined>, iouReportID: string | undefined): Array<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> {
    const allReportActions = getAllReportActionsFromIOU();
    return Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`] ?? {})?.filter(
        (reportAction): reportAction is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => {
            if (!isMoneyRequestAction(reportAction)) {
                return false;
            }
            const message = getOriginalMessage(reportAction);
            if (!message?.IOUTransactionID) {
                return false;
            }
            return transactionIDList.includes(message.IOUTransactionID);
        },
    );
}

/** Merge several transactions into one by updating the fields of the one we want to keep and deleting the rest */
function mergeDuplicates({transactionThreadReportID: optimisticTransactionThreadReportID, ...params}: MergeDuplicatesParams) {
    const allParams: MergeDuplicatesParams = {...params};
    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();
    const currentUserEmail = getCurrentUserEmail();

    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        value: {
            ...originalSelectedTransaction,
            billable: params.billable,
            comment: {
                comment: params.comment,
            },
            category: params.category,
            created: params.created,
            currency: params.currency,
            modifiedMerchant: params.merchant,
            reimbursable: params.reimbursable,
            tag: params.tag,
        },
    };

    const failureTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction as OnyxTypes.Transaction,
    };

    const optimisticTransactionDuplicatesData: OnyxUpdate[] = params.transactionIDList.map((id) => ({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`,
        value: null,
    }));

    const failureTransactionDuplicatesData: OnyxUpdate[] = params.transactionIDList.map((id) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`] as OnyxTypes.Transaction,
    }));

    const optimisticTransactionViolations: OnyxUpdate[] = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: OnyxUpdate[] = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    const duplicateTransactionTotals = params.transactionIDList.reduce((total, id) => {
        const duplicateTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
        if (!duplicateTransaction) {
            return total;
        }
        return total + duplicateTransaction.amount;
    }, 0);

    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`];
    const expenseReportOptimisticData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`,
        value: {
            total: (expenseReport?.total ?? 0) - duplicateTransactionTotals,
        },
    };
    const expenseReportFailureData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`,
        value: {
            total: expenseReport?.total,
        },
    };

    const iouActionsToDelete = params.reportID ? getIOUActionForTransactions(params.transactionIDList, params.reportID) : [];

    const deletedTime = DateUtils.getDBTime();
    const expenseReportActionsOptimisticData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`,
        value: iouActionsToDelete.reduce<Record<string, PartialDeep<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>>>((val, reportAction) => {
            const firstMessage = Array.isArray(reportAction.message) ? reportAction.message.at(0) : null;
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = {
                originalMessage: {
                    deleted: deletedTime,
                },
                ...(firstMessage && {
                    message: [
                        {
                            ...firstMessage,
                            deleted: deletedTime,
                        },
                        ...(Array.isArray(reportAction.message) ? reportAction.message.slice(1) : []),
                    ],
                }),
                ...(!Array.isArray(reportAction.message) && {
                    message: {
                        deleted: deletedTime,
                    },
                }),
            };
            return val;
        }, {}),
    };
    const expenseReportActionsFailureData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`,
        value: iouActionsToDelete.reduce<Record<string, NullishDeep<PartialDeep<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>>>>((val, reportAction) => {
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = {
                originalMessage: {
                    deleted: null,
                },
                message: reportAction.message,
            };
            return val;
        }, {}),
    };

    const optimisticReportAction = buildOptimisticResolvedDuplicatesReportAction();

    const transactionThreadReportID =
        optimisticTransactionThreadReportID ?? (params.reportID ? getIOUActionForTransactions([params.transactionID], params.reportID).at(0)?.childReportID : undefined);
    const optimisticReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: optimisticReportAction,
        },
    };

    const failureReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: null,
        },
    };

    const optimisticData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];

    optimisticData.push(
        optimisticTransactionData,
        ...optimisticTransactionDuplicatesData,
        ...optimisticTransactionViolations,
        expenseReportOptimisticData,
        expenseReportActionsOptimisticData,
        optimisticReportActionData,
    );
    failureData.push(
        failureTransactionData,
        ...failureTransactionDuplicatesData,
        ...failureTransactionViolations,
        expenseReportFailureData,
        expenseReportActionsFailureData,
        failureReportActionData,
    );

    if (optimisticTransactionThreadReportID) {
        const iouAction = getIOUActionForReportID(params.reportID, params.transactionID);
        const optimisticCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail);
        const optimisticTransactionThreadReport = buildTransactionThread(iouAction, expenseReport, undefined, optimisticTransactionThreadReportID);

        allParams.transactionThreadReportID = optimisticTransactionThreadReportID;
        allParams.createdReportActionIDForThread = optimisticCreatedAction?.reportActionID;
        optimisticTransactionThreadReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThreadReportID}`,
                value: optimisticTransactionThreadReport,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReportID}`,
                value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
            },
        );

        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThreadReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReportID}`,
                value: null,
            },
        );

        if (iouAction?.reportActionID) {
            // Context: Right now updates provided in one Onyx.update can reach component in different renders.
            // This is because `Onyx.merge` is batched and `Onyx.set` is not, so it may not be necessary after https://github.com/Expensify/App/issues/71207 is resolved.
            // Setting up the transactions null values (removing of the transactions) happens faster than setting of optimistic childReportID,
            // though both updates come from one optimistic data.
            // To escape unexpected effects we setting the childReportID using Onyx.merge, making sure it will be in place when transactions are cleared out.
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReport?.parentReportID}`, {
                [iouAction?.reportActionID]: {childReportID: optimisticTransactionThreadReportID, childType: CONST.REPORT.TYPE.CHAT},
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReport?.parentReportID}`,
                value: {[iouAction?.reportActionID]: {childReportID: optimisticTransactionThreadReportID, childType: CONST.REPORT.TYPE.CHAT}},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReport?.parentReportID}`,
                value: {[iouAction?.reportActionID]: {childReportID: null, childType: null}},
            });
        }

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReportID}`,
            value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        });
    }

    API.write(WRITE_COMMANDS.MERGE_DUPLICATES, {...allParams, reportActionID: optimisticReportAction.reportActionID}, {optimisticData, failureData, successData});
}

/** Instead of merging the duplicates, it updates the transaction we want to keep and puts the others on hold without deleting them */
function resolveDuplicates(params: MergeDuplicatesParams) {
    if (!params.transactionID) {
        return;
    }

    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();

    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        value: {
            ...originalSelectedTransaction,
            billable: params.billable,
            comment: {
                comment: params.comment,
            },
            category: params.category,
            created: params.created,
            currency: params.currency,
            modifiedMerchant: params.merchant,
            reimbursable: params.reimbursable,
            tag: params.tag,
        },
    };

    const failureTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction as OnyxTypes.Transaction,
    };

    const optimisticTransactionViolations: OnyxUpdate[] = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        const newViolation = {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION};
        const updatedViolations = id === params.transactionID ? violations : [...violations, newViolation];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: updatedViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: OnyxUpdate[] = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    const iouActionList = params.reportID ? getIOUActionForTransactions(params.transactionIDList, params.reportID) : [];
    const orderedTransactionIDList = iouActionList
        .map((action) => {
            const message = getOriginalMessage(action);
            return message?.IOUTransactionID;
        })
        .filter((id): id is string => !!id);

    const optimisticHoldActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureHoldActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const reportActionIDList: string[] = [];
    const optimisticHoldTransactionActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const failureHoldTransactionActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    for (const action of iouActionList) {
        const transactionThreadReportID = action?.childReportID;
        const createdReportAction = buildOptimisticHoldReportAction();
        reportActionIDList.push(createdReportAction.reportActionID);
        const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
        optimisticHoldTransactionActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                comment: {
                    hold: createdReportAction.reportActionID,
                },
            },
        });
        failureHoldTransactionActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                comment: {
                    hold: null,
                },
            },
        });
        optimisticHoldActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction,
            },
        });
        failureHoldActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {
                [createdReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericHoldExpenseFailureMessage'),
                },
            },
        });
    }

    const transactionThreadReportID = params.reportID ? getIOUActionForTransactions([params.transactionID], params.reportID).at(0)?.childReportID : undefined;
    const optimisticReportAction = buildOptimisticDismissedViolationReportAction({
        reason: 'manual',
        violationName: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
    });

    const optimisticReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: optimisticReportAction,
        },
    };

    const failureReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: null,
        },
    };

    const optimisticData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    optimisticData.push(optimisticTransactionData, ...optimisticTransactionViolations, ...optimisticHoldActions, ...optimisticHoldTransactionActions, optimisticReportActionData);
    failureData.push(failureTransactionData, ...failureTransactionViolations, ...failureHoldActions, ...failureHoldTransactionActions, failureReportActionData);
    const {reportID, transactionIDList, receiptID, ...otherParams} = params;

    const parameters: ResolveDuplicatesParams = {
        ...otherParams,
        transactionID: params.transactionID,
        reportActionIDList,
        transactionIDList: orderedTransactionIDList,
        dismissedViolationReportActionID: optimisticReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.RESOLVE_DUPLICATES, parameters, {optimisticData, failureData});
}

type DuplicateExpenseTransactionParams = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    optimisticChatReportID: string;
    optimisticIOUReportID: string;
    isASAPSubmitBetaEnabled: boolean;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicyID: string | undefined;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    isSelfTourViewed: boolean;
    customUnitPolicyID?: string;
    targetPolicy?: OnyxEntry<OnyxTypes.Policy>;
    targetPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    targetReport?: OnyxTypes.Report;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

function duplicateExpenseTransaction({
    transaction,
    optimisticChatReportID,
    optimisticIOUReportID,
    isASAPSubmitBetaEnabled,
    introSelected,
    activePolicyID,
    quickAction,
    policyRecentlyUsedCurrencies,
    isSelfTourViewed,
    customUnitPolicyID,
    targetPolicy,
    targetPolicyCategories,
    targetReport,
    personalDetails,
}: DuplicateExpenseTransactionParams) {
    if (!transaction) {
        return;
    }

    const userAccountID = getUserAccountID();
    const currentUserEmail = getCurrentUserEmail();
    const recentWaypoints = getRecentWaypoints();

    const participants = getMoneyRequestParticipantsFromReport(targetReport, userAccountID);
    const transactionDetails = getTransactionDetails(transaction);

    const params: RequestMoneyInformation = {
        report: targetReport,
        optimisticChatReportID,
        optimisticCreatedReportActionID: NumberUtils.rand64(),
        optimisticIOUReportID,
        optimisticReportPreviewActionID: NumberUtils.rand64(),
        participantParams: {
            payeeAccountID: userAccountID,
            payeeEmail: currentUserEmail,
            participant: participants.at(0) ?? {},
        },
        gpsPoint: undefined,
        action: CONST.IOU.ACTION.CREATE,
        transactionParams: {
            ...transaction,
            ...transactionDetails,
            attendees: transactionDetails?.attendees as Attendee[] | undefined,
            comment: Parser.htmlToMarkdown(transactionDetails?.comment ?? ''),
            created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
            customUnitRateID: transaction?.comment?.customUnit?.customUnitRateID,
            isTestDrive: transaction?.receipt?.isTestDriveReceipt,
            merchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? ''),
            modifiedAmount: undefined,
            originalTransactionID: undefined,
            receipt: undefined,
            source: undefined,
            waypoints: transactionDetails?.waypoints as WaypointCollection | undefined,
            type: transaction?.comment?.type,
            count: transaction?.comment?.units?.count,
            rate: transaction?.comment?.units?.rate,
            unit: transaction?.comment?.units?.unit,
        },
        shouldHandleNavigation: false,
        shouldGenerateTransactionThreadReport: true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam: userAccountID,
        currentUserEmailParam: currentUserEmail,
        transactionViolations: {},
        policyRecentlyUsedCurrencies,
        quickAction,
        isSelfTourViewed,
    };

    // If no workspace is provided the expense should be unreported
    if (!targetPolicy) {
        const trackExpenseParams: CreateTrackExpenseParams = {
            ...params,
            participantParams: {
                ...(params.participantParams ?? {}),
                participant: {accountID: userAccountID, selected: true},
            },
            transactionParams: {
                ...(params.transactionParams ?? {}),
                validWaypoints: transactionDetails?.waypoints as WaypointCollection | undefined,
            },
            report: undefined,
            isDraftPolicy: false,
            introSelected,
            activePolicyID,
            quickAction,
            recentWaypoints,
        };
        return trackExpense(trackExpenseParams);
    }

    params.policyParams = {
        policy: targetPolicy,
        // TODO: remove `allPolicyTags` from this file https://github.com/Expensify/App/issues/80049
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        policyTagList: getPolicyTagsData(targetPolicy.id) ?? {},
        policyCategories: targetPolicyCategories ?? {},
    };

    const transactionType = getTransactionType(transaction);

    switch (transactionType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE: {
            const distanceParams: CreateDistanceRequestInformation = {
                ...params,
                participants,
                existingTransaction: {
                    ...(params.transactionParams ?? {}),
                    comment: transaction.comment,
                    iouRequestType: getRequestType(transaction),
                    modifiedCreated: '',
                    reportID: '1',
                    transactionID: '1',
                },
                transactionParams: {
                    ...(params.transactionParams ?? {}),
                    comment: Parser.htmlToMarkdown(transactionDetails?.comment ?? ''),
                    validWaypoints: transactionDetails?.waypoints as WaypointCollection | undefined,
                },
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                quickAction,
                customUnitPolicyID,
                personalDetails,
                recentWaypoints,
            };
            return createDistanceRequest(distanceParams);
        }
        default:
            return requestMoney(params);
    }
}

export {getIOUActionForTransactions, mergeDuplicates, resolveDuplicates, duplicateExpenseTransaction};
export type {DuplicateExpenseTransactionParams};
