import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {
    exportSearchItemsToCSV,
    getChatReportWithFallback,
    getExportTemplates,
    getFooterConvertedAmounts,
    openSearch,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    rejectMoneyRequestsOnSearch,
} from '@libs/actions/Search';
import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import fileDownload from '@libs/fileDownload';
import {translate} from '@libs/Localize';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExportTemplate, Policy, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import {translateLocal} from '../utils/TestHelper';

const translateForTest: LocalizedTranslate = (path, ...parameters) => translate(CONST.LOCALES.EN, path, ...parameters);

jest.mock('@libs/API');
jest.mock('@libs/fileDownload');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));
jest.mock('@libs/actions/IOU/RejectMoneyRequest', () => ({
    rejectMoneyRequest: jest.fn(),
    prepareRejectMoneyRequestData: jest.fn(),
}));

const mockWrite = jest.mocked(write);
const mockFileDownload = jest.mocked(fileDownload);
const mockRead = jest.mocked(read);

beforeEach(() => jest.clearAllMocks());

function getWriteOptions(): {optimisticData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]} {
    const options = mockWrite.mock.calls.at(-1)?.at(2);
    if (
        !options ||
        typeof options !== 'object' ||
        !('optimisticData' in options) ||
        !Array.isArray(options.optimisticData) ||
        !('failureData' in options) ||
        !Array.isArray(options.failureData)
    ) {
        throw new Error('write was not called with optimistic options');
    }
    return {optimisticData: options.optimisticData, failureData: options.failureData};
}

function getReadOptions(): {optimisticData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]} {
    const options = mockRead.mock.calls.at(-1)?.at(2);
    if (
        !options ||
        typeof options !== 'object' ||
        !('optimisticData' in options) ||
        !Array.isArray(options.optimisticData) ||
        !('failureData' in options) ||
        !Array.isArray(options.failureData)
    ) {
        throw new Error('read was not called with optimistic options');
    }
    return {optimisticData: options.optimisticData, failureData: options.failureData};
}

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('');
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }

    return queryJSON;
}

describe('openSearchPage', () => {
    it('does not persist a completion flag that a failed request could strand', () => {
        openSearch({includePartiallySetupBankAccounts: false, includeLockedBankAccounts: false});

        expect(mockRead).toHaveBeenCalledWith(READ_COMMANDS.OPEN_SEARCH_PAGE, {
            includePartiallySetupBankAccounts: false,
            includeLockedBankAccounts: false,
        });
    });
});

describe('queueExportSearchItemsToCSV', () => {
    it('sets optimistic Onyx data with state preparing and returns exportID', () => {
        const exportID = queueExportSearchItemsToCSV({
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: [],
            isBasicExport: true,
            exportColumnLabels: '{}',
            exportName: 'Basic export',
        });

        expect(typeof exportID).toBe('string');
        expect(exportID.length).toBeGreaterThan(0);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV,
            expect.objectContaining({exportID}),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({optimisticData: expect.any(Array), failureData: expect.any(Array)}),
        );

        const {optimisticData, failureData} = getWriteOptions();
        const exportDownloadUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(exportDownloadUpdate).toBeDefined();
        expect(exportDownloadUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});

        const failureUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(failureUpdate).toBeDefined();
        expect(failureUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.FAILED, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});
    });

    it('includes excluded transaction IDs in the queued CSV payload', () => {
        queueExportSearchItemsToCSV({
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: ['tx1'],
            excludedTransactionIDList: ['tx2'],
            isBasicExport: true,
            exportColumnLabels: '{}',
            exportName: 'Basic export',
        });

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV, expect.objectContaining({excludedTransactionIDList: ['tx2']}), expect.any(Object));
    });

    it('does not add an exclusion field when there are no exclusions', () => {
        queueExportSearchItemsToCSV({
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: ['tx1'],
            isBasicExport: true,
            exportColumnLabels: '{}',
            exportName: 'Basic export',
        });

        expect(mockWrite.mock.calls.at(-1)?.at(1)).not.toHaveProperty('excludedTransactionIDList');
    });
});

describe('exportSearchItemsToCSV', () => {
    beforeEach(() => jest.clearAllMocks());

    it('includes excluded transaction IDs in the direct CSV form payload', () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');

        exportSearchItemsToCSV(
            {
                jsonQuery: '{}',
                reportIDList: [],
                transactionIDList: ['tx1'],
                excludedTransactionIDList: ['tx2'],
                isBasicExport: true,
                exportColumnLabels: '{}',
                exportName: 'Basic export',
            },
            jest.fn(),
            translateForTest,
            undefined,
        );

        expect(appendSpy).toHaveBeenCalledWith('excludedTransactionIDList', 'tx2');
        expect(mockFileDownload).toHaveBeenCalled();
        appendSpy.mockRestore();
    });

    it('includes the report in reportIDList when all of its transactions are selected', () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        const transaction = {...createRandomTransaction(1), transactionID: 'tx1', reportID: 'report1'};
        const allReportsTransactionsAndViolations: ReportTransactionsAndViolationsDerivedValue = {
            report1: {transactions: {[transaction.transactionID]: transaction}, violations: {}},
        };

        exportSearchItemsToCSV(
            {
                jsonQuery: '{}',
                reportIDList: ['report1'],
                transactionIDList: ['tx1'],
                isBasicExport: true,
                exportColumnLabels: '{}',
                exportName: 'Basic export',
            },
            jest.fn(),
            translateForTest,
            allReportsTransactionsAndViolations,
        );

        expect(appendSpy).toHaveBeenCalledWith('reportIDList', 'report1');
        appendSpy.mockRestore();
    });

    it('excludes the report from reportIDList when one of its transactions is not selected', () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        const includedTransaction = {...createRandomTransaction(1), transactionID: 'tx1', reportID: 'report1'};
        const excludedTransaction = {...createRandomTransaction(2), transactionID: 'tx2', reportID: 'report1'};
        const allReportsTransactionsAndViolations: ReportTransactionsAndViolationsDerivedValue = {
            report1: {
                transactions: {[includedTransaction.transactionID]: includedTransaction, [excludedTransaction.transactionID]: excludedTransaction},
                violations: {},
            },
        };

        exportSearchItemsToCSV(
            {
                jsonQuery: '{}',
                reportIDList: ['report1'],
                transactionIDList: ['tx1'],
                isBasicExport: true,
                exportColumnLabels: '{}',
                exportName: 'Basic export',
            },
            jest.fn(),
            translateForTest,
            allReportsTransactionsAndViolations,
        );

        expect(appendSpy).toHaveBeenCalledWith('reportIDList', '');
        appendSpy.mockRestore();
    });
});

describe('rejectMoneyRequestsOnSearch', () => {
    beforeEach(() => jest.clearAllMocks());

    const reportID = 'report1';
    const chatReportID = 'chat1';
    const baseReport: Report = {...createRandomReport(1), reportID, chatReportID, transactionCount: 2};

    function reject(allReportsTransactionsAndViolations: ReportTransactionsAndViolationsDerivedValue | undefined) {
        return rejectMoneyRequestsOnSearch({
            hash: 123,
            selectedTransactions: {tx1: {reportID}},
            comment: 'rejecting',
            allPolicies: {},
            allReports: {[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: baseReport},
            currentUserAccountIDParam: 1,
            currentUserLogin: 'test@example.com',
            betas: [],
            delegateAccountID: undefined,
            getCurrencyDecimals: jest.fn(() => 2),
            allReportsTransactionsAndViolations,
        });
    }

    it('treats a pending-delete transaction as already gone when checking if all expenses are selected', () => {
        // The report's transactionCount (2) still counts the pending-delete transaction, so without subtracting it
        // the single selected transaction would look like a partial selection instead of the full report.
        const pendingDeleteTransaction = {
            ...createRandomTransaction(2),
            transactionID: 'tx2',
            reportID,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        };
        const allReportsTransactionsAndViolations: ReportTransactionsAndViolationsDerivedValue = {
            [reportID]: {transactions: {[pendingDeleteTransaction.transactionID]: pendingDeleteTransaction}, violations: {}},
        };

        const urlToNavigateBack = reject(allReportsTransactionsAndViolations);

        expect(urlToNavigateBack).toBe(ROUTES.REPORT_WITH_ID.getRoute(chatReportID));
    });

    it('does not treat the selection as complete when the pending-delete transaction is unknown', () => {
        const urlToNavigateBack = reject(undefined);

        expect(urlToNavigateBack).toBeUndefined();
    });
});

describe('queueExportSearchWithTemplate', () => {
    it('sets optimistic Onyx data with state preparing and returns exportID when tracking progress', () => {
        const exportID = queueExportSearchWithTemplate(
            {
                templateName: 'Test Template',
                templateType: 'csv',
                jsonQuery: '{}',
                reportIDList: [],
                transactionIDList: [],
                policyID: 'policy123',
                exportName: 'Test Template',
            },
            true,
        );

        expect(typeof exportID).toBe('string');
        expect(exportID.length).toBeGreaterThan(0);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_WITH_TEMPLATE,
            expect.objectContaining({exportID}),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({optimisticData: expect.any(Array), failureData: expect.any(Array)}),
        );

        const {optimisticData, failureData} = getWriteOptions();
        const exportDownloadUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(exportDownloadUpdate).toBeDefined();
        expect(exportDownloadUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});

        const failureUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(failureUpdate).toBeDefined();
        expect(failureUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.FAILED, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});
    });

    it('keeps the legacy request shape (no exportID, no optimistic data) when not tracking progress', () => {
        queueExportSearchWithTemplate({
            templateName: 'Test Template',
            templateType: 'csv',
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: [],
            policyID: 'policy123',
            exportName: 'Test Template',
        });

        const finalParameters = mockWrite.mock.calls.at(-1)?.at(1);
        expect(finalParameters).not.toHaveProperty('exportID');

        const options = mockWrite.mock.calls.at(-1)?.at(2);
        expect(options).toEqual({});
    });
});

describe('getFooterConvertedAmounts', () => {
    beforeEach(() => jest.clearAllMocks());

    it('does not call API.read when the target currency is empty', () => {
        getFooterConvertedAmounts({queryJSON: getQueryJSON(), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES as SearchKey, targetCurrency: ''});

        expect(mockRead).not.toHaveBeenCalled();
    });

    it('requests the whole-search conversion when no transaction or report IDs are given', () => {
        getFooterConvertedAmounts({queryJSON: getQueryJSON(), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES as SearchKey, targetCurrency: 'EUR'});

        expect(mockRead).toHaveBeenCalledWith(
            READ_COMMANDS.GET_TRANSACTIONS_CONVERTED_AMOUNT,
            expect.objectContaining({targetCurrency: 'EUR'}),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({optimisticData: expect.any(Array), failureData: expect.any(Array)}),
        );

        const params = mockRead.mock.calls.at(-1)?.at(1);
        expect(params).not.toHaveProperty('transactionIDList');
        expect(params).not.toHaveProperty('reportIDList');
    });

    it('scopes the request to the given transaction and report IDs', () => {
        getFooterConvertedAmounts({
            queryJSON: getQueryJSON(),
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES as SearchKey,
            targetCurrency: 'EUR',
            transactionIDList: '1,2',
            reportIDList: '3,4',
        });

        expect(mockRead).toHaveBeenCalledWith(READ_COMMANDS.GET_TRANSACTIONS_CONVERTED_AMOUNT, expect.objectContaining({transactionIDList: '1,2', reportIDList: '3,4'}), expect.anything());
    });

    it('optimistically stamps the sources and clears any prior failure for the target currency', () => {
        const sources = {transactions: {transaction1: {USD: 42.5}}};

        getFooterConvertedAmounts({queryJSON: getQueryJSON(), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES as SearchKey, targetCurrency: 'EUR', sources});

        const {optimisticData} = getReadOptions();
        const conversionUpdate = optimisticData.find((update) => update.key === ONYXKEYS.SEARCH_FOOTER_CONVERSION);
        expect(conversionUpdate).toBeDefined();
        expect(conversionUpdate?.value).toEqual({sources, failedCurrencies: {EUR: null}});
    });

    it('marks the target currency as failed on failureData', () => {
        getFooterConvertedAmounts({queryJSON: getQueryJSON(), searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES as SearchKey, targetCurrency: 'EUR'});

        const {failureData} = getReadOptions();
        const conversionUpdate = failureData.find((update) => update.key === ONYXKEYS.SEARCH_FOOTER_CONVERSION);
        expect(conversionUpdate).toBeDefined();
        expect(conversionUpdate?.value).toEqual({failedCurrencies: {EUR: true}});
    });
});

describe('getExportTemplates', () => {
    const translateForTemplates = translateLocal;
    const localeCompare = (first: string, second: string) => first.localeCompare(second);
    const makeTemplate = (name: string): ExportTemplate => ({name, templateName: name, type: '', policyID: undefined, description: ''});
    const makePolicyWithOutputCurrency = (outputCurrency: string): Policy => ({...createRandomPolicy(1), outputCurrency});

    it('returns the custom templates and the default templates as separate groups, each sorted alphabetically', () => {
        const integrationsExportTemplates: ExportTemplate[] = [makeTemplate('Zebra integration'), makeTemplate('Apple integration')];
        const csvExportLayouts: Record<string, ExportTemplate> = {
            mango: makeTemplate('Mango layout'),
            banana: makeTemplate('Banana layout'),
        };

        const {customTemplates, defaultTemplates} = getExportTemplates(integrationsExportTemplates, csvExportLayouts, translateForTemplates, localeCompare);

        // Custom group (custom integrations + in-app templates) is sorted alphabetically
        expect(customTemplates.map((template) => template.name)).toEqual(['Apple integration', 'Banana layout', 'Mango layout', 'Zebra integration']);

        // Default group (expense/report level) is sorted alphabetically
        expect(defaultTemplates.map((template) => template.name)).toEqual([translateForTemplates('export.expenseLevelExport'), translateForTemplates('export.reportLevelExport')]);
    });

    it('excludes the report level export template when includeReportLevelExport is false', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare, undefined, false);
        const templateNames = defaultTemplates.map((template) => template.templateName);

        expect(templateNames).toContain(CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT);
        expect(templateNames).not.toContain(CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT);
    });

    it('excludes the basic export template by default', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare);
        const templateNames = defaultTemplates.map((template) => template.templateName);

        expect(templateNames).not.toContain(CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV);
    });

    it('includes the basic export template in the default group (sorted alphabetically) when includeBasicExport is true', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare, undefined, true, true);
        const names = defaultTemplates.map((template) => template.name);

        // Basic export is sorted alphabetically alongside the other default templates, not pinned to the bottom
        expect(names).toEqual(
            [translateForTemplates('export.expenseLevelExport'), translateForTemplates('export.reportLevelExport'), translateForTemplates('export.basicExport')].sort(localeCompare),
        );
    });

    it('includes the Canadian Multiple Tax Export template when the policy outputs in CAD', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare, makePolicyWithOutputCurrency(CONST.CURRENCY.CAD));

        expect(defaultTemplates.map((template) => template.templateName)).toContain(CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT);
    });

    it('excludes the Canadian Multiple Tax Export template when the policy outputs in another currency', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare, makePolicyWithOutputCurrency(CONST.CURRENCY.USD));

        expect(defaultTemplates.map((template) => template.templateName)).not.toContain(CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT);
    });

    it('includes the Canadian Multiple Tax Export template when includeMultipleTaxExport is true without a policy', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare, undefined, true, false, true);

        expect(defaultTemplates.map((template) => template.templateName)).toContain(CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT);
    });

    it('excludes the Canadian Multiple Tax Export template when includeMultipleTaxExport is false for a CAD policy', () => {
        const {defaultTemplates} = getExportTemplates([], {}, translateForTemplates, localeCompare, makePolicyWithOutputCurrency(CONST.CURRENCY.CAD), true, false, false);

        expect(defaultTemplates.map((template) => template.templateName)).not.toContain(CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT);
    });
});

describe('getChatReportWithFallback', () => {
    const loadedChatReport = {reportID: 'chat1', policyID: 'policyA', type: CONST.REPORT.TYPE.CHAT} as Report;

    it('returns the loaded chat report when it is available', () => {
        expect(getChatReportWithFallback(loadedChatReport, 'chat2', 'policyB')).toEqual({chatReport: loadedChatReport, isFallbackChatReport: false});
    });

    it('builds a fallback chat report from the known IDs when the chat is not loaded', () => {
        expect(getChatReportWithFallback(undefined, 'chat2', 'policyB')).toEqual({chatReport: {reportID: 'chat2', policyID: 'policyB'}, isFallbackChatReport: true});
    });

    it('returns no chat report when the chat is not loaded and there is no fallback chatReportID', () => {
        expect(getChatReportWithFallback(undefined, undefined, 'policyB')).toEqual({chatReport: undefined, isFallbackChatReport: false});
    });
});
