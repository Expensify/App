import {useSearchQueryContext} from '@components/Search/SearchContext';

import {getExportLabelsForConnection, getStandardExportTemplateDisplayName} from '@libs/AccountingUtils';
import {getExportTemplates} from '@libs/actions/Search';
import {isAdminOfCardEnabledPolicy} from '@libs/PolicyUtils';
import {getAllPolicyValues, getConnectedIntegrationNamesForPolicies, getFilterFromQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseExportedToFilterDataResult = {
    exportedToFilterOptions: string[];
    connectedIntegrationNames: Set<string>;
};

/**
 * Extracts only the fields needed for exported-to filter options from each policy.
 * This prevents re-renders when unrelated policy fields change (e.g., employeeList, taxRates).
 */
function exportedToPoliciesSelector(policies: OnyxCollection<Policy>): OnyxCollection<Policy> {
    if (!policies) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (!policy) {
            continue;
        }
        result[key] = {
            id: policy.id,
            name: policy.name,
            connections: policy.connections,
            outputCurrency: policy.outputCurrency,
            role: policy.role,
            areCompanyCardsEnabled: policy.areCompanyCardsEnabled,
            areExpensifyCardsEnabled: policy.areExpensifyCardsEnabled,
        } as Policy;
    }
    return result;
}

/**
 * Hook that prepares all data needed for the exported to search filter.
 * It collects standard export templates and all connected integrations to build the filter options.
 * When currentSearchQueryJSON has policyID, options are scoped to those workspaces so form hydration and autocomplete stay consistent.
 */
export default function useExportedToFilterOptions(): UseExportedToFilterDataResult {
    const {translate, localeCompare} = useLocalize();
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const policyIDs = getFilterFromQuery(currentSearchQueryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: exportedToPoliciesSelector});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);

    // When search is scoped to workspaces, use only those policies otherwise use all.
    const policiesToUse = getAllPolicyValues(policyIDs, ONYXKEYS.COLLECTION.POLICY, policies);

    // In-app templates can't be identified in the exported-to filter, so skip building them and aggregate the per-policy flags instead
    const {customTemplates, defaultTemplates} = getExportTemplates(
        integrationsExportTemplates ?? [],
        {},
        translate,
        localeCompare,
        undefined,
        true,
        false,
        policiesToUse.some((policy) => policy.outputCurrency === CONST.CURRENCY.CAD),
        policiesToUse.some((policy) => isAdminOfCardEnabledPolicy(policy)),
    );

    const integrationConnectionNamesSet = new Set<string>(CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);

    const standardAndCustomExportTemplates: string[] = [];
    for (const template of [...customTemplates, ...defaultTemplates]) {
        if (integrationConnectionNamesSet.has(template.templateName)) {
            continue;
        }

        const standardExportTemplateDisplayName = getStandardExportTemplateDisplayName(template.templateName);
        const filterValue = standardExportTemplateDisplayName !== template.templateName ? standardExportTemplateDisplayName : (template.name ?? template.templateName);
        standardAndCustomExportTemplates.push(filterValue);
    }

    const connectedIntegrationNames = policyIDs.value?.length === 0 ? new Set<string>() : getConnectedIntegrationNamesForPolicies(policies, policyIDs);

    const connectedIntegrationSearchValues = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.flatMap((connectionName) => {
        if (!connectedIntegrationNames.has(connectionName)) {
            return [];
        }

        return getExportLabelsForConnection(connectionName, policiesToUse);
    });

    const exportedToFilterOptions = [...new Set([...connectedIntegrationSearchValues, ...standardAndCustomExportTemplates])];

    return {
        exportedToFilterOptions,
        connectedIntegrationNames,
    };
}

export {exportedToPoliciesSelector};
