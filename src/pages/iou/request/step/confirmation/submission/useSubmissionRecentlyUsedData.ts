import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

function useSubmissionRecentlyUsedData(policyID: string | undefined) {
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const [policyRecentlyUsedCurrenciesOnyx] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);

    return {
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrenciesOnyx ?? [],
    };
}

export default useSubmissionRecentlyUsedData;
