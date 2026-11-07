import {renderHook} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import useExportedToFilterOptions, {exportedToPoliciesSelector} from '@hooks/useExportedToFilterOptions';

import {isAdminOfCardEnabledPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate, Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockGetExportTemplates = jest.fn<unknown, unknown[]>();
let mockCurrentSearchQueryJSON: SearchQueryJSON | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchQueryJSON: mockCurrentSearchQueryJSON}),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: (...args: unknown[]) => mockGetExportTemplates(...args),
}));

/** Builds a policy with a verified connection so getConnectedIntegrationNamesForPolicies detects it. */
function buildPolicyWithConnection(policyID: string, connectionName: ConnectionName) {
    return {id: policyID, connections: {[connectionName]: {lastSync: {isConnected: true}}}} as const;
}

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
        mockCurrentSearchQueryJSON = undefined;
        mockGetExportTemplates.mockReturnValue({customTemplates: [], defaultTemplates: []});
    });

    it('returns empty options and templates when no policies and no export templates', () => {
        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toEqual([]);
        expect(result.current.connectedIntegrationNames).toEqual(new Set());
    });

    it('returns empty options and templates when Onyx state is undefined', () => {
        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toEqual([]);
        expect(result.current.connectedIntegrationNames).toEqual(new Set());
    });

    it('includes connected integration display name in options when policy has connection', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPolicyWithConnection('1', CONST.POLICY.CONNECTIONS.NAME.QBO));

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toContain(quickBooksDisplayName);
        expect(result.current.connectedIntegrationNames).toContain(CONST.POLICY.CONNECTIONS.NAME.QBO);
    });

    it('includes integration custom template name from options when getExportTemplates returns integration template', () => {
        const customName = 'Export Layout';
        mockGetExportTemplates.mockReturnValue({
            customTemplates: [createMock<ExportTemplate>({templateName: customName, name: customName, type: CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS})],
            defaultTemplates: [],
        });

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toContain(customName);
    });

    it('builds templates once without in-app layouts, regardless of how many policies exist', async () => {
        // Given several policies with in-app export layouts, which can't be identified in the exported-to filter
        const exportLayouts = {layout: {name: 'Custom Export Format from OD'}};
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {id: '1', exportLayouts},
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {id: '2', exportLayouts},
        });

        // When the hook builds the filter options
        renderHook(() => useExportedToFilterOptions());

        // Then getExportTemplates is called once with no account layouts and no policy, so no in-app templates are normalized
        expect(mockGetExportTemplates).toHaveBeenCalledTimes(1);
        expect(mockGetExportTemplates.mock.calls.at(0)?.at(1)).toEqual({});
        expect(mockGetExportTemplates.mock.calls.at(0)?.at(4)).toBeUndefined();
    });

    it('includes the multiple tax export when any policy outputs in CAD', async () => {
        // Given one USD and one CAD policy
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: {id: '1', outputCurrency: CONST.CURRENCY.USD},
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: {id: '2', outputCurrency: CONST.CURRENCY.CAD},
        });

        // When the hook builds the filter options
        renderHook(() => useExportedToFilterOptions());

        // Then the multiple tax export flag is on, matching the union of the per-policy templates
        expect(mockGetExportTemplates.mock.calls.at(0)?.at(7)).toBe(true);
    });

    it.each([
        [['usd'], false, false],
        [['cad'], true, false],
        [['usd', 'cad'], true, false],
        [undefined, true, false],
        [['cad'], false, true],
    ])('uses workspace override %s instead of the submitted search', async (value, shouldIncludeMultipleTaxExport, isNegated) => {
        // Given a submitted CAD search, plus separate USD and CAD workspace connections
        mockCurrentSearchQueryJSON = createMock<SearchQueryJSON>({
            flatFilters: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'cad'}]}],
        });
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
            [`${ONYXKEYS.COLLECTION.POLICY}usd`]: {...buildPolicyWithConnection('usd', CONST.POLICY.CONNECTIONS.NAME.QBO), outputCurrency: CONST.CURRENCY.USD},
            [`${ONYXKEYS.COLLECTION.POLICY}cad`]: {...buildPolicyWithConnection('cad', CONST.POLICY.CONNECTIONS.NAME.XERO), outputCurrency: CONST.CURRENCY.CAD},
        });
        mockGetExportTemplates.mockImplementation((...args) => ({
            customTemplates: [],
            defaultTemplates: args.at(7) ? [createMock<ExportTemplate>({templateName: CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT})] : [],
        }));

        // When autocomplete supplies its own workspace scope, even with no workspace selected
        const {result} = renderHook(() => useExportedToFilterOptions({value, isNegated}));

        // Then both the CAD template and accounting integrations follow the override
        expect(result.current.exportedToFilterOptions.includes(CONST.REPORT.EXPORT_OPTION_LABELS.MULTIPLE_TAX_EXPORT)).toBe(shouldIncludeMultipleTaxExport);
        expect(result.current.connectedIntegrationNames.has(CONST.POLICY.CONNECTIONS.NAME.QBO)).toBe(!value || value.includes('usd') !== isNegated);
        expect(result.current.connectedIntegrationNames.has(CONST.POLICY.CONNECTIONS.NAME.XERO)).toBe(!value || value.includes('cad') !== isNegated);
    });

    it('keeps the submitted workspace scope when no override is provided', async () => {
        // Given a submitted USD search and a separate CAD workspace
        mockCurrentSearchQueryJSON = createMock<SearchQueryJSON>({
            flatFilters: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'usd'}]}],
        });
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
            [`${ONYXKEYS.COLLECTION.POLICY}usd`]: {id: 'usd', outputCurrency: CONST.CURRENCY.USD},
            [`${ONYXKEYS.COLLECTION.POLICY}cad`]: {id: 'cad', outputCurrency: CONST.CURRENCY.CAD},
        });

        // When a non-autocomplete consumer does not supply an override
        renderHook(() => useExportedToFilterOptions());

        // Then the submitted USD scope still excludes the CAD-only template
        expect(mockGetExportTemplates.mock.calls.at(0)?.at(7)).toBe(false);
    });

    it('excludes templates whose templateName matches integration connection key', () => {
        const templateName = CONST.POLICY.CONNECTIONS.NAME.QBO;
        const templateDisplayName = 'QBO Custom Template';
        mockGetExportTemplates.mockReturnValue({
            customTemplates: [createMock<ExportTemplate>({templateName, name: templateDisplayName, type: CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS})],
            defaultTemplates: [],
        });

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).not.toContain(templateDisplayName);
    });

    it('includes standard export label in options when getExportTemplates returns standard template', () => {
        mockGetExportTemplates.mockReturnValue({
            customTemplates: [],
            defaultTemplates: [createMock<ExportTemplate>({templateName: CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT, name: expenseLevelLabel})],
        });

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.exportedToFilterOptions).toContain(expenseLevelLabel);
    });

    it('returns connectedIntegrationNames from getConnectedIntegrationNamesForPolicies', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPolicyWithConnection('1', CONST.POLICY.CONNECTIONS.NAME.XERO));

        const {result} = renderHook(() => useExportedToFilterOptions());

        expect(result.current.connectedIntegrationNames).toEqual(new Set([CONST.POLICY.CONNECTIONS.NAME.XERO]));
    });

    it('keeps a card enabled admin policy eligible for the reconciliation template after the selector trims it', () => {
        const policy = createMock<Policy>({id: '1', role: CONST.POLICY.ROLE.ADMIN, areCompanyCardsEnabled: true});

        const trimmedPolicy = exportedToPoliciesSelector({[`${ONYXKEYS.COLLECTION.POLICY}1`]: policy})?.[`${ONYXKEYS.COLLECTION.POLICY}1`];

        expect(isAdminOfCardEnabledPolicy(trimmedPolicy)).toBe(true);
    });

    it('includes the reconciliation template when the user is a card admin of a card enabled policy', async () => {
        // Given a card enabled policy where the user is a card admin
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {id: '1', role: CONST.POLICY.ROLE.CARD_ADMIN, areExpensifyCardsEnabled: true});

        // When the hook builds the filter options
        renderHook(() => useExportedToFilterOptions());

        // Then the reconciliation flag is on, since the selector keeps the role and card product fields
        expect(mockGetExportTemplates.mock.calls.at(0)?.at(8)).toBe(true);
    });

    it('returns the same options array when it re-renders with unchanged data', async () => {
        // Given a connected policy, so the options include an integration label next to the export templates
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPolicyWithConnection('1', CONST.POLICY.CONNECTIONS.NAME.QBO));
        const {result, rerender} = renderHook(() => useExportedToFilterOptions());
        const firstOptions = result.current.exportedToFilterOptions;

        // When the hook re-renders without a data change, as it does on every keystroke in the Search input
        rerender({});

        // Then it returns the same array, so the Search input keeps its markdown parser instead of registering a new one
        expect(result.current.exportedToFilterOptions).toBe(firstOptions);
    });
});
