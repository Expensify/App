import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';

import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import useDynamicBackPath from './useDynamicBackPath';

/**
 * Back path from a category-scoped rule create page (`<categorySettings>/rules/new/<rule>`) to the
 * Category Settings page the rule was created from.
 *
 * The path is derived from the current URL, so the user stays in the flow they came from
 * (Workspace > Categories or Settings > Categories, which also keeps the inherited `backTo` param).
 *
 * @param ruleCreateSuffix - The dynamic suffix of the rule create page (e.g. `require-fields`).
 * @returns The Category Settings path, or `undefined` when the current URL isn't a category-scoped rule create page.
 */
function useCategoryRuleCreateBackPath(ruleCreateSuffix: DynamicRouteSuffix): Route | undefined {
    const rulesNewPath = useDynamicBackPath(ruleCreateSuffix);
    const rulesNewSuffix = DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_NEW.path;
    const [pathWithoutQuery] = rulesNewPath.split('?');

    if (!pathWithoutQuery?.endsWith(`/${rulesNewSuffix}`)) {
        return undefined;
    }

    return getPathWithoutDynamicSuffix(rulesNewPath, rulesNewSuffix);
}

export default useCategoryRuleCreateBackPath;
