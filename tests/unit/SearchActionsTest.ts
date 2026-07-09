import {getExportTemplates, queueExportSearchItemsToCSV, queueExportSearchWithTemplate} from '@libs/actions/Search';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate} from '@src/types/onyx';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import {translateLocal} from '../utils/TestHelper';

const EXPENSE_STATUS_ALL = CONST.SEARCH.STATUS.EXPENSE.ALL;

jest.mock('@libs/API');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));

const mockWrite = jest.mocked(write);

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

describe('queueExportSearchItemsToCSV', () => {
    beforeEach(() => jest.clearAllMocks());

    it('sets optimistic Onyx data with state preparing and returns exportID', () => {
        const exportID = queueExportSearchItemsToCSV({
            query: EXPENSE_STATUS_ALL,
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
});

describe('queueExportSearchWithTemplate', () => {
    beforeEach(() => jest.clearAllMocks());

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

describe('getExportTemplates', () => {
    const translate = translateLocal;
    const localeCompare = (first: string, second: string) => first.localeCompare(second);
    const makeTemplate = (name: string): ExportTemplate => ({name, templateName: name, type: '', policyID: undefined, description: ''});

    it('returns the custom/IS templates first (sorted alphabetically), followed by the default templates (sorted alphabetically)', () => {
        const integrationsExportTemplates: ExportTemplate[] = [makeTemplate('Zebra integration'), makeTemplate('Apple integration')];
        const csvExportLayouts: Record<string, ExportTemplate> = {
            mango: makeTemplate('Mango layout'),
            banana: makeTemplate('Banana layout'),
        };

        const result = getExportTemplates(integrationsExportTemplates, csvExportLayouts, translate, localeCompare);
        const names = result.map((template) => template.name);

        // Custom/IS group is sorted alphabetically and comes first
        const customGroup = names.slice(0, 4);
        expect(customGroup).toEqual(['Apple integration', 'Banana layout', 'Mango layout', 'Zebra integration']);

        // Default group (expense/report level) is sorted alphabetically and comes last
        const defaultGroup = names.slice(4);
        expect(defaultGroup).toEqual([translate('export.expenseLevelExport'), translate('export.reportLevelExport')]);
    });

    it('excludes the report level export template when includeReportLevelExport is false', () => {
        const result = getExportTemplates([], {}, translate, localeCompare, undefined, false);
        const templateNames = result.map((template) => template.templateName);

        expect(templateNames).toContain(CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT);
        expect(templateNames).not.toContain(CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT);
    });

    it('excludes the basic export template by default', () => {
        const result = getExportTemplates([], {}, translate, localeCompare);
        const templateNames = result.map((template) => template.templateName);

        expect(templateNames).not.toContain(CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV);
    });

    it('includes the basic export template in the default group (sorted alphabetically) when includeBasicExport is true', () => {
        const result = getExportTemplates([], {}, translate, localeCompare, undefined, true, true);
        const names = result.map((template) => template.name);

        // Basic export is sorted alphabetically alongside the other default templates, not pinned to the bottom
        expect(names).toEqual([translate('export.expenseLevelExport'), translate('export.reportLevelExport'), translate('export.basicExport')].sort(localeCompare));
    });
});
