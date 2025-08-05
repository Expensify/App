import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {FormOnyxValues} from '@components/Form/types';
import type {PaymentData, SearchQueryJSON} from '@components/Search/types';
import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionList/types';
import * as API from '@libs/API';
import type {ExportSearchItemsToCSVParams, ReportExportParams, SubmitReportParams} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {rand64} from '@libs/NumberUtils';
import {getSubmitToAccountID, getValidConnectedIntegration} from '@libs/PolicyUtils';
import type {OptimisticExportIntegrationAction} from '@libs/ReportUtils';
import {buildOptimisticExportIntegrationAction, hasHeldExpenses} from '@libs/ReportUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import {isTransactionGroupListItemType, isTransactionListItemType} from '@libs/SearchUIUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {FILTER_KEYS} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';
import type {LastPaymentMethod, LastPaymentMethodType, Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {SearchPolicy, SearchReport, SearchTransaction} from '@src/types/onyx/SearchResults';
import type Nullable from '@src/types/utils/Nullable';

function handleActionButtonPress(
    hash: number,
    item: TransactionListItemType | TransactionReportGroupListItemType,
    goToItem: () => void,
    isInMobileSelectionMode: boolean,
    snapshotReport: SearchReport,
    snapshotPolicy: SearchPolicy,
    lastPaymentMethod: OnyxEntry<LastPaymentMethod>,
    currentSearchKey?: SearchKey,
) {
    // The transactionIDList is needed to handle actions taken on `status:""` where transactions on single expense reports can be approved/paid.
    // We need the transactionID to display the loading indicator for that list item's action.
    const transactionID = isTransactionListItemType(item) ? [item.transactionID] : undefined;
    const allReportTransactions = (isTransactionGroupListItemType(item) ? item.transactions : [item]) as SearchTransaction[];
    const hasHeldExpense = hasHeldExpenses('', allReportTransactions);

    if (hasHeldExpense || isInMobileSelectionMode) {
        goToItem();
        return;
    }

    switch (item.action) {
        case CONST.SEARCH.ACTION_TYPES.PAY:
            getPayActionCallback(hash, item, goToItem, snapshotReport, snapshotPolicy, lastPaymentMethod, currentSearchKey);
            return;
        case CONST.SEARCH.ACTION_TYPES.APPROVE:
            approveMoneyRequestOnSearch(hash, [item.reportID], transactionID, currentSearchKey);
            return;
        case CONST.SEARCH.ACTION_TYPES.SUBMIT: {
            submitMoneyRequestOnSearch(hash, [item], [snapshotPolicy], transactionID, currentSearchKey);
            return;
        }
        case CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING: {
            if (!item) {
                return;
            }

            const policy = (snapshotPolicy ?? {}) as Policy;
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

function getLastPolicyPaymentMethod(policyID: string | undefined, lastPaymentMethods: OnyxEntry<LastPaymentMethod>) {
    if (!policyID) {
        return null;
    }
    let lastPolicyPaymentMethod = null;
    if (typeof lastPaymentMethods?.[policyID] === 'string') {
        lastPolicyPaymentMethod = lastPaymentMethods?.[policyID] as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    } else {
        lastPolicyPaymentMethod = (lastPaymentMethods?.[policyID] as LastPaymentMethodType)?.lastUsed.name as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    }

    return lastPolicyPaymentMethod;
}

function getPayActionCallback(
    hash: number,
    item: TransactionListItemType | TransactionReportGroupListItemType,
    goToItem: () => void,
    snapshotReport: SearchReport,
    snapshotPolicy: SearchPolicy,
    lastPaymentMethod: OnyxEntry<LastPaymentMethod>,
    currentSearchKey?: SearchKey,
) {
    const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(item.policyID, lastPaymentMethod);

    if (!lastPolicyPaymentMethod) {
        goToItem();
        return;
    }

    const amount = Math.abs((snapshotReport?.total ?? 0) - (snapshotReport?.nonReimbursableTotal ?? 0));
    const transactionID = isTransactionListItemType(item) ? [item.transactionID] : undefined;

    if (lastPolicyPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        payMoneyRequestOnSearch(hash, [{reportID: item.reportID, amount, paymentType: lastPolicyPaymentMethod}], transactionID, currentSearchKey);
        return;
    }

    const hasVBBA = !!snapshotPolicy?.achAccount?.bankAccountID;
    if (hasVBBA) {
        payMoneyRequestOnSearch(hash, [{reportID: item.reportID, amount, paymentType: lastPolicyPaymentMethod}], transactionID, currentSearchKey);
        return;
    }

    goToItem();
}

function getOnyxLoadingData(hash: number, queryJSON?: SearchQueryJSON): {optimisticData: OnyxUpdate[]; finallyData: OnyxUpdate[]; failureData: OnyxUpdate[]} {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                search: {
                    isLoading: true,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: [],
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

function openSearchFiltersCardPage() {
    const optimisticData: OnyxUpdate[] = [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, value: null}];

    const successData: OnyxUpdate[] = [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, value: null}];

    const failureData: OnyxUpdate[] = [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, value: null}];
    API.read(READ_COMMANDS.OPEN_SEARCH_FILTERS_CARD_PAGE, null, {optimisticData, successData, failureData});
}

function openSearchPage() {
    API.read(READ_COMMANDS.OPEN_SEARCH_PAGE, null);
}

function search({
    queryJSON,
    searchKey,
    offset,
    shouldCalculateTotals = false,
}: {
    queryJSON: SearchQueryJSON;
    searchKey: SearchKey | undefined;
    offset?: number;
    shouldCalculateTotals?: boolean;
}) {
    const {optimisticData, finallyData, failureData} = getOnyxLoadingData(queryJSON.hash, queryJSON);
    const {flatFilters, ...queryJSONWithoutFlatFilters} = queryJSON;
    const query = {
        ...queryJSONWithoutFlatFilters,
        searchKey,
        offset,
        shouldCalculateTotals,
    };
    const jsonQuery = JSON.stringify(query);

    API.read(READ_COMMANDS.SEARCH, {hash: queryJSON.hash, jsonQuery}, {optimisticData, finallyData, failureData});
}

/**
 * It's possible that we return legacy transactions that don't have a transaction thread created yet.
 * In that case, when users select the search result row, we need to create the transaction thread on the fly and update the search result with the new transactionThreadReport
 */
function updateSearchResultsWithTransactionThreadReportID(hash: number, transactionID: string, reportID: string) {
    const onyxUpdate: Record<string, Record<string, Partial<SearchTransaction>>> = {
        data: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                transactionThreadReportID: reportID,
            },
        },
    };
    Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, onyxUpdate);
}

function holdMoneyRequestOnSearch(hash: number, transactionIDList: string[], comment: string) {
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);

    API.write(WRITE_COMMANDS.HOLD_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList, comment}, {optimisticData, finallyData});
}

function submitMoneyRequestOnSearch(hash: number, reportList: SearchReport[], policy: SearchPolicy[], transactionIDList?: string[], currentSearchKey?: SearchKey) {
    const createOnyxData = (update: Partial<SearchTransaction> | Partial<SearchReport> | null): OnyxUpdate[] => [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: transactionIDList
                    ? (Object.fromEntries(transactionIDList.map((transactionID) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, update])) as Partial<SearchTransaction>)
                    : (Object.fromEntries(reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, update])) as Partial<SearchReport>),
            },
        },
    ];

    const optimisticData: OnyxUpdate[] = createOnyxData({isActionLoading: true});
    const failureData: OnyxUpdate[] = createOnyxData({isActionLoading: false});
    // If we are on the 'Submit' suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    const successData: OnyxUpdate[] = currentSearchKey === CONST.SEARCH.SEARCH_KEYS.SUBMIT ? createOnyxData(null) : createOnyxData({isActionLoading: false});

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

function approveMoneyRequestOnSearch(hash: number, reportIDList: string[], transactionIDList?: string[], currentSearchKey?: SearchKey) {
    const createOnyxData = (update: Partial<SearchTransaction> | Partial<SearchReport> | null): OnyxUpdate[] => [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: transactionIDList
                    ? (Object.fromEntries(transactionIDList.map((transactionID) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, update])) as Partial<SearchTransaction>)
                    : (Object.fromEntries(reportIDList.map((reportID) => [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, update])) as Partial<SearchReport>),
            },
        },
    ];

    const optimisticData: OnyxUpdate[] = createOnyxData({isActionLoading: true});
    const failureData: OnyxUpdate[] = createOnyxData({isActionLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});

    // If we are on the 'Approve', `Unapproved cash` or the `Unapproved company cards` suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    const approveActionSuggestedSearches: Partial<SearchKey[]> = [CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH, CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD];

    const successData: OnyxUpdate[] = approveActionSuggestedSearches.includes(currentSearchKey) ? createOnyxData(null) : createOnyxData({isActionLoading: false});

    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST_ON_SEARCH, {hash, reportIDList}, {optimisticData, failureData, successData});
}

function exportToIntegrationOnSearch(hash: number, reportID: string, connectionName: ConnectionName, currentSearchKey?: SearchKey) {
    const optimisticAction = buildOptimisticExportIntegrationAction(connectionName);
    const successAction: OptimisticExportIntegrationAction = {...optimisticAction, pendingAction: null};
    const optimisticReportActionID = optimisticAction.reportActionID;

    const createOnyxData = (update: Partial<SearchTransaction> | Partial<SearchReport> | null, reportAction?: OptimisticExportIntegrationAction | null): OnyxUpdate[] => [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: update,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticReportActionID]: reportAction,
            },
        },
    ];

    const optimisticData: OnyxUpdate[] = createOnyxData({isActionLoading: true}, optimisticAction);
    const failureData: OnyxUpdate[] = createOnyxData({errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'), isActionLoading: false}, null);
    // If we are on the 'Export' suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    const successData: OnyxUpdate[] = currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPORT ? createOnyxData(null, successAction) : createOnyxData({isActionLoading: false}, successAction);

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

function payMoneyRequestOnSearch(hash: number, paymentData: PaymentData[], transactionIDList?: string[], currentSearchKey?: SearchKey) {
    const createOnyxData = (update: Partial<SearchTransaction> | Partial<SearchReport> | null): OnyxUpdate[] => [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: transactionIDList
                    ? (Object.fromEntries(transactionIDList.map((transactionID) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, update])) as Partial<SearchTransaction>)
                    : (Object.fromEntries(paymentData.map((item) => [`${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`, update])) as Partial<SearchReport>),
            },
        },
    ];

    const optimisticData: OnyxUpdate[] = createOnyxData({isActionLoading: true});
    const failureData: OnyxUpdate[] = createOnyxData({isActionLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});
    // If we are on the 'Pay' suggested search, remove the report from the view once the action is taken, don't wait for the view to be re-fetched via Search
    const successData: OnyxUpdate[] = currentSearchKey === CONST.SEARCH.SEARCH_KEYS.PAY ? createOnyxData(null) : createOnyxData({isActionLoading: false});

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
    const {optimisticData, finallyData} = getOnyxLoadingData(hash);
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH, {hash, transactionIDList}, {optimisticData, finallyData});
}

type Params = Record<string, ExportSearchItemsToCSVParams>;

function exportSearchItemsToCSV({query, jsonQuery, reportIDList, transactionIDList}: ExportSearchItemsToCSVParams, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query,
        jsonQuery,
        reportIDList,
        transactionIDList,
    }) as Params;

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        } else {
            formData.append(key, String(value));
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
/**
 * Updates the form values for the advanced filters search form.
 */
function updateAdvancedFilters(values: Nullable<Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>>) {
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

export {
    saveSearch,
    search,
    updateSearchResultsWithTransactionThreadReportID,
    deleteMoneyRequestOnSearch,
    holdMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    queueExportSearchItemsToCSV,
    updateAdvancedFilters,
    clearAllFilters,
    clearAdvancedFilters,
    deleteSavedSearch,
    payMoneyRequestOnSearch,
    approveMoneyRequestOnSearch,
    handleActionButtonPress,
    submitMoneyRequestOnSearch,
    openSearchFiltersCardPage,
    openSearchPage as openSearch,
    getLastPolicyPaymentMethod,
    exportToIntegrationOnSearch,
};
