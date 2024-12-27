import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {FormOnyxValues} from '@components/Form/types';
import type {PaymentData, SearchQueryJSON} from '@components/Search/types';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import * as API from '@libs/API';
import type {ExportSearchItemsToCSVParams, SubmitReportParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import fileDownload from '@libs/fileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {rand64} from '@libs/NumberUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {isReportListItemType, isTransactionListItemType} from '@libs/SearchUIUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {LastPaymentMethod, SearchResults} from '@src/types/onyx';
import type {SearchPolicy, SearchReport, SearchTransaction} from '@src/types/onyx/SearchResults';
import * as Report from './Report';

let currentUserEmail: string;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? '';
    },
});

let lastPaymentMethod: OnyxEntry<LastPaymentMethod>;
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
    callback: (val) => {
        lastPaymentMethod = val;
    },
});

let allSnapshots: OnyxCollection<SearchResults>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.SNAPSHOT,
    callback: (val) => {
        allSnapshots = val;
    },
    waitForCollectionCallback: true,
});

function handleActionButtonPress(hash: number, item: TransactionListItemType | ReportListItemType, goToItem: () => void) {
    // The transactionIDList is needed to handle actions taken on `status:all` where transactions on single expense reports can be approved/paid.
    // We need the transactionID to display the loading indicator for that list item's action.
    const transactionID = isTransactionListItemType(item) ? [item.transactionID] : undefined;
    const allReportTransactions = (isReportListItemType(item) ? item.transactions : [item]) as SearchTransaction[];
    const hasHeldExpense = ReportUtils.hasHeldExpenses('', allReportTransactions);

    if (hasHeldExpense) {
        goToItem();
        return;
    }

    switch (item.action) {
        case CONST.SEARCH.ACTION_TYPES.PAY:
            getPayActionCallback(hash, item, goToItem);
            return;
        case CONST.SEARCH.ACTION_TYPES.APPROVE:
            approveMoneyRequestOnSearch(hash, [item.reportID], transactionID);
            return;
        case CONST.SEARCH.ACTION_TYPES.SUBMIT: {
            const policy = (allSnapshots?.[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`]?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`] ?? {}) as SearchPolicy;
            submitMoneyRequestOnSearch(hash, [item], [policy], transactionID);
            return;
        }
        default:
            goToItem();
    }
}

function getPayActionCallback(hash: number, item: TransactionListItemType | ReportListItemType, goToItem: () => void) {
    const lastPolicyPaymentMethod = item.policyID ? (lastPaymentMethod?.[item.policyID] as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>) : null;

    if (!lastPolicyPaymentMethod) {
        goToItem();
        return;
    }

    const report = (allSnapshots?.[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`]?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`] ?? {}) as SearchReport;
    const amount = Math.abs((report?.total ?? 0) - (report?.nonReimbursableTotal ?? 0));
    const transactionID = isTransactionListItemType(item) ? [item.transactionID] : undefined;

    if (lastPolicyPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        payMoneyRequestOnSearch(hash, [{reportID: item.reportID, amount, paymentType: lastPolicyPaymentMethod}], transactionID);
        return;
    }

    const hasVBBA = !!allSnapshots?.[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`]?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`]?.achAccount?.bankAccountID;
    if (hasVBBA) {
        payMoneyRequestOnSearch(hash, [{reportID: item.reportID, amount, paymentType: lastPolicyPaymentMethod}], transactionID);
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
                },
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

function search({queryJSON, offset}: {queryJSON: SearchQueryJSON; offset?: number}) {
    const {optimisticData, finallyData, failureData} = getOnyxLoadingData(queryJSON.hash, queryJSON);
    const {flatFilters, ...queryJSONWithoutFlatFilters} = queryJSON;
    const queryWithOffset = {
        ...queryJSONWithoutFlatFilters,
        offset,
    };
    const jsonQuery = JSON.stringify(queryWithOffset);

    API.write(WRITE_COMMANDS.SEARCH, {hash: queryJSON.hash, jsonQuery}, {optimisticData, finallyData, failureData});
}

/**
 * It's possible that we return legacy transactions that don't have a transaction thread created yet.
 * In that case, when users select the search result row, we need to create the transaction thread on the fly and update the search result with the new transactionThreadReport
 */
function createTransactionThread(hash: number, transactionID: string, reportID: string, moneyRequestReportActionID: string) {
    Report.openReport(reportID, '', [currentUserEmail], undefined, moneyRequestReportActionID);

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

function submitMoneyRequestOnSearch(hash: number, reportList: SearchReport[], policy: SearchPolicy[], transactionIDList?: string[]) {
    const createActionLoadingData = (isLoading: boolean): OnyxUpdate[] => [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: transactionIDList
                    ? (Object.fromEntries(
                          transactionIDList.map((transactionID) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {isActionLoading: isLoading}]),
                      ) as Partial<SearchTransaction>)
                    : (Object.fromEntries(reportList.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isActionLoading: isLoading}])) as Partial<SearchReport>),
            },
        },
    ];
    const optimisticData: OnyxUpdate[] = createActionLoadingData(true);
    const finallyData: OnyxUpdate[] = createActionLoadingData(false);

    const report = (reportList.at(0) ?? {}) as SearchReport;
    const parameters: SubmitReportParams = {
        reportID: report.reportID,
        managerAccountID: PolicyUtils.getSubmitToAccountID(policy.at(0), report) ?? report?.managerID,
        reportActionID: rand64(),
    };

    // The SubmitReport command is not 1:1:1 yet, which means creating a separate SubmitMoneyRequestOnSearch command is not feasible until https://github.com/Expensify/Expensify/issues/451223 is done.
    // In the meantime, we'll call SubmitReport which works for a single expense only, so not bulk actions are possible.
    API.write(WRITE_COMMANDS.SUBMIT_REPORT, parameters, {optimisticData, finallyData});
}

function approveMoneyRequestOnSearch(hash: number, reportIDList: string[], transactionIDList?: string[]) {
    const createOnyxData = (update: Partial<SearchTransaction> | Partial<SearchReport>): OnyxUpdate[] => [
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
    const failureData: OnyxUpdate[] = createOnyxData({hasError: true});
    const finallyData: OnyxUpdate[] = createOnyxData({isActionLoading: false});

    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST_ON_SEARCH, {hash, reportIDList}, {optimisticData, failureData, finallyData});
}

function payMoneyRequestOnSearch(hash: number, paymentData: PaymentData[], transactionIDList?: string[]) {
    const createOnyxData = (update: Partial<SearchTransaction> | Partial<SearchReport>): OnyxUpdate[] => [
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
    const failureData: OnyxUpdate[] = createOnyxData({hasError: true});
    const finallyData: OnyxUpdate[] = createOnyxData({isActionLoading: false});

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(
        SIDE_EFFECT_REQUEST_COMMANDS.PAY_MONEY_REQUEST_ON_SEARCH,
        {hash, paymentData: JSON.stringify(paymentData)},
        {optimisticData, failureData, finallyData},
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

function exportSearchItemsToCSV({query, jsonQuery, reportIDList, transactionIDList, policyIDs}: ExportSearchItemsToCSVParams, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query,
        jsonQuery,
        reportIDList,
        transactionIDList,
        policyIDs,
    }) as Params;

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        } else {
            formData.append(key, String(value));
        }
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV}), 'Expensify.csv', '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

/**
 * Updates the form values for the advanced filters search form.
 */
function updateAdvancedFilters(values: Partial<FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>>) {
    Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}

/**
 * Clears all values for the advanced filters search form.
 */
function clearAllFilters() {
    Onyx.set(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, null);
}

function clearAdvancedFilters() {
    const values: Partial<Record<ValueOf<typeof FILTER_KEYS>, null>> = {};
    Object.values(FILTER_KEYS)
        .filter((key) => key !== FILTER_KEYS.TYPE && key !== FILTER_KEYS.STATUS)
        .forEach((key) => {
            values[key] = null;
        });

    Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}

export {
    saveSearch,
    search,
    createTransactionThread,
    deleteMoneyRequestOnSearch,
    holdMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
    exportSearchItemsToCSV,
    updateAdvancedFilters,
    clearAllFilters,
    clearAdvancedFilters,
    deleteSavedSearch,
    payMoneyRequestOnSearch,
    approveMoneyRequestOnSearch,
    handleActionButtonPress,
    submitMoneyRequestOnSearch,
};
