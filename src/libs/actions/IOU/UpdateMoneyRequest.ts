import type {NullishDeep, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getParsedComment, isSelfDM, isTrackExpenseReport} from '@libs/ReportUtils';
import {getMerchant, removeTransactionFromDuplicateTransactionViolation} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {Routes, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import type {UpdateMoneyRequestData, UpdateMoneyRequestDataKeys} from '.';
import {getUpdateMoneyRequestParams, getUpdateTrackExpenseParams} from '.';

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
}: UpdateMoneyRequestDateParams) {
    const transactionChanges: TransactionChanges = {
        created: value,
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
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
}) {
    const transactionChanges: TransactionChanges = {
        merchant: value,
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
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
}) {
    const parsedComment = getParsedComment(comment);
    const transactionChanges: TransactionChanges = {
        comment: parsedComment,
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
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
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
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
        });
        removeTransactionFromDuplicateTransactionViolation(data.onyxData, transactionID, transactions, transactionViolations);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY, params, onyxData);
}

export {
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
