import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useExportedToFilterOptions from '@hooks/useExportedToFilterOptions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockGetExportTemplates = jest.fn();
const mockGetConnectedIntegrationNamesForPolicies = jest.fn(() => new Set<string>());

jest.mock('@libs/actions/Search', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getExportTemplates: (...args: unknown[]) => mockGetExportTemplates(...args),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getConnectedIntegrationNamesForPolicies: () => mockGetConnectedIntegrationNamesForPolicies(),
}));

describe('useExportedToFilterOptions', () => {
    const expenseLevelLabel = CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT;
    const quickBooksDisplayName = 'QuickBooks Online';

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockGetExportTemplates.mockReturnValue([]);
        mockGetConnectedIntegrationNamesForPolicies.mockReturnValue(new Set<string>());
    });

    it('returns empty options and templates when no policies and no export templates', () => {
        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toEqual([]);
        expect(result.current.combinedUniqueExportTemplates).toEqual([]);
        expect(result.current.connectedIntegrationNames).toEqual(new Set());
    });

    it('returns empty options and templates when Onyx state is undefined', () => {
        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toEqual([]);
        expect(result.current.combinedUniqueExportTemplates).toEqual([]);
        expect(result.current.connectedIntegrationNames).toEqual(new Set());
    });

    it('includes connected integration display name in options when policy has connection', () => {
        mockGetConnectedIntegrationNamesForPolicies.mockReturnValue(new Set([CONST.POLICY.CONNECTIONS.NAME.QBO]));

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toContain(quickBooksDisplayName);
        expect(result.current.connectedIntegrationNames).toContain(CONST.POLICY.CONNECTIONS.NAME.QBO);
    });

    it('includes custom template name in options when getExportTemplates returns custom template', () => {
        const customName = 'Export Layout';
        mockGetExportTemplates.mockReturnValue([{templateName: customName, name: customName} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toContain(customName);
    });

    it('includes standard export label in options when getExportTemplates returns standard template', () => {
        mockGetExportTemplates.mockReturnValue([{templateName: CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT, name: expenseLevelLabel} as ExportTemplate]);

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toContain(expenseLevelLabel);
    });

    it('returns one template per templateName in combinedUniqueExportTemplates', async () => {
        const sameName = 'SharedTemplate';
        const template = {templateName: sameName, name: sameName} as ExportTemplate;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {});
        mockGetExportTemplates.mockReturnValueOnce([template]).mockReturnValueOnce([template]);

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.combinedUniqueExportTemplates).toHaveLength(1);
        expect(result.current.combinedUniqueExportTemplates.at(0)?.templateName).toBe(sameName);
    });

    it('returns connectedIntegrationNames from getConnectedIntegrationNamesForPolicies', () => {
        const connectedSet = new Set([CONST.POLICY.CONNECTIONS.NAME.XERO]);
        mockGetConnectedIntegrationNamesForPolicies.mockReturnValue(connectedSet);

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.connectedIntegrationNames).toBe(connectedSet);
    });
});
