import {getExportTemplates} from '@libs/actions/Search';
import {isAdminOfCardEnabledPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExportTemplate, Policy} from '@src/types/onyx';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Collects the export templates that can be filtered on in the exported-to search filter: the account's integration templates
 * and the default templates available across the given policies, custom group first, each group sorted alphabetically.
 * In-app templates are skipped because exports made with them can't be identified by the filter. Both the exported-to
 * autocomplete and the exported-to selector rely on this list, so the logic lives here to avoid divergence.
 */
export default function useCombinedExportTemplates(policiesToLoadTemplatesFrom: Policy[]): ExportTemplate[] {
    const {translate, localeCompare} = useLocalize();
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);

    const {customTemplates, defaultTemplates} = getExportTemplates(
        integrationsExportTemplates ?? [],
        {},
        translate,
        localeCompare,
        undefined,
        true,
        false,
        policiesToLoadTemplatesFrom.some((policy) => policy.outputCurrency === CONST.CURRENCY.CAD),
        policiesToLoadTemplatesFrom.some((policy) => isAdminOfCardEnabledPolicy(policy)),
    );

    return [...customTemplates, ...defaultTemplates];
}
