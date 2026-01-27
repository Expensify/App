import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useCurrencyList from './useCurrencyList';
import useOnyx from './useOnyx';

const useFilterFormValues = (queryJSON?: SearchQueryJSON) => {
    const personalDetails = usePersonalDetails();
    const {currencyList} = useCurrencyList();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: true});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    const taxRates = getAllTaxRates(policies);
    const allCards = mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList);

    const formValues = queryJSON
        ? buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, allReports, taxRates)
        : getEmptyObject<Partial<SearchAdvancedFiltersForm>>();

    return formValues;
};

export default useFilterFormValues;
