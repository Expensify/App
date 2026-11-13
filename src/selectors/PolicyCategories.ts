import {hasAnyCategoryRules} from '@libs/CategoryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/** The IDs of the workspaces whose categories have rules, so each workspace can be checked against its own categories. */
function policyIDsWithCategoryRulesSelector(policyCategories: OnyxCollection<PolicyCategories>): Record<string, true> {
    const policyIDs: Record<string, true> = {};
    for (const [key, categories] of Object.entries(policyCategories ?? {})) {
        if (hasAnyCategoryRules(categories ?? undefined)) {
            policyIDs[key.replace(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, '')] = true;
        }
    }
    return policyIDs;
}

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

export {policyCategoriesVisibilitySelector, policyIDsWithCategoryRulesSelector};
