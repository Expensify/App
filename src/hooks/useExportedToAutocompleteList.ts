import {useMemo} from 'react';
import {getStandardExportTemplateDisplayName} from '@libs/AccountingUtils';
import {getExportTemplates} from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Hook that returns the list of export template names for the "exported-to:" search autocomplete.
 * Combines predefined integration names EXPORTED_TO_INTEGRATION_DISPLAY_NAMES with custom export template names.
 */
export default function useExportedToAutocompleteList(): string[] {
    const {translate} = useLocalize();
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);

    return useMemo(() => {
        const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, undefined, true);
        const customNames = exportTemplates.flatMap((template) => {
            const templateDisplayName = getStandardExportTemplateDisplayName(template.templateName);
            if (templateDisplayName !== template.templateName) {
                return [templateDisplayName];
            }
            return [template.templateName].filter(Boolean);
        });

        return Array.from(new Set([...CONST.POLICY.CONNECTIONS.EXPORTED_TO_INTEGRATION_DISPLAY_NAMES, ...customNames]));
    }, [integrationsExportTemplates, csvExportLayouts, translate]);
}
