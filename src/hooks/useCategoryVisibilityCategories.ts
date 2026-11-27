/**
 * The enabled categories a category visibility page lists, with the workspace's complete category list loaded first.
 * It reports loading only until that list first arrives. A later read, such as the one on reconnect, keeps the list on
 * screen, since swapping it for a spinner would drop the checks the admin hasn't saved yet.
 */
import {useState} from 'react';

import useLoadPolicyCategories from './useLoadPolicyCategories';
import usePolicyCategoryPickerCategories from './usePolicyCategoryPickerCategories';

function useCategoryVisibilityCategories(policyID: string) {
    const {categories, policyCategories, areCategoriesEnabled, isLoading: isLoadingPickerCategories} = usePolicyCategoryPickerCategories({policyID});
    const {isLoadingCompletePolicyCategories} = useLoadPolicyCategories(policyID);
    const isLoading = isLoadingPickerCategories || isLoadingCompletePolicyCategories;

    const [hasLoaded, setHasLoaded] = useState(!isLoading);
    if (!hasLoaded && !isLoading) {
        setHasLoaded(true);
    }

    return {categories, policyCategories, areCategoriesEnabled, isLoading: !hasLoaded};
}

export default useCategoryVisibilityCategories;
