import isEmpty from 'lodash/isEmpty';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {FormOnyxValues} from '@components/Form/types';
import type {ContinueActionParams, PaymentMethod, PaymentMethodType} from '@components/KYCWall/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {BankAccountMenuItem, PaymentData, SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';
import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import * as API from '@libs/API';
import {waitForWrites} from '@libs/API';
import type {ExportSearchItemsToCSVParams, ExportSearchWithTemplateParams, ReportExportParams, SubmitReportParams} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import Navigation from '@libs/Navigation/Navigation';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {rand64} from '@libs/NumberUtils';
import {getActivePaymentType} from '@libs/PaymentUtils';
import {getPersonalPolicy, getSubmitToAccountID, getValidConnectedIntegration, hasDynamicExternalWorkflow, isDelayedSubmissionEnabled} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import type {OptimisticExportIntegrationAction} from '@libs/ReportUtils';
import {
    buildOptimisticExportIntegrationAction,
    buildOptimisticIOUReportAction,
    generateReportID,
    getReportTransactions,
    hasHeldExpenses,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {isTransactionGroupListItemType} from '@libs/SearchUIUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import type {ExportTemplate, LastPaymentMethod, LastPaymentMethodType, Policy, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import type {PaymentInformation} from '@src/types/onyx/LastPaymentMethod';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {SearchReport, SearchTransaction} from '@src/types/onyx/SearchResults';
import type Nullable from '@src/types/utils/Nullable';
import SafeString from '@src/utils/SafeString';
import {setPersonalBankAccountContinueKYCOnSuccess} from './BankAccounts';
import {prepareRejectMoneyRequestData, rejectMoneyRequest} from './IOU';
import {setOptimisticTransactionThread} from './Report';
import {saveLastSearchParams} from './ReportNavigation';

type OnyxSearchResponse = {
    data: [];
    search: {
        offset: number;
        hasMoreResults: boolean;
    };
};

type TransactionPreviewData = {
    hasParentReport: boolean;
    hasParentReportAction: boolean;
    hasTransaction: boolean;
    hasTransactionThreadReport: boolean;
};

function handleActionButtonPress(
    hash: number,
    item: TransactionListItemType | TransactionReportGroupListItemType,
    goToItem: () => void,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    snapshotReport: SearchReport,
    snapshotPolicy: Policy,
    lastPaymentMethod: OnyxEntry<LastPaymentMethod>,
    currentSearchKey?: SearchKey,
    onDEWModalOpen?: () => void,
) {
    // The transactionIDList is needed to handle actions taken on `status:""` where transactions on single expense reports can be approved/paid.
    // We need the transactionID to display the loading indicator for that list item's action.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const allReportTransactions = (isTransactionGroupListItemType(item) ? item.transactions : [item]) as SearchTransaction[];
    const hasHeldExpense = hasHeldExpenses('', allReportTransactions);

    if (hasHeldExpense) {
        goToItem();
        return;
    }

    switch (item.action) {
        case CONST.SEARCH.ACTION_TYPES.PAY:
            getPayActionCallback(hash, item, goToItem, snapshotReport, snapshotPolicy, lastPaymentMethod, currentSearchKey);
            return;
        case CONST.SEARCH.ACTION_TYPES.APPROVE:
            if (hasDynamicExternalWorkflow(snapshotPolicy)) {
                onDEWModalOpen?.();
                return;
            }
            approveMoneyRequestOnSearch(hash, [item.reportID], currentSearchKey);
            return;
        case CONST.SEARCH.ACTION_TYPES.SUBMIT: {
            if (hasDynamicExternalWorkflow(snapshotPolicy)) {
                onDEWModalOpen?.();
                return;
            }
            submitMoneyRequestOnSearch(hash, [item], [snapshotPolicy], currentSearchKey);
            return;
        }
        case CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING: {
            if (!item) {
                return;
            }

            const policy = snapshotPolicy ?? {};
            const connectedIntegration = getValidConnectedIntegration(policy);

            if (!connectedIntegration) {
                return;
            }

            exportToIntegrationOnSearch(hash, item.reportID, connectedIntegration, currentSearchKey);
            return;
        }
        default:
            goToItem();
    }
}

function getLastPolicyBankAccountID(
    policyID: string | undefined,
    lastPaymentMethods: OnyxEntry<LastPaymentMethod>,
    reportType: keyof LastPaymentMethodType = 'lastUsed',
): number | undefined {
    if (!policyID) {
        return undefined;
    }
    const lastPolicyPaymentMethod = lastPaymentMethods?.[policyID];
    return typeof lastPolicyPaymentMethod === 'string' ? undefined : (lastPolicyPaymentMethod?.[reportType] as PaymentInformation)?.bankAccountID;
}

function getLastPolicyPaymentMethod(
    policyID: string | undefined,
    lastPaymentMethods: OnyxEntry<LastPaymentMethod>,
    reportType: keyof LastPaymentMethodType = 'lastUsed',
    isIOUReport?: boolean,
): ValueOf<typeof CONST.IOU.PAYMENT_TYPE> | undefined {
    if (!policyID) {
        return undefined;
    }

    const personalPolicy = getPersonalPolicy();

    const lastPolicyPaymentMethod = lastPaymentMethods?.[policyID] ?? (isIOUReport && personalPolicy ? lastPaymentMethods?.[personalPolicy.id] : undefined);
    const result = typeof lastPolicyPaymentMethod === 'string' ? lastPolicyPaymentMethod : (lastPolicyPaymentMethod?.[reportType] as PaymentInformation)?.name;

    return result as ValueOf<typeof CONST.IOU.PAYMENT_TYPE> | undefined;
}

function getReportType(reportID?: string) {
    if (isIOUReportUtil(reportID)) {
        return CONST.REPORT.TYPE.IOU;
    }

    if (isInvoiceReport(reportID)) {
        return CONST.REPORT.TYPE.INVOICE;
    }

    if (isExpenseReport(reportID)) {
        return CONST.REPORT.TYPE.EXPENSE;
    }

    return undefined;
}

function getPayActionCallback(
    hash: number,
    item: TransactionListItemType | TransactionReportGroupListItemType,
    goToItem: () => void,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    snapshotReport: SearchReport,
    snapshotPolicy: Policy,
    lastPaymentMethod: OnyxEntry<LastPaymentMethod>,
    currentSearchKey?: SearchKey,
) {
    const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(item.policyID, lastPaymentMethod, getReportType(item.reportID));

    if (!lastPolicyPaymentMethod || !Object.values(CONST.IOU.PAYMENT_TYPE).includes(lastPolicyPaymentMethod)) {
        goToItem();
        return;
    }

    const amount = Math.abs((snapshotReport?.total ?? 0) - (snapshotReport?.nonReimbursableTotal ?? 0));

    if (lastPolicyPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        payMoneyRequestOnSearch(hash, [{reportID: item.reportID, amount, paymentType: lastPolicyPaymentMethod}], currentSearchKey);
        return;
    }

    const hasVBBA = !!snapshotPolicy?.achAccount?.bankAccountID;
    if (hasVBBA) {
        payMoneyRequestOnSearch(hash, [{reportID: item.reportID, amount, paymentType: lastPolicyPaymentMethod}], currentSearchKey);
        return;
    }

    goToItem();
}

function getOnyxLoadingData(
    hash: number,
    queryJSON?: SearchQueryJSON,
    offset?: number,
    isOffline?: boolean,
): {optimisticData: OnyxUpdate[]; finallyData: OnyxUpdate[]; failureData: OnyxUpdate[]} {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                search: {
                    isLoading: true,
                    ...(offset ? {offset} : {}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                errors: null,
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                search: {
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                ...(isOffline ? {} : {data: []}),
                search: {
                    status: queryJSON?.status,
                    type: queryJSON?.type,
                    isLoading: false,
                },
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    return {optimisticData, finallyData, failureData};
}

function saveSearch({queryJSON, newName}: {queryJSON: SearchQueryJSON; newName?: string}) {
    const saveSearchName = newName ?? queryJSON?.inputQuery ?? '';
    const jsonQuery = JSON.stringify(queryJSON);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.SAVED_SEARCHES}`,
            value: {
                [queryJSON.hash]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    name: saveSearchName,
                    query: queryJSON.inputQuery,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.SAVED_SEARCHES}`,
            value: {
                [queryJSON.hash]: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.SAVED_SEARCHES}`,
            value: {
                [queryJSON.hash]: {
                    pendingAction: null,
                },
            },
        },
    ];
    API.write(WRITE_COMMANDS.SAVE_SEARCH, {jsonQuery, newName: saveSearchName}, {optimisticData, failureData, successData});
}

function deleteSavedSearch(hash: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.SAVED_SEARCHES}`,
            value: {
                [hash]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.SAVED_SEARCHES}`,
            value: {
                [hash]: null,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.SAVED_SEARCHES}`,
            value: {
                [hash]: {
                    pendingAction: null,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_SAVED_SEARCH, {hash}, {optimisticData, failureData, successData});
}

function openSearchPage() {
    API.read(READ_COMMANDS.OPEN_SEARCH_PAGE, null);
}

function search({
    queryJSON,
    searchKey,
    offset,
    shouldCalculateTotals = false,
    prevReportsLength,
    isOffline = false,
}: {
    queryJSON: SearchQueryJSON;
    searchKey: SearchKey | undefined;
    offset?: number;
    shouldCalculateTotals?: boolean;
    prevReportsLength?: number;
    isOffline?: boolean;
}) {
    const {optimisticData, finallyData, failureData} = getOnyxLoadingData(queryJSON.hash, queryJSON, offset, isOffline);
    const {flatFilters, ...queryJSONWithoutFlatFilters} = queryJSON;
    const query = {
        ...queryJSONWithoutFlatFilters,
        searchKey,
        offset,
        filters: queryJSONWithoutFlatFilters.filters ?? null,
        shouldCalculateTotals,
    };
    const jsonQuery = JSON.stringify(query);
    saveLastSearchParams({
        queryJSON,
        offset,
        allowPostSearchRecount: false,
    });

    return waitForWrites(READ_COMMANDS.SEARCH).then(() => {
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        return API.makeRequestWithSideEffects(READ_COMMANDS.SEARCH, {hash: queryJSON.hash, jsonQuery}, {optimisticData, finallyData, failureData}).then((result) => {
            const response = result?.onyxData?.[0]?.value as OnyxSearchResponse;
            const reports = Object.keys(response?.data ?? {})
                .filter((key) => key.startsWith(ONYXKEYS.COLLECTION.REPORT))
                .map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT, ''));
            if (response?.search?.offset) {
                // Indicates that search results are extended from the Report view (with navigation between reports),
                // using previous results to enable correct counter behavior.
                if (prevReportsLength) {
                    saveLastSearchParams({
                        queryJSON,
                        offset,
                        hasMoreResults: !!response?.search?.hasMoreResults,
                        previousLengthOfResults: prevReportsLength,
                        allowPostSearchRecount: false,
                    });
                }
            } else {
                // Applies to all searches from the Search View
                saveLastSearchParams({
                    queryJSON,
                    offset,
                    hasMoreResults: !!response?.search?.hasMoreResults,
                    previousLengthOfResults: reports.length,
                    allowPostSearchRecount: true,
                });
            }

            return result?.jsonCode;
        });
    });
}

/**
 * It's possible that we return legacy transactions that don't have a transaction thread created yet.
 * In that case, when users select the search result row, we need to create the transaction thread on the fly and update the search result with the new transactionThreadReport
 */
function updateSearchResultsWithTransactionThreadReportID(hash: number, transactionID: string, reportID: string) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const onyxUpdate: Record<string, Record<string, Partial<SearchTransaction>>> = {
        data: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                transactionThreadReportID: reportID,
            },
        },
    };
    Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, onyxUpdate);
}

function holdMoneyRequestOnSearch(hash: number, transactionIDList: string[], comment: string, allTransactions: OnyxCollection<Transaction>, allReportActions: OnyxCollection<ReportActions>) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);
    // eslint-disable-next-line unicorn/no-array-for-each
    transactionIDList.forEach((transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`] ?? {};
        const iouReportAction = getIOUActionForTransactionID(Object.values(reportActions ?? {}), transactionID);
        if (iouReportAction) {
            optimisticData.push({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    [iouReportAction.reportActionID]: {
                        childVisibleActionCount: (iouReportAction?.childVisibleActionCount ?? 0) + 1,
                    },
                },
            });
        }
    });

    API.write(WRITE_COMMANDS.HOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList, comment}, {optimisticData, finallyData});
}

function submitMoneyRequestOnSearch(hash: number, reportList: Report[], policy: Policy[], currentSearchKey?: SearchKey) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {isActionLoading: true}])),
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {isActionLoading: false}])),
        },
    ];

    // If we are on the 'Submit' suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    if (currentSearchKey === CONST.SEARCH.SEARCH_KEYS.SUBMIT) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: Object.fromEntries(reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`, null])),
            },
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {isActionLoading: false}])),
        },
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: Object.fromEntries(
                reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`, {errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')}]),
            ),
        },
    ];

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const report = (reportList.at(0) ?? {}) as SearchReport;
    const parameters: SubmitReportParams = {
        reportID: report.reportID,
        managerAccountID: getSubmitToAccountID(policy.at(0), report) ?? report?.managerID,
        reportActionID: rand64(),
    };

    // The SubmitReport command is not 1:1:1 yet, which means creating a separate SubmitMoneyRequestOnSearch command is not feasible until https://github.com/Expensify/Expensify/issues/451223 is done.
    // In the meantime, we'll call SubmitReport which works for a single expense only, so not bulk actions are possible.
    API.write(WRITE_COMMANDS.SUBMIT_REPORT, parameters, {optimisticData, successData, failureData});
}

function approveMoneyRequestOnSearch(hash: number, reportIDList: string[], currentSearchKey?: SearchKey) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(reportIDList.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {isActionLoading: true}])),
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(reportIDList.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {isActionLoading: false}])),
        },
    ];

    // If we are on the 'Approve', `Unapproved cash` or the `Unapproved company cards` suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    const approveActionSuggestedSearches: Partial<SearchKey[]> = [CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH, CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD];
    if (approveActionSuggestedSearches.includes(currentSearchKey)) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: Object.fromEntries(reportIDList.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null])),
            },
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(reportIDList.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {isActionLoading: false}])),
        },
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: Object.fromEntries(
                reportIDList.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')}]),
            ),
        },
    ];

    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST_ON_SEARCH, {hash, reportIDList}, {optimisticData, failureData, successData});
}

function exportToIntegrationOnSearch(hash: number, reportID: string, connectionName: ConnectionName, currentSearchKey?: SearchKey) {
    const optimisticAction = buildOptimisticExportIntegrationAction(connectionName);
    const successAction: OptimisticExportIntegrationAction = {...optimisticAction, pendingAction: null};
    const optimisticReportActionID = optimisticAction.reportActionID;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {isActionLoading: true},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: optimisticAction,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {isActionLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: successAction,
            },
        },
    ];

    // If we are on the 'Export' suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    if (currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPORT) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
                },
            },
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {isActionLoading: false},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
        },
    ];

    const params = {
        reportIDList: reportID,
        connectionName,
        type: 'MANUAL',
        optimisticReportActions: JSON.stringify({
            [reportID]: optimisticReportActionID,
        }),
    } satisfies ReportExportParams;

    API.write(WRITE_COMMANDS.REPORT_EXPORT, params, {optimisticData, failureData, successData});
}

function payMoneyRequestOnSearch(hash: number, paymentData: PaymentData[], currentSearchKey?: SearchKey) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(paymentData.map((item) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${item.reportID}`, {isActionLoading: true}])),
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(paymentData.map((item) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${item.reportID}`, {isActionLoading: false}])),
        },
    ];

    // If we are on the 'Pay' suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    if (currentSearchKey === CONST.SEARCH.SEARCH_KEYS.PAY) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: Object.fromEntries(paymentData.map((item) => [`${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`, null])),
            },
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT_METADATA,
            value: Object.fromEntries(paymentData.map((item) => [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${item.reportID}`, {isActionLoading: false}])),
        },
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: ONYXKEYS.COLLECTION.REPORT,
            value: Object.fromEntries(
                paymentData.map((item) => [`${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`, {errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')}]),
            ),
        },
    ];

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(
        SIDE_EFFECT_REQUEST_COMMANDS.PAY_MONEY_REQUEST_ON_SEARCH,
        {hash, paymentData: JSON.stringify(paymentData)},
        {optimisticData, failureData, successData},
    ).then((response) => {
        if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return;
        }
        playSound(SOUNDS.SUCCESS);
    });
}

function unholdMoneyRequestOnSearch(hash: number, transactionIDList: string[]) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);

    API.write(WRITE_COMMANDS.UNHOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList}, {optimisticData, finallyData});
}

function deleteMoneyRequestOnSearch(hash: number, transactionIDList: string[]) {
    const {optimisticData: loadingOptimisticData, finallyData} = getOnyxLoadingData(hash);

    for (const transactionID of transactionIDList) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const optimisticData: OnyxUpdate[] = [
            ...loadingOptimisticData,
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                value: {
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    },
                },
            },
        ];

        const failureData: OnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                value: {
                    data: {
                        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {pendingAction: null},
                    },
                },
            },
        ];

        API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList: [transactionID]}, {optimisticData, failureData, finallyData});
    }
}

function rejectMoneyRequestInBulk(hash: number, reportID: string, comment: string, transactionIDs: string[]) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];
    const transactionIDToRejectReportAction: Record<
        string,
        {
            rejectedActionReportActionID: string;
            rejectedCommentReportActionID: string;
        }
    > = {};
    for (const transactionID of transactionIDs) {
        const data = prepareRejectMoneyRequestData(transactionID, reportID, comment, undefined, true);
        if (data) {
            optimisticData.push(...data.optimisticData);
            successData.push(...data.successData);
            failureData.push(...data.failureData);
            transactionIDToRejectReportAction[transactionID] = {
                rejectedActionReportActionID: data.parameters.rejectedActionReportActionID,
                rejectedCommentReportActionID: data.parameters.rejectedCommentReportActionID,
            };
        }
    }

    API.write(
        WRITE_COMMANDS.REJECT_MONEY_REQUEST_IN_BULK,
        {reportID, comment, transactionIDToRejectReportAction: JSON.stringify(transactionIDToRejectReportAction)},
        {optimisticData, successData, failureData, finallyData},
    );
}

function rejectMoneyRequestsOnSearch(hash: number, selectedTransactions: SelectedTransactions, comment: string, allPolicies: OnyxCollection<Policy>, allReports: OnyxCollection<Report>) {
    const transactionIDs = Object.keys(selectedTransactions);

    const transactionsByReport = transactionIDs.reduce<Record<string, string[]>>((acc, transactionID) => {
        const reportID = selectedTransactions[transactionID].reportID;

        if (!acc[reportID]) {
            acc[reportID] = [];
        }

        acc[reportID].push(transactionID);

        return acc;
    }, {});

    for (const [reportID, selectedTransactionIDs] of Object.entries(transactionsByReport)) {
        const allReportTransactions = getReportTransactions(reportID).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const allTransactionIDs = allReportTransactions.map((transaction) => transaction.transactionID);
        const areAllExpensesSelected = allTransactionIDs.every((transactionID) => selectedTransactionIDs.includes(transactionID));
        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        const isPolicyDelayedSubmissionEnabled = policy ? isDelayedSubmissionEnabled(policy) : false;
        if (isPolicyDelayedSubmissionEnabled && areAllExpensesSelected) {
            rejectMoneyRequestInBulk(hash, reportID, comment, allTransactionIDs);
        } else {
            // Share a single destination ID across all rejections from the same source report
            const sharedRejectedToReportID = generateReportID();
            for (const transactionID of selectedTransactionIDs) {
                rejectMoneyRequest(transactionID, reportID, comment, {sharedRejectedToReportID});
            }
        }
    }
}

type Params = Record<string, ExportSearchItemsToCSVParams>;

function exportSearchItemsToCSV({query, jsonQuery, reportIDList, transactionIDList}: ExportSearchItemsToCSVParams, onDownloadFailed: () => void) {
    const reportIDListParams: string[] = [];
    // eslint-disable-next-line unicorn/no-array-for-each
    reportIDList.forEach((reportID) => {
        const allReportTransactions = getReportTransactions(reportID).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const allTransactionIDs = allReportTransactions.map((transaction) => transaction.transactionID);
        if (allTransactionIDs.every((transactionID) => transactionIDList.includes(transactionID))) {
            if (reportIDListParams.includes(reportID)) {
                return;
            }
            reportIDListParams.push(reportID);
        }
    });
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query,
        jsonQuery,
        reportIDList: reportIDListParams,
        transactionIDList,
    }) as Params;

    const formData = new FormData();
    // eslint-disable-next-line unicorn/no-array-for-each
    Object.entries(finalParameters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        } else {
            formData.append(key, SafeString(value));
        }
    });

    fileDownload(getCommandURL({command: WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV}), 'Expensify.csv', '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function queueExportSearchItemsToCSV({query, jsonQuery, reportIDList, transactionIDList}: ExportSearchItemsToCSVParams) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query,
        jsonQuery,
        reportIDList,
        transactionIDList,
    }) as ExportSearchItemsToCSVParams;

    API.write(WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV, finalParameters);
}

function queueExportSearchWithTemplate({templateName, templateType, jsonQuery, reportIDList, transactionIDList, policyID}: ExportSearchWithTemplateParams) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_WITH_TEMPLATE, {
        templateName,
        templateType,
        jsonQuery,
        reportIDList,
        transactionIDList,
        policyID,
    }) as ExportSearchWithTemplateParams;

    API.write(WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_WITH_TEMPLATE, finalParameters);
}

/**
 * Collates a list of export templates available to the user from their account, policy, and custom integrations templates
 * @param integrationsExportTemplates - The user's custom integrations export templates
 * @param csvExportLayouts - The user's custom account level export templates
 * @param policy - The user's policy
 * @param includeReportLevelExport - Whether to include the report level export template
 * @returns
 */
function getExportTemplates(
    integrationsExportTemplates: ExportTemplate[],
    csvExportLayouts: Record<string, ExportTemplate>,
    translate: LocalizedTranslate,
    policy?: Policy,
    includeReportLevelExport = true,
): ExportTemplate[] {
    // Helper function to normalize template data into consistent ExportTemplate format
    const normalizeTemplate = (templateName: string, template: ExportTemplate, type: ValueOf<typeof CONST.EXPORT_TEMPLATE_TYPES>, description = '', policyID?: string): ExportTemplate => ({
        ...template,
        templateName,
        description,
        policyID,
        type,
    });

    // By default, we always include the expense level export template
    const exportTemplates: ExportTemplate[] = [
        normalizeTemplate(CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT, {name: translate('export.expenseLevelExport')} as ExportTemplate, CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS),
    ];

    // Conditionally include the report level export template
    if (includeReportLevelExport) {
        exportTemplates.push(
            normalizeTemplate(CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT, {name: translate('export.reportLevelExport')} as ExportTemplate, CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS),
        );
    }

    // Collate a list of the user's account level in-app export templates, excluding the Default CSV template
    const accountInAppTemplates = Object.entries(csvExportLayouts ?? {})
        .filter(([, layout]) => layout.name !== CONST.REPORT.EXPORT_OPTION_LABELS.DEFAULT_CSV)
        .map(([templateName, layout]) => normalizeTemplate(templateName, layout, CONST.EXPORT_TEMPLATE_TYPES.IN_APP));

    // If we have a policy, collate a list of the policy-level in-app export templates
    const policyInAppTemplates = policy
        ? Object.entries(policy.exportLayouts ?? {}).map(([templateName, layout]) => normalizeTemplate(templateName, layout, CONST.EXPORT_TEMPLATE_TYPES.IN_APP, policy.name, policy.id))
        : [];

    // Update the integrations export templates to include the name, description, policyID, and type
    const integrationsTemplates = integrationsExportTemplates.map((template) => normalizeTemplate(template.name, template, CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS));

    return [...exportTemplates, ...integrationsTemplates, ...accountInAppTemplates, ...policyInAppTemplates];
}

/**
 * Updates the form values for the advanced filters search form.
 */
function updateAdvancedFilters(values: Nullable<Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>>, shouldUseOnyxSetMethod = false) {
    if (shouldUseOnyxSetMethod) {
        Onyx.set(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
        return;
    }
    Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}

/**
 * Clears all values for the advanced filters search form.
 */
function clearAllFilters() {
    Onyx.set(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, null);
}

function clearAdvancedFilters() {
    const values: Partial<Nullable<SearchAdvancedFiltersForm>> = {};
    Object.values(FILTER_KEYS)
        .filter((key) => key !== FILTER_KEYS.GROUP_BY)
        // eslint-disable-next-line unicorn/no-array-for-each
        .forEach((key) => {
            if (key === FILTER_KEYS.TYPE) {
                values[key] = CONST.SEARCH.DATA_TYPES.EXPENSE;
                return;
            }

            if (key === FILTER_KEYS.STATUS) {
                values[key] = CONST.SEARCH.STATUS.EXPENSE.ALL;
                return;
            }

            values[key] = null;
        });

    Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}

/**
 * For Expense reports, user can choose both expense and transaction, in this case we need to check for both selected reports and transactions
 * This function checks if all remaining selected transactions (not included in selectedReports) are eligible for bulk pay
 */
function shouldShowBulkOptionForRemainingTransactions(selectedTransactions: SelectedTransactions, selectedReportIDs?: string[], transactionKeys?: string[]) {
    if (!selectedTransactions || isEmpty(selectedTransactions)) {
        return true;
    }
    const neededFilterTransactions = transactionKeys?.filter((transactionIDKey) => !selectedReportIDs?.includes(selectedTransactions[transactionIDKey].reportID));
    if (!neededFilterTransactions?.length) {
        return true;
    }

    return neededFilterTransactions.every((transactionIDKey) => selectedTransactions[transactionIDKey].action === CONST.SEARCH.ACTION_TYPES.PAY);
}

/**
 * Checks if the current selected reports/transactions are eligible for bulk pay.
 */
function getPayOption(selectedReports: SelectedReports[], selectedTransactions: SelectedTransactions, lastPaymentMethods: OnyxEntry<LastPaymentMethod>, selectedReportIDs: string[]) {
    const transactionKeys = Object.keys(selectedTransactions ?? {});
    const firstTransaction = selectedTransactions?.[transactionKeys.at(0) ?? ''];
    const firstReport = selectedReports.at(0);
    const hasLastPaymentMethod =
        selectedReports.length > 0
            ? selectedReports.every((report) => !!getLastPolicyPaymentMethod(report.policyID, lastPaymentMethods))
            : transactionKeys.every((transactionIDKey) => !!getLastPolicyPaymentMethod(selectedTransactions[transactionIDKey].policyID, lastPaymentMethods));

    const shouldShowBulkPayOption =
        selectedReports.length > 0
            ? selectedReports.every(
                  (report) =>
                      report.allActions.includes(CONST.SEARCH.ACTION_TYPES.PAY) &&
                      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                      ((hasLastPaymentMethod && report.policyID) || (getReportType(report.reportID) === getReportType(firstReport?.reportID) && report.policyID === firstReport?.policyID)) &&
                      shouldShowBulkOptionForRemainingTransactions(selectedTransactions, selectedReportIDs, transactionKeys),
              )
            : transactionKeys.every(
                  (transactionIDKey) =>
                      selectedTransactions[transactionIDKey].action === CONST.SEARCH.ACTION_TYPES.PAY &&
                      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                      ((hasLastPaymentMethod && selectedTransactions[transactionIDKey].policyID) ||
                          (getReportType(selectedTransactions[transactionIDKey].reportID) === getReportType(firstTransaction?.reportID) &&
                              selectedTransactions[transactionIDKey].policyID === firstTransaction?.policyID)),
              );

    return {
        shouldEnableBulkPayOption: shouldShowBulkPayOption,
        isFirstTimePayment: !hasLastPaymentMethod,
    };
}

/**
 * Checks if current menu item is a valid bulk pay option
 */
function isValidBulkPayOption(item: PopoverMenuItem) {
    if (!item.key) {
        return false;
    }
    return Object.values(CONST.PAYMENT_METHODS).includes(item.key as PaymentMethod) || Object.values(CONST.IOU.PAYMENT_TYPE).includes(item.key as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>);
}

/**
 * Handles the click event when user selects bulk pay action.
 */
function handleBulkPayItemSelected(
    item: PopoverMenuItem,
    triggerKYCFlow: (params: ContinueActionParams) => void,
    isAccountLocked: boolean,
    showLockedAccountModal: () => void,
    policy: OnyxEntry<Policy>,
    latestBankItems: BankAccountMenuItem[] | undefined,
    activeAdminPolicies: Policy[],
    isUserValidated: boolean | undefined,
    confirmPayment?: (paymentType: PaymentMethodType | undefined, additionalData?: Record<string, unknown>) => void,
) {
    const {paymentType, selectedPolicy, shouldSelectPaymentMethod} = getActivePaymentType(item.key, activeAdminPolicies, latestBankItems);
    // Policy id is also a last payment method so we shouldn't early return here for that case.
    if (!isValidBulkPayOption(item) && !selectedPolicy) {
        return;
    }
    if (isAccountLocked) {
        showLockedAccountModal();
        return;
    }

    if (policy && shouldRestrictUserBillableActions(policy?.id)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy?.id));
        return;
    }

    if (!!selectedPolicy || shouldSelectPaymentMethod) {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
            return;
        }
        triggerKYCFlow({
            event: undefined,
            iouPaymentType: paymentType,
            paymentMethod: item.key as PaymentMethod,
            policy: selectedPolicy,
        });

        if (paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
        }
        return;
    }

    confirmPayment?.(paymentType as PaymentMethodType, item?.additionalData);
}

/**
 * Return true if selected reports/transactions have the same USD currency.
 */
function isCurrencySupportWalletBulkPay(selectedReports: SelectedReports[], selectedTransactions: SelectedTransactions) {
    return selectedReports?.length > 0
        ? Object.values(selectedReports).every((report) => report?.currency === CONST.CURRENCY.USD)
        : Object.values(selectedTransactions).every((transaction) => transaction.currency === CONST.CURRENCY.USD);
}

/**
 * Return the payment params for paying invoice reports on Search.
 */
function getPayMoneyOnSearchInvoiceParams(policyID: string | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod): Partial<PaymentData> {
    const invoiceParams: Partial<PaymentData> = {
        policyID,
        payAsBusiness,
    };
    if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
        invoiceParams.bankAccountID = methodID;
    }

    if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
        invoiceParams.fundID = methodID;
    }

    return invoiceParams;
}

/**
 * Return the total amount of selected transactions/reports.
 */
function getTotalFormattedAmount(selectedReports: SelectedReports[], selectedTransactions: SelectedTransactions, currency?: string): string {
    const transactionKeys = Object.keys(selectedTransactions ?? {});
    const totalAmount =
        selectedReports.length > 0
            ? selectedReports.reduce((acc, report) => acc + (Math.abs(report.total) ?? 0), 0)
            : transactionKeys.reduce((acc, transactionIdKey) => acc + (Math.abs(selectedTransactions[transactionIdKey].amount) ?? 0), 0);
    const formattedAmount = convertToDisplayString(totalAmount, currency);
    return formattedAmount ?? '';
}

/* Optimistically sets the data necessary to show the transaction thread report right away if user opens it from the Search tab.
 *
 * When we open a transaction thread from the Search tab we already have all necessary information to show its preview without waiting for OpenReport API call to be finished.
 * So we generate necessary data optimistically: parent report, parent report action, transaction, and transaction thread report.
 * This way we provide users instant responsiveness when clicking search results.
 *
 * Note: we don't create anything new, we just optimistically generate the data that we know will be returned by API.
 */
function setOptimisticDataForTransactionThreadPreview(item: TransactionListItemType, transactionPreviewData: TransactionPreviewData) {
    const {moneyRequestReportActionID, reportID, report, amount, currency, transactionID, created, transactionThreadReportID, policyID} = item;
    const {hasParentReport, hasParentReportAction, hasTransaction, hasTransactionThreadReport} = transactionPreviewData;
    const onyxUpdates: OnyxUpdate[] = [];

    // Set optimistic parent report
    if (!hasParentReport) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: report,
        });
    }

    // Set optimistic parent report action
    if (!hasParentReportAction && moneyRequestReportActionID) {
        const optimisticIOUAction = buildOptimisticIOUReportAction({
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment: '',
            participants: [],
            transactionID,
            iouReportID: reportID,
            created,
            reportActionID: moneyRequestReportActionID,
            linkedExpenseReportAction: {childReportID: transactionThreadReportID} as ReportAction,
        });
        optimisticIOUAction.pendingAction = undefined;
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticIOUAction.reportActionID]: optimisticIOUAction},
        });
    }

    // Set optimistic transaction
    if (!hasTransaction) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: item,
        });
    }

    // Set optimistic transaction thread report
    if (!hasTransactionThreadReport) {
        setOptimisticTransactionThread(transactionThreadReportID, reportID, moneyRequestReportActionID, policyID);
    }

    Onyx.update(onyxUpdates);
}

export {
    saveSearch,
    search,
    updateSearchResultsWithTransactionThreadReportID,
    deleteMoneyRequestOnSearch,
    holdMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    rejectMoneyRequestsOnSearch,
    exportSearchItemsToCSV,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    updateAdvancedFilters,
    clearAllFilters,
    clearAdvancedFilters,
    deleteSavedSearch,
    payMoneyRequestOnSearch,
    approveMoneyRequestOnSearch,
    handleActionButtonPress,
    submitMoneyRequestOnSearch,
    openSearchPage as openSearch,
    getLastPolicyPaymentMethod,
    getLastPolicyBankAccountID,
    exportToIntegrationOnSearch,
    getPayOption,
    isValidBulkPayOption,
    handleBulkPayItemSelected,
    isCurrencySupportWalletBulkPay,
    getExportTemplates,
    getReportType,
    getTotalFormattedAmount,
    setOptimisticDataForTransactionThreadPreview,
    getPayMoneyOnSearchInvoiceParams,
};
export type {TransactionPreviewData};
