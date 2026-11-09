import type {PolicyCategories} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

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

export default policyCategoriesVisibilitySelector;
