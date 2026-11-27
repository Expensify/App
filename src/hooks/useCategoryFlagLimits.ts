/** Reads the mirrored category limits on screens that can open without visiting Rules. */
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategory} from '@src/types/onyx';

import {createCategoryFlagLimitsSelector} from '@selectors/Rule';

import useOnyx from './useOnyx';
import useRulesPrefetch from './useRulesPrefetch';

function useCategoryFlagLimits(policyID: string, category?: PolicyCategory) {
    const {areRulesLoading: areCategoryFlagLimitsLoading, haveRulesLoaded: haveCategoryFlagLimitsLoaded} = useRulesPrefetch();
    const [categoryFlagLimits] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: createCategoryFlagLimitsSelector(policyID, category)});

    return {categoryFlagLimits, areCategoryFlagLimitsLoading, haveCategoryFlagLimitsLoaded};
}

export default useCategoryFlagLimits;
