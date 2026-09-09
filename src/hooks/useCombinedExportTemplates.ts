import {getExportTemplates} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate, Policy} from '@src/types/onyx';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type CombinedExportTemplates = {
    /** Deduplicated custom templates (custom integrations + account/policy in-app templates), sorted alphabetically */
    customTemplates: ExportTemplate[];
    /** Deduplicated default templates (expense/report level, and the basic export), sorted alphabetically */
    defaultTemplates: ExportTemplate[];
    /** The custom and default templates concatenated, with the group ordering and per-group sorting preserved */
    combinedExportTemplates: ExportTemplate[];
};

/**
 * Deduplicates templates by their templateName, keeping the first occurrence, then re-sorts alphabetically by name.
 * Deduplicating per group (rather than across the whole list) keeps each group's alphabetical ordering intact after
 * concatenating templates from the account and every policy.
 */
function deduplicateAndSortGroup(templates: ExportTemplate[], localeCompare: (a: string, b: string) => number): ExportTemplate[] {
    const templatesByName = new Map<string, ExportTemplate>();
    for (const template of templates) {
        if (templatesByName.has(template.templateName)) {
            continue;
        }
        templatesByName.set(template.templateName, template);
    }
    return Array.from(templatesByName.values()).sort((first, second) => localeCompare(first.name, second.name));
}

/**
 * Collects the export templates available to the user from their account and the given policies, pre-grouped into
 * custom and default templates. Each group is deduplicated by templateName and sorted alphabetically. Both the
 * exported-to search filter and the export selector rely on the same grouping, so the logic lives here to avoid divergence.
 */
export default function useCombinedExportTemplates(policiesToLoadTemplatesFrom: Policy[]): CombinedExportTemplates {
    const {translate, localeCompare} = useLocalize();
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);

    const accountTemplateGroups = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, localeCompare, undefined, true);
    const policyTemplateGroups = policiesToLoadTemplatesFrom.map((policy) => getExportTemplates([], {}, translate, localeCompare, policy, false));

    const customTemplates = deduplicateAndSortGroup([accountTemplateGroups.customTemplates, ...policyTemplateGroups.map((group) => group.customTemplates)].flat(), localeCompare);
    const defaultTemplates = deduplicateAndSortGroup([accountTemplateGroups.defaultTemplates, ...policyTemplateGroups.map((group) => group.defaultTemplates)].flat(), localeCompare);

    return {
        customTemplates,
        defaultTemplates,
        combinedExportTemplates: [...customTemplates, ...defaultTemplates],
    };
}

export type {CombinedExportTemplates};
