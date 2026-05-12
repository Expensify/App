import type {OnyxCollection} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import {getStandardExportTemplateDisplayName} from '@libs/AccountingUtils';
import {getExportTemplates} from '@libs/actions/Search';
import {getConnectedIntegrationNamesForPolicies} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate, Policy} from '@src/types/onyx';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseExportedToFilterDataResult = {
    exportedToFilterOptions: string[];
    combinedUniqueExportTemplates: ExportTemplate[];
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
        result[key] = {id: policy.id, name: policy.name, connections: policy.connections, exportLayouts: policy.exportLayouts} as Policy;
    }
    return result;
}

/**
 * Hook that prepares all data needed for the exported to search filter.
 * It collects standard export templates and all connected integrations to build the filter options.
 * When currentSearchQueryJSON has policyID, options are scoped to those workspaces so form hydration and autocomplete stay consistent.
 */
export default function useExportedToFilterOptions(): UseExportedToFilterDataResult {
    const {currentSearchQueryJSON} = useSearchStateContext();
    const policyIDs = currentSearchQueryJSON?.policyID;

    const {translate} = useLocalize();
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: exportedToPoliciesSelector});

    // When search is scoped to workspaces, use only those policies otherwise use all.
    const policiesToUse = policyIDs !== undefined ? getAllPolicyValues(policyIDs, ONYXKEYS.COLLECTION.POLICY, policies) : Object.values(policies ?? {});
    const policyLevelExportTemplates = policiesToUse.flatMap((policy) => getExportTemplates([], {}, translate, policy, false));
    const accountLevelExportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, undefined, true);
    const combinedExportTemplates = [...accountLevelExportTemplates, ...policyLevelExportTemplates];

    const uniqueExportTemplatesByName = new Map<string, ExportTemplate>();
    for (const template of combinedExportTemplates) {
        if (!uniqueExportTemplatesByName.has(template.templateName)) {
            uniqueExportTemplatesByName.set(template.templateName, template);
        }
    }

    const combinedUniqueExportTemplates = Array.from(uniqueExportTemplatesByName.values());
    const integrationConnectionNamesSet = new Set<string>(CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);

    const standardAndCustomExportTemplates: string[] = [];
    for (const template of combinedUniqueExportTemplates) {
        // Classic export formats map to in-app templates and cannot be identified in exported-to filter.
        if (template.type === CONST.EXPORT_TEMPLATE_TYPES.IN_APP || integrationConnectionNamesSet.has(template.templateName)) {
            continue;
        }

        const standardExportTemplateDisplayName = getStandardExportTemplateDisplayName(template.templateName);
        const filterValue = standardExportTemplateDisplayName !== template.templateName ? standardExportTemplateDisplayName : (template.name ?? template.templateName);
        standardAndCustomExportTemplates.push(filterValue);
    }

    const connectedIntegrationNames = policyIDs?.length === 0 ? new Set<string>() : getConnectedIntegrationNamesForPolicies(policies, policyIDs);

    const displayNameToConnectionName = new Map<string, string>(
        Object.entries(CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY).map(([connectionName, displayName]) => [displayName, connectionName]),
    );

    const connectedIntegrationDisplayNames = CONST.POLICY.CONNECTIONS.EXPORTED_TO_INTEGRATION_DISPLAY_NAMES.filter((displayName) => {
        const connectionName = displayNameToConnectionName.get(displayName);
        return connectionName && connectedIntegrationNames.has(connectionName);
    });

    const exportedToFilterOptions = [...new Set([...connectedIntegrationDisplayNames, ...standardAndCustomExportTemplates])];

    return {
        exportedToFilterOptions,
        combinedUniqueExportTemplates,
        connectedIntegrationNames,
    };
}

export {exportedToPoliciesSelector};
