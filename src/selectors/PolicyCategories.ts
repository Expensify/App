import {hasAnyCategoryRules} from '@libs/CategoryUtils';

import type {PolicyCategories} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

const hasAnyCategoryRulesSelector = (policyCategories: OnyxCollection<PolicyCategories>) =>
    Object.values(policyCategories ?? {}).some((categories) => hasAnyCategoryRules(categories ?? undefined));

/**
 * Keeps only what category visibility reads (name, enabled and visibleTo), so edits to any other category field don't
 * re-render the screens that count a member's categories.
 */
function policyCategoriesVisibilitySelector(policyCategories: OnyxEntry<PolicyCategories>): PolicyCategories | undefined {
    return (
        policyCategories &&
        Object.fromEntries(
            Object.entries(policyCategories).map(([categoryName, category]) => [categoryName, {name: category.name, enabled: category.enabled, visibleTo: category.visibleTo}]),
        )
    );
}

export {policyCategoriesVisibilitySelector, hasAnyCategoryRulesSelector};
