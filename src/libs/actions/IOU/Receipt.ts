import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {DetachReceiptParams, ReplaceReceiptParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasDependentTags, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildOptimisticDetachReceipt, isInvoiceReport as isInvoiceReportReportUtils} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {resolveDetachReceiptConflicts} from '@userActions/RequestConflictUtils';
import type {IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {ReplaceReceipt} from '.';
import {getAllReports, getAllTransactions, getAllTransactionViolations, getPolicyTags, getReceiptError} from '.';

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file https://github.com/Expensify/App/issues/80048
 */
function getPolicyTagsData(policyID: string | undefined) {
    const allPolicyTags = getPolicyTags();
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

function detachReceipt(
    transactionID: string | undefined,
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>,
    transactionPolicyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    if (!transactionID) {
        return;
    }
    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const newTransaction = transaction
        ? {
              ...transaction,
              receipt: {},
          }
        : null;

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: null,
                pendingFields: {
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...(transaction ?? null),
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.receiptDeleteFailureError'),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    if (transactionPolicy && isPaidGroupPolicy(transactionPolicy) && newTransaction) {
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            newTransaction,
            currentTransactionViolations,
            transactionPolicy,
            transactionPolicyTagList ?? {},
            transactionPolicyCategories ?? {},
            hasDependentTags(transactionPolicy, transactionPolicyTagList ?? {}),
            isInvoiceReportReportUtils(expenseReport),
        );
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }

    const updatedReportAction = buildOptimisticDetachReceipt(expenseReport?.reportID, transactionID, transaction?.merchant);

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${updatedReportAction?.reportID}`,
        value: {
            [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
        },
    });
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${updatedReportAction?.reportID}`,
        value: {
            lastVisibleActionCreated: updatedReportAction.created,
            lastReadTime: updatedReportAction.created,
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${updatedReportAction?.reportID}`,
        value: {
            lastVisibleActionCreated: expenseReport?.lastVisibleActionCreated,
            lastReadTime: expenseReport?.lastReadTime,
        },
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
        value: {
            [updatedReportAction.reportActionID]: {pendingAction: null},
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
        value: {
            [updatedReportAction.reportActionID]: {
                ...(updatedReportAction as OnyxTypes.ReportAction),
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
            },
        },
    });

    const parameters: DetachReceiptParams = {transactionID, reportActionID: updatedReportAction.reportActionID};

    API.write(
        WRITE_COMMANDS.DETACH_RECEIPT,
        parameters,
        {optimisticData, successData, failureData},
        {
            checkAndFixConflictingRequest: (persistedRequests) => resolveDetachReceiptConflicts(persistedRequests, parameters),
        },
    );
}

function replaceReceipt({transactionID, file, source, state, transactionPolicy, transactionPolicyCategories, isSameReceipt}: ReplaceReceipt) {
    if (!file) {
        return;
    }

    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const oldReceipt = transaction?.receipt ?? {};
    const receiptOptimistic = {
        source,
        localSource: null,
        state: state ?? CONST.IOU.RECEIPT_STATE.OPEN,
        filename: file.name,
    };
    const newTransaction = transaction && {...transaction, receipt: receiptOptimistic};
    const retryParams: ReplaceReceipt = {transactionID, file: undefined, source, transactionPolicy, transactionPolicyCategories};
    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: receiptOptimistic,
                pendingFields: {
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
                errors: getReceiptError(receiptOptimistic, file.name, undefined, undefined, CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    if (transactionPolicy && isPaidGroupPolicy(transactionPolicy) && newTransaction) {
        // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policyTagList = getPolicyTagsData(transactionPolicy.id);
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            newTransaction,
            currentTransactionViolations,
            transactionPolicy,
            policyTagList ?? {},
            transactionPolicyCategories ?? {},
            hasDependentTags(transactionPolicy, policyTagList ?? {}),
            isInvoiceReportReportUtils(expenseReport),
        );
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }
    if (currentSearchQueryJSON?.hash) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                        receipt: receiptOptimistic,
                    },
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                        receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
                    },
                },
            },
        });
    }

    const parameters: ReplaceReceiptParams = {
        transactionID,
        receipt: file,
        receiptState: state,
        isSameReceipt,
    };

    API.write(WRITE_COMMANDS.REPLACE_RECEIPT, parameters, {optimisticData, successData, failureData});
}

function setMoneyRequestReceipt(
    transactionID: string,
    source: string,
    filename: string,
    isDraft: boolean,
    type?: string,
    isTestReceipt = false,
    isTestDriveReceipt = false,
    thumbnail?: string,
) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        // isTestReceipt = false and isTestDriveReceipt = false are being converted to null because we don't really need to store it in Onyx in those cases
        receipt: {source, filename, type: type ?? '', isTestReceipt: isTestReceipt ? true : null, isTestDriveReceipt: isTestDriveReceipt ? true : null, thumbnail},
    });
}

// eslint-disable-next-line rulesdir/no-negated-variables
function navigateToStartStepIfScanFileCannotBeRead(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    onSuccess: (file: File) => void,
    requestType: IOURequestType,
    iouType: IOUType,
    transactionID: string,
    reportID: string,
    receiptType: string | undefined,
    onFailureCallback?: () => void,
) {
    if (!receiptFilename || !receiptPath) {
        return;
    }

    const onFailure = () => {
        setMoneyRequestReceipt(transactionID, '', '', true, '');
        if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
            if (onFailureCallback) {
                onFailureCallback();
                return;
            }
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
            return;
        }
        navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID);
    };
    readFileAsync(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}

function checkIfScanFileCanBeRead(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    receiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
) {
    if (!receiptFilename || !receiptPath) {
        onFailure();
        return Promise.resolve();
    }

    return readFileAsync(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}

export {checkIfScanFileCanBeRead, detachReceipt, navigateToStartStepIfScanFileCannotBeRead, replaceReceipt, setMoneyRequestReceipt};
