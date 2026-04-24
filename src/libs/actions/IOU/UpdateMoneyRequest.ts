// eslint-disable-next-line you-dont-need-lodash-underscore/union-by
import lodashUnionBy from 'lodash/unionBy';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {UpdateMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {hasDependentTags, isPaidGroupPolicy} from '@libs/PolicyUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {
    buildOptimisticModifiedExpenseReportAction,
    getOutstandingChildRequest,
    getParsedComment,
    getTransactionDetails,
    hasViolations as hasViolationsReportUtils,
    isExpenseReport,
    isInvoiceReport as isInvoiceReportReportUtils,
    isOneTransactionThread,
    isSelfDM,
    isTrackExpenseReport,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {
    getAmount,
    getClearedPendingFields,
    getMerchant,
    getUpdatedTransaction,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isFetchingWaypointsFromServer,
    isOnHold,
    isScanning,
    removeTransactionFromDuplicateTransactionViolation,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {stringifyWaypointsForAPI} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {Routes, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {UpdateMoneyRequestData} from '.';
import {
    getAllReports,
    getAllTransactions,
    getAllTransactionViolations,
    getPolicyTagsData,
    getRecentAttendees,
    getUpdatedMoneyRequestReportData,
    mergePolicyRecentlyUsedCategories,
    mergePolicyRecentlyUsedCurrencies,
} from '.';

type UpdateMoneyRequestDateParams = {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    value: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    hash?: number;
};

/** Updates the created date of an expense */
function updateMoneyRequestDate({
    transactionID,
    transactionThreadReport,
    parentReport,
    transactions,
    transactionViolations,
    value,
    policy,
    policyTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
    hash,
}: UpdateMoneyRequestDateParams) {
    const transactionChanges: TransactionChanges = {
        created: value,
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy, hash);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
            hash,
        });
        removeTransactionFromDuplicateTransactionViolation(data.onyxData, transactionID, transactions, transactionViolations);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, params, onyxData);
}

/** Updates the billable field of an expense */
function updateMoneyRequestBillable({
    transactionID,
    transactionThreadReport,
    parentReport,
    value,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    value: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    if (!transactionID || !transactionThreadReport?.reportID) {
        return;
    }
    const transactionChanges: TransactionChanges = {
        billable: value,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE, params, onyxData);
}

function updateMoneyRequestReimbursable({
    transactionID,
    transactionThreadReport,
    parentReport,
    value,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    value: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    if (!transactionID || !transactionThreadReport?.reportID) {
        return;
    }
    const transactionChanges: TransactionChanges = {
        reimbursable: value,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE, params, onyxData);
}

/** Updates the merchant field of an expense */
function updateMoneyRequestMerchant({
    transactionID,
    transactionThreadReport,
    parentReport,
    value,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
    hash,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    value: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    hash?: number;
}) {
    const transactionChanges: TransactionChanges = {
        merchant: value,
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy, hash);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
            hash,
        });
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, params, onyxData);
}

/** Updates the attendees list of an expense */
function updateMoneyRequestAttendees({
    transactionID,
    transactionThreadReport,
    parentReport,
    attendees,
    policy,
    policyTagList,
    policyCategories,
    violations,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    attendees: Attendee[];
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    violations: OnyxEntry<OnyxTypes.TransactionViolations> | undefined;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        attendees,
    };
    const data = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        violations,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES, params, onyxData);
}

type UpdateMoneyRequestTagParams = {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    tag: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    hash?: number;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the tag of an expense */
function updateMoneyRequestTag({
    transactionID,
    transactionThreadReport,
    parentReport,
    tag,
    policy,
    policyTagList,
    policyRecentlyUsedTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    hash,
    parentReportNextStep,
}: UpdateMoneyRequestTagParams) {
    const transactionChanges: TransactionChanges = {
        tag,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyRecentlyUsedTags,
        policyCategories,
        hash,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG, params, onyxData);
}

/** Updates the created tax amount of an expense */
function updateMoneyRequestTaxAmount({
    transactionID,
    transactionThreadReport,
    parentReport,
    taxAmount,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    taxAmount: number;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges = {
        taxAmount,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_AMOUNT, params, onyxData);
}

type UpdateMoneyRequestTaxRateParams = {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    taxCode: string;
    taxAmount: number;
    taxValue: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the created tax rate of an expense */
function updateMoneyRequestTaxRate({
    transactionID,
    transactionThreadReport,
    parentReport,
    taxCode,
    taxAmount,
    taxValue,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: UpdateMoneyRequestTaxRateParams) {
    const transactionChanges = {
        taxCode,
        taxAmount,
        taxValue,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });

    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE, params, onyxData);
}

type UpdateMoneyRequestDistanceParams = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    waypoints?: WaypointCollection;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    distance?: number;
    routes?: Routes;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    transactionBackup: OnyxEntry<OnyxTypes.Transaction>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    odometerStart?: number;
    odometerEnd?: number;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the waypoints of a distance expense */
function updateMoneyRequestDistance({
    transaction,
    transactionThreadReport,
    parentReport,
    waypoints,
    recentWaypoints = [],
    distance,
    routes = undefined,
    policy,
    policyTagList,
    policyCategories,
    transactionBackup,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    odometerStart,
    odometerEnd,
    parentReportNextStep,
}: UpdateMoneyRequestDistanceParams) {
    const transactionChanges: TransactionChanges = {
        // Don't sanitize waypoints here - keep all fields for Onyx optimistic data (e.g., keyForList)
        // Sanitization happens when building API params
        ...(waypoints && {waypoints}),
        routes,
        ...(distance && {distance}),
        ...(odometerStart !== undefined && {odometerStart}),
        ...(odometerEnd !== undefined && {odometerEnd}),
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys | typeof ONYXKEYS.NVP_RECENT_WAYPOINTS>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transaction?.transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID: transaction?.transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
    }
    const {params, onyxData} = data;

    if (odometerStart !== undefined) {
        params.odometerStart = odometerStart;
    }
    if (odometerEnd !== undefined) {
        params.odometerEnd = odometerEnd;
    }

    if (!distance) {
        const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
        onyxData?.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
            value: recentServerValidatedWaypoints,
        });
    }

    if (transactionBackup) {
        // We need to include all keys of the optimisticData's waypoints in the failureData for onyx merge to properly reset
        // waypoint keys that do not exist in the failureData's waypoints. For instance, if the optimisticData waypoints had
        // three keys and the failureData waypoint had only 2 keys then the third key that doesn't exist in the failureData
        // waypoints should be explicitly reset otherwise onyx merge will leave it intact.
        const allWaypointKeys = [...new Set([...Object.keys(transactionBackup.comment?.waypoints ?? {}), ...Object.keys(transaction?.comment?.waypoints ?? {})])];
        const onyxWaypoints = allWaypointKeys.reduce((acc: NullishDeep<WaypointCollection>, key) => {
            acc[key] = transactionBackup.comment?.waypoints?.[key] ? {...transactionBackup.comment?.waypoints?.[key]} : null;
            return acc;
        }, {});
        const allModifiedWaypointsKeys = [...new Set([...Object.keys(waypoints ?? {}), ...Object.keys(transaction?.modifiedWaypoints ?? {})])];
        const onyxModifiedWaypoints = allModifiedWaypointsKeys.reduce((acc: NullishDeep<WaypointCollection>, key) => {
            acc[key] = transactionBackup.modifiedWaypoints?.[key] ? {...transactionBackup.modifiedWaypoints?.[key]} : null;
            return acc;
        }, {});
        onyxData?.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
            value: {
                comment: {
                    waypoints: onyxWaypoints,
                    customUnit: {
                        quantity: transactionBackup?.comment?.customUnit?.quantity,
                    },
                },
                modifiedWaypoints: onyxModifiedWaypoints,
                routes: null,
            },
        });
    }

    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE, params, onyxData);
}

/** Updates the category of an expense */
function updateMoneyRequestCategory({
    transactionID,
    transactionThreadReport,
    parentReport,
    category,
    policy,
    policyTagList,
    policyCategories,
    policyRecentlyUsedCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    hash,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    category: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    hash?: number;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        category,
    };

    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        policyRecentlyUsedCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        hash,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, params, onyxData);
}

/** Updates the description of an expense */
function updateMoneyRequestDescription({
    transactionID,
    transactionThreadReport,
    parentReport,
    comment,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
    hash,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    comment: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    hash?: number;
}) {
    const parsedComment = getParsedComment(comment);
    const transactionChanges: TransactionChanges = {
        comment: parsedComment,
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy, hash);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
            hash,
        });
    }
    const {params, onyxData} = data;
    params.description = parsedComment;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION, params, onyxData);
}

/** Updates the distance rate of an expense */
function updateMoneyRequestDistanceRate({
    transaction,
    transactionThreadReport,
    parentReport,
    rateID,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    updatedTaxAmount,
    updatedTaxCode,
    updatedTaxValue,
    parentReportNextStep,
}: {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    rateID: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    updatedTaxAmount?: number;
    updatedTaxCode?: string;
    updatedTaxValue?: string;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        customUnitRateID: rateID,
        ...(typeof updatedTaxAmount === 'number' ? {taxAmount: updatedTaxAmount} : {}),
        ...(updatedTaxCode ? {taxCode: updatedTaxCode} : {}),
        ...(updatedTaxValue ? {taxValue: updatedTaxValue} : {}),
    };

    if (transaction?.transactionID) {
        const existingDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;
        const newDistanceUnit = DistanceRequestUtils.getRateByCustomUnitRateID({
            customUnitRateID: rateID,
            policy,
        })?.unit;

        // If the distanceUnit is set and the rate is changed to one that has a different unit, mark the merchant as modified to make the distance field pending
        if (existingDistanceUnit && newDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            transactionChanges.merchant = getMerchant(transaction);
        }
    }

    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transaction?.transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID: transaction?.transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
    }
    const {params, onyxData} = data;
    // `taxAmount` & `taxCode` only needs to be updated in the optimistic data, so we need to remove them from the params
    const {taxAmount, taxCode, ...paramsWithoutTaxUpdated} = params;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE, paramsWithoutTaxUpdated, onyxData);
}

type UpdateMoneyRequestAmountAndCurrencyParams = {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    currency: string;
    amount: number;
    taxAmount: number;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    taxCode: string;
    taxValue: string;
    allowNegative?: boolean;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    policyRecentlyUsedCurrencies: string[];
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    hash?: number;
};

/** Updates the amount and currency fields of an expense */
function updateMoneyRequestAmountAndCurrency({
    transactionID,
    transactionThreadReport,
    parentReport,
    currency,
    amount,
    taxAmount,
    policy,
    policyTagList,
    policyCategories,
    taxCode,
    taxValue,
    allowNegative = false,
    transactions,
    transactionViolations,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    policyRecentlyUsedCurrencies,
    parentReportNextStep,
    hash,
}: UpdateMoneyRequestAmountAndCurrencyParams) {
    const transactionChanges = {
        amount,
        currency,
        taxCode,
        taxAmount,
        taxValue,
    };

    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy, hash);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList: policyTagList ?? null,
            policyCategories: policyCategories ?? null,
            allowNegative,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            policyRecentlyUsedCurrencies,
            iouReportNextStep: parentReportNextStep,
            hash,
        });
        removeTransactionFromDuplicateTransactionViolation(data.onyxData, transactionID, transactions, transactionViolations);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY, params, onyxData);
}

type GetUpdateMoneyRequestParamsType = {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    transactionChanges: TransactionChanges;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyTagLists>;
    policyRecentlyUsedTags?: OnyxEntry<RecentlyUsedTags>;
    policyCategories: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    violations?: OnyxEntry<OnyxTypes.TransactionViolations>;
    hash?: number;
    allowNegative?: boolean;
    newTransactionReportID?: string | undefined;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    shouldBuildOptimisticModifiedExpenseReportAction?: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    policyRecentlyUsedCurrencies?: string[];
    iouReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    isSplitTransaction?: boolean;
    formatPhoneNumber?: LocaleContextProps['formatPhoneNumber'];
    // TODO: This will be required eventually. Ref: https://github.com/Expensify/App/issues/66407
    isOffline?: boolean;
};

type UpdateMoneyRequestDataKeys =
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
    | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
    | typeof ONYXKEYS.NVP_RECENT_ATTENDEES
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
    | typeof ONYXKEYS.COLLECTION.NEXT_STEP
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT;

function getUpdateMoneyRequestParams(params: GetUpdateMoneyRequestParamsType): UpdateMoneyRequestData<UpdateMoneyRequestDataKeys> {
    const {
        transactionID,
        transactionThreadReport,
        transactionChanges,
        policy,
        policyTagList,
        policyRecentlyUsedTags,
        policyCategories,
        policyRecentlyUsedCategories,
        violations,
        hash,
        allowNegative,
        newTransactionReportID,
        iouReport,
        shouldBuildOptimisticModifiedExpenseReportAction = true,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        policyRecentlyUsedCurrencies,
        iouReportNextStep,
        isSplitTransaction,
        formatPhoneNumber,
        isOffline,
    } = params;
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
            | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.NVP_RECENT_ATTENDEES
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [];
    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION>
    > = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields: OnyxTypes.Transaction['pendingFields'] = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = getClearedPendingFields(transactionChanges);
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

    // Step 2: Get all the collections being updated
    const transaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

    const isTransactionOnHold = isOnHold(transaction);
    const isFromExpenseReport = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const updatedTransaction: OnyxEntry<OnyxTypes.Transaction> = transaction
        ? getUpdatedTransaction({
              transaction,
              transactionChanges,
              isFromExpenseReport,
              isSplitTransaction,
              policy,
          })
        : undefined;

    const transactionDetails = getTransactionDetails(updatedTransaction, undefined, undefined, allowNegative);

    if (transactionDetails?.waypoints) {
        transactionDetails.waypoints = stringifyWaypointsForAPI(transactionDetails.waypoints as WaypointCollection);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> = Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => key in transactionChanges));

    const apiParams: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: iouReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    const hasModifiedCreated = 'created' in transactionChanges;
    const hasModifiedAmount = 'amount' in transactionChanges;
    const hasModifiedMerchant = 'merchant' in transactionChanges;
    // For split transactions, the merchant and amount are already computed in transactionChanges,
    // so we can build a valid optimistic MODIFIED_EXPENSE even when waypoints are pending.
    const hasSplitDistanceMessageFields = !!isSplitTransaction && hasModifiedMerchant && hasModifiedAmount;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            value: null,
        });

        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
                modifiedCurrency: transaction.modifiedCurrency,
                reportID: transaction.reportID,
            },
        });
    }

    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints (unless it's a split transaction with computed merchant + amount)
    // - we're updating the distance rate while the waypoints are still pending
    // - we're merging two expenses (server does not create MODIFIED_EXPENSE in this flow)
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API.
    // For split transactions, the merchant and amount are already available in transactionChanges,
    // so we can build the optimistic report action even when waypoints are pending.
    const updatedReportAction = shouldBuildOptimisticModifiedExpenseReportAction
        ? buildOptimisticModifiedExpenseReportAction(transactionThreadReport, transaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative)
        : null;
    if ((!hasPendingWaypoints || hasSplitDistanceMessageFields) && !(hasModifiedDistanceRate && isFetchingWaypointsFromServer(transaction)) && updatedReportAction) {
        apiParams.reportActionID = updatedReportAction.reportActionID;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                lastReadTime: updatedReportAction.created,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                lastReadTime: transactionThreadReport?.lastReadTime,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        });

        // Don't push error to failureData when updating distance requests
        // The error will be handled by API response for distance requests
        const isDistanceTransaction = transaction && isDistanceRequestTransactionUtils(transaction);

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: isDistanceTransaction
                    ? null
                    : {
                          ...(updatedReportAction as OnyxTypes.ReportAction),
                          errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                      },
            },
        });
    }

    // Step 4: Compute the IOU total and update the report preview message (and report header) so LHN amount owed is correct.
    // If the diff is indeterminate we cannot calculate the new iou report total from front-end due to currency differences.
    const {updatedMoneyRequestReport, isTotalIndeterminate} = getUpdatedMoneyRequestReportData(
        iouReport,
        updatedTransaction,
        transaction,
        isTransactionOnHold,
        policy,
        updatedReportAction?.actorAccountID,
        transactionChanges,
    );

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {...updatedMoneyRequestReport, ...(isTotalIndeterminate && {pendingFields: {total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}})},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.parentReportID}`,
            value: getOutstandingChildRequest(updatedMoneyRequestReport),
        },
    );
    if (updatedReportAction && isOneTransactionThread(transactionThreadReport ?? undefined, iouReport ?? undefined, undefined, isOffline)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                lastReadTime: updatedReportAction.created,
            },
        });
    }
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
        value: {pendingAction: null, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
    });

    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...updatedTransaction,
            pendingFields,
            errorFields: null,
            reportID: newTransactionReportID ?? updatedTransaction?.reportID,
        },
    });

    if (updatedReportAction && transactionThreadReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: {
                lastActorAccountID: updatedReportAction.actorAccountID,
            },
        });
    }

    if (isScanning(transaction) && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        if (transactionThreadReport?.parentReportActionID) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [transactionThreadReport?.parentReportActionID]: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            });
        }

        if (iouReport?.parentReportActionID) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.parentReportID}`,
                value: {
                    [iouReport.parentReportActionID]: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            });
        }
    }

    // Update recently used categories if the category is changed
    const hasModifiedCategory = 'category' in transactionChanges;
    if (hasModifiedCategory) {
        const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(transactionChanges.category, policyRecentlyUsedCategories);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }

    // Update recently used currencies if the currency is changed
    if ('currency' in transactionChanges) {
        const optimisticRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(transactionChanges.currency, policyRecentlyUsedCurrencies ?? []);
        if (optimisticRecentlyUsedCurrencies.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }
    }

    // Update recently used categories if the tag is changed
    const hasModifiedTag = 'tag' in transactionChanges;
    if (hasModifiedTag) {
        const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
            // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            policyTags: getPolicyTagsData(iouReport?.policyID),
            policyRecentlyUsedTags,
            transactionTags: transactionChanges.tag,
        });
        if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    }

    if ('attendees' in transactionChanges) {
        // Update violation limit, if we modify attendees. The given limit value is for a single attendee, if we have multiple attendees we should multiply limit by attendee count
        const overLimitViolation = violations?.find((violation) => violation.name === 'overLimit');
        if (overLimitViolation) {
            const limitForSingleAttendee = ViolationsUtils.getViolationAmountLimit(overLimitViolation);
            if (limitForSingleAttendee * (transactionChanges?.attendees?.length ?? 1) > Math.abs(getAmount(transaction))) {
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    value: violations?.filter((violation) => violation.name !== 'overLimit') ?? [],
                });
            }
        }
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_RECENT_ATTENDEES,
            value: lodashUnionBy(
                transactionChanges.attendees?.map(({avatarUrl, displayName, email}) => ({avatarUrl, displayName, ...(email ? {email} : {})})) ?? [],
                getRecentAttendees(),
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (attendee) => attendee.email || attendee.displayName,
            ).slice(0, CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW),
        });
    }

    if (Array.isArray(apiParams?.attendees)) {
        apiParams.attendees = JSON.stringify(apiParams?.attendees);
    }

    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });

    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...transaction,
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields,
            reportID: transaction?.reportID,
        },
    });

    if (iouReport) {
        // Reset the iouReport to its original state
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {...iouReport, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
        });
    }

    const hasModifiedCurrency = 'currency' in transactionChanges;
    const hasModifiedComment = 'comment' in transactionChanges;
    const hasModifiedReimbursable = 'reimbursable' in transactionChanges;
    const hasModifiedTaxCode = 'taxCode' in transactionChanges;
    const hasModifiedDate = 'date' in transactionChanges;
    const hasModifiedDistance = 'distance' in transactionChanges;
    const hasModifiedAttendees = 'attendees' in transactionChanges;

    const isInvoice = isInvoiceReportReportUtils(iouReport);
    if (
        transactionID &&
        policy &&
        isPaidGroupPolicy(policy) &&
        !isInvoice &&
        updatedTransaction &&
        (hasPendingWaypoints ||
            hasModifiedTag ||
            hasModifiedCategory ||
            hasModifiedComment ||
            hasModifiedMerchant ||
            hasModifiedDistanceRate ||
            hasModifiedDistance ||
            hasModifiedDate ||
            hasModifiedCurrency ||
            hasModifiedAmount ||
            hasModifiedCreated ||
            hasModifiedReimbursable ||
            hasModifiedTaxCode ||
            hasModifiedAttendees)
    ) {
        const currentTransactionViolations = getAllTransactionViolations()[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        // If the amount, currency or date have been modified, we remove the duplicate violations since they would be out of date as the transaction has changed
        let optimisticViolations =
            hasModifiedAmount || hasModifiedDate || hasModifiedCurrency
                ? currentTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
                : currentTransactionViolations;
        optimisticViolations =
            hasModifiedCategory && transactionChanges.category === ''
                ? optimisticViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY)
                : optimisticViolations;
        if (hasPendingWaypoints) {
            optimisticViolations = optimisticViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.NO_ROUTE);
        }
        if (hasModifiedDistanceRate || hasModifiedDistance) {
            optimisticViolations = optimisticViolations.filter(
                (violation) => !(violation.name === CONST.VIOLATIONS.MODIFIED_AMOUNT && violation.data?.type === CONST.MODIFIED_AMOUNT_VIOLATION_DATA.DISTANCE),
            );
        }

        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            updatedTransaction,
            optimisticViolations,
            policy,
            policyTagList ?? {},
            policyCategories ?? {},
            hasDependentTags(policy, policyTagList ?? {}),
            isInvoice,
            isSelfDM(iouReport),
            iouReport,
            isFromExpenseReport,
        );
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
        if (hash) {
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                value: {
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: violationsOnyxData.value,
                    },
                },
            });
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                value: {
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: currentTransactionViolations,
                    },
                },
            });
        }
        if (
            violationsOnyxData &&
            ((iouReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN) === CONST.REPORT.STATUS_NUM.OPEN ||
                (hasModifiedReimbursable && iouReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED))
        ) {
            const currentNextStep = iouReportNextStep ?? {};
            const shouldFixViolations = Array.isArray(violationsOnyxData.value) && violationsOnyxData.value.length > 0;
            const moneyRequestReport = updatedMoneyRequestReport ?? iouReport ?? undefined;
            const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, getAllTransactionViolations(), currentUserAccountIDParam, currentUserEmailParam);
            const optimisticNextStep = buildOptimisticNextStep({
                report: moneyRequestReport,
                predictedNextStatus: iouReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
                shouldFixViolations,
                currentUserAccountIDParam,
                currentUserEmailParam,
                hasViolations,
                isASAPSubmitBetaEnabled,
                policy,
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
                // buildOptimisticNextStep is used in parallel
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                value: buildNextStepNew({
                    report: moneyRequestReport,
                    predictedNextStatus: iouReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
                    shouldFixViolations,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    policy,
                    formatPhoneNumber,
                }),
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
                value: currentNextStep,
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    nextStep: iouReport?.nextStep ?? null,
                    pendingFields: {
                        nextStep: null,
                    },
                },
            });
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    pendingFields: {
                        nextStep: null,
                    },
                },
            });
        }
    }

    // Reset the transaction thread to its original state
    if (transactionThreadReport?.reportID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: transactionThreadReport,
        });
    }

    return {
        params: apiParams,
        onyxData: {optimisticData, successData, failureData},
    };
}

/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 * @param [shouldBuildOptimisticModifiedExpenseReportAction=true] When true, build an optimistic MODIFIED_EXPENSE report action.
 */
function getUpdateTrackExpenseParams(
    transactionID: string | undefined,
    transactionThreadReportID: string | undefined,
    transactionChanges: TransactionChanges,
    policy: OnyxEntry<OnyxTypes.Policy>,
    hash?: number,
    shouldBuildOptimisticModifiedExpenseReportAction = true,
): UpdateMoneyRequestData<
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
> {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.SNAPSHOT>
    > = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = getClearedPendingFields(transactionChanges);
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

    // Step 2: Get all the collections being updated
    const transactionThread = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const chatReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const updatedTransaction = transaction
        ? getUpdatedTransaction({
              transaction,
              transactionChanges,
              isFromExpenseReport: false,
              policy,
          })
        : null;
    const transactionDetails = getTransactionDetails(updatedTransaction);

    if (transactionDetails?.waypoints) {
        transactionDetails.waypoints = stringifyWaypointsForAPI(transactionDetails.waypoints as WaypointCollection);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> = Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => key in transactionChanges));

    const apiParams: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: chatReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && hasPendingWaypoints) {
        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            value: null,
        });

        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
            },
        });
    }

    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // - we're merging two expenses (server does not create MODIFIED_EXPENSE in this flow)
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    const allowNegative = shouldEnableNegative(transactionThread ?? undefined);
    const updatedReportAction = shouldBuildOptimisticModifiedExpenseReportAction
        ? buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, false, policy, updatedTransaction, allowNegative)
        : null;
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && isFetchingWaypointsFromServer(transaction)) && updatedReportAction) {
        apiParams.reportActionID = updatedReportAction.reportActionID;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {
                    ...(updatedReportAction as OnyxTypes.ReportAction),
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                },
            },
        });
    }

    // Step 4: Update the report preview message (and report header) so LHN amount tracked is correct.
    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...updatedTransaction,
            pendingFields,
            errorFields: null,
        },
    });

    if (updatedReportAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                lastActorAccountID: updatedReportAction.actorAccountID,
            },
        });
    }

    if (isScanning(transaction) && transactionThread?.parentReportActionID && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {[transactionThread.parentReportActionID]: {originalMessage: {whisperedTo: []}}},
        });
    }

    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });

    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...transaction,
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields,
        },
    });

    // Reset the transaction thread to its original state
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
        value: transactionThread,
    });

    // Roll back the snapshot copy of the transaction so the search row reverts to its pre-edit state
    if (hash) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction ?? null,
                },
            },
        });
    }

    return {
        params: apiParams,
        onyxData: {optimisticData, successData, failureData},
    };
}

export {
    getUpdateMoneyRequestParams,
    getUpdateTrackExpenseParams,
    updateMoneyRequestDate,
    updateMoneyRequestBillable,
    updateMoneyRequestReimbursable,
    updateMoneyRequestMerchant,
    updateMoneyRequestAttendees,
    updateMoneyRequestTag,
    updateMoneyRequestTaxAmount,
    updateMoneyRequestTaxRate,
    updateMoneyRequestDistance,
    updateMoneyRequestCategory,
    updateMoneyRequestDescription,
    updateMoneyRequestDistanceRate,
    updateMoneyRequestAmountAndCurrency,
};
export type {GetUpdateMoneyRequestParamsType, UpdateMoneyRequestDataKeys};
