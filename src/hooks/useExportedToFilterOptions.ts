import {useSearchStateContext} from '@components/Search/SearchContext';
import {getStandardExportTemplateDisplayName} from '@libs/AccountingUtils';
import {getExportTemplates} from '@libs/actions/Search';
import {getConnectedIntegrationNamesForPolicies} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate} from '@src/types/onyx';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseExportedToFilterDataResult = {
    exportedToFilterOptions: string[];
    combinedUniqueExportTemplates: ExportTemplate[];
    connectedIntegrationNames: Set<string>;
};

/**
 * Hook that prepares all data needed for the exported to search filter.
 * It collects export templates and all connected integrations to build the filter options.
 * When currentSearchQueryJSON has policyID, options are scoped to those workspaces so form hydration and autocomplete stay consistent.
 */
export default function useExportedToFilterOptions(): UseExportedToFilterDataResult {
    const {currentSearchQueryJSON} = useSearchStateContext();
    const policyIDs = currentSearchQueryJSON?.policyID;

    const {translate, localeCompare} = useLocalize();
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

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

    const standardExportTemplates: string[] = [];
    const customExportTemplates: string[] = [];
    for (const template of combinedUniqueExportTemplates) {
        const displayName = getStandardExportTemplateDisplayName(template.templateName);
        const isStandardTemplate = displayName !== template.templateName;

        if (isStandardTemplate) {
            standardExportTemplates.push(displayName);
        } else {
            customExportTemplates.push(template.name ?? template.templateName);
        }
    }

    customExportTemplates.sort((a, b) => localeCompare(a, b));

    const connectedIntegrationNames = policyIDs && policyIDs.length === 0 ? new Set<string>() : getConnectedIntegrationNamesForPolicies(policies, policyIDs);

    const displayNameToConnectionName = new Map<string, string>(
        Object.entries(CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY).map(([connectionName, displayName]) => [displayName, connectionName]),
    );

    const connectedIntegrationDisplayNames = CONST.POLICY.CONNECTIONS.EXPORTED_TO_INTEGRATION_DISPLAY_NAMES.filter((displayName) => {
        const connectionName = displayNameToConnectionName.get(displayName);
        return connectionName && connectedIntegrationNames.has(connectionName);
    });

    const exportedToFilterOptions = [...connectedIntegrationDisplayNames, ...customExportTemplates, ...standardExportTemplates];

    return {
        exportedToFilterOptions,
        combinedUniqueExportTemplates,
        connectedIntegrationNames,
    };
}
