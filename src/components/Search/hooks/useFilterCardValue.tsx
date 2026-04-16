import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {createCardFeedKey, getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {getCardDescription} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterCardValue(): string {
    const {translate} = useLocalize();
    const {searchCards} = useAdvancedSearchFilters();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    const cardIdsFilter = searchAdvancedFiltersForm?.[CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID] ?? [];
    const feedFilter = searchAdvancedFiltersForm?.[CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED] ?? [];

    const cardNames = Object.values(searchCards ?? {})
        .filter((card) => cardIdsFilter.includes(card.cardID.toString()) && !feedFilter.includes(createCardFeedKey(card.fundID, card.bank)))
        .map((card) => getCardDescription(card, translate));

    const feedAutoCompleteList = Object.values(getCardFeedsForDisplay(allFeeds, {}, translate, feedKeysWithCards));
    const filteredFeeds = feedAutoCompleteList.filter((feed) => feedFilter.includes(feed.id)).map((feed) => feed.name);

    return [...filteredFeeds, ...cardNames].join(', ');
}

export default useFilterCardValue;
