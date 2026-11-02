import {renderHook} from '@testing-library/react-native';

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
});
