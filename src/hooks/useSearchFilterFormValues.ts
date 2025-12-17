import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {CurrencyList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

const useSearchFilterFormValues = (): Partial<SearchAdvancedFiltersForm> => {
    const personalDetails = usePersonalDetails();
    const {currentSearchQueryJSON} = useSearchContext();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});

    const taxRates = getAllTaxRates(allPolicies);
    const allCards = mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList);

    if (!currentSearchQueryJSON) {
        return {};
    }

    const filterFormValues = buildFilterFormValuesFromQuery(currentSearchQueryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, reports, taxRates);

    return filterFormValues;
};

export default useSearchFilterFormValues;
