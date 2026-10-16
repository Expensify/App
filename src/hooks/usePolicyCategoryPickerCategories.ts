import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategory} from '@src/types/onyx';

import {useFocusEffect} from '@react-navigation/native';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

type UsePolicyCategoryPickerCategoriesParams = {
    policyID: string;

    /**
     * Whether a category can be offered, beyond being enabled and not pending delete. Keep the current selection
     * eligible, or it drops off the list and can't be deselected.
     */
    isEligible?: (category: PolicyCategory) => boolean;
};

/** The shared half of every rule category picker: fetch, loading state, and the categories it can offer. Items stay
 * per-page, since single and multi select need different shapes. */
function usePolicyCategoryPickerCategories({policyID, isEligible}: UsePolicyCategoryPickerCategoriesParams) {
    const policy = usePolicy(policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const areCategoriesEnabled = !!policy?.areCategoriesEnabled;

    const fetchPolicyCategories = () => {
        if (!areCategoriesEnabled || policyCategories !== undefined) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(() => {
        fetchPolicyCategories();
    });

    // Offline there is nothing to wait for, so show the list rather than a spinner that never resolves.
    const isLoading = areCategoriesEnabled && policyCategories === undefined && !isOffline;

    const categories = Object.values(policyCategories ?? {}).filter((category) => {
        if (!category.enabled) {
            return false;
        }

        // Match the rules table: keep pending-delete categories visible while offline.
        if (!isOffline && category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return false;
        }

        return isEligible ? isEligible(category) : true;
    });

    return {categories, policyCategories, areCategoriesEnabled, isLoading, isOffline};
}

export default usePolicyCategoryPickerCategories;
