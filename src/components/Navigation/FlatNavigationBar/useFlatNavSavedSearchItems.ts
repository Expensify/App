import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import useSavedSearchTitles from '@pages/Search/hooks/useSavedSearchTitles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {accountIDSelector} from '@selectors/Session';

type FlatNavSavedSearchItem = {
    key: string;
    searchKey: ReturnType<typeof savedSearchIDToSearchKey>;
    name: string;
    query: string;
    title: string;
    isDisabled: boolean;
};

/**
 * The "Saved" group's rows, in the order they are shown.
 *
 * The parent row needs the same order as the list below it, so that opening the group lands on the row the user
 * sees first. Resolving a title reads a wide slice of Onyx, which the hook behind it defers.
 */
function useFlatNavSavedSearchItems(): FlatNavSavedSearchItem[] {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const reportAttributes = useReportAttributes();

    const savedSearchTitles = useSavedSearchTitles({
        savedSearches,
        PersonalDetails: personalDetails,
        reports,
        taxRates: getAllTaxRates(allPolicies),
        cardList: mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList),
        cardFeeds: allFeeds,
        policies: allPolicies,
        currentUserAccountID,
        translate,
        formatPhoneNumber,
        feedKeysWithCards,
        reportAttributes,
        bankAccountList,
    });

    return Object.entries(savedSearches ?? {})
        .map(([key, item]) => {
            const searchKey = savedSearchIDToSearchKey(key);
            return {
                key,
                searchKey,
                name: item.name,
                query: getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), item.query),
                title: item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name,
                isDisabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
        })
        .sort((a, b) => localeCompare(a.title, b.title));
}

export default useFlatNavSavedSearchItems;
export type {FlatNavSavedSearchItem};
