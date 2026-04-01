import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {createCardFeedKey, getCardFeedKey, getCardFeedNamesWithType, getWorkspaceCardFeedKey} from '@libs/CardFeedUtils';
import {getCardDescription} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceCardsList} from '@src/types/onyx';

function useFilterCardValue(): string {
    const {translate} = useLocalize();
    const {policies, searchCards} = useAdvancedSearchFilters();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const cardIdsFilter = searchAdvancedFiltersForm?.[CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID] ?? [];
    const feedFilter = searchAdvancedFiltersForm?.[CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED] ?? [];
    const workspaceCardFeeds = Object.entries(searchCards ?? {}).reduce<Record<string, WorkspaceCardsList>>((acc, [cardID, card]) => {
        const feedKey = `${createCardFeedKey(card.fundID, card.bank)}`;
        const workspaceFeedKey = getWorkspaceCardFeedKey(feedKey);
        if (!acc[workspaceFeedKey]) {
            acc[workspaceFeedKey] = {};
        }

        acc[workspaceFeedKey][cardID] = card;
        return acc;
    }, {});

    const cardFeedNamesWithType = getCardFeedNamesWithType({
        workspaceCardFeeds,
        policies,
        translate,
    });

    const cardNames = Object.values(searchCards ?? {})
        .filter((card) => cardIdsFilter.includes(card.cardID.toString()) && !feedFilter.includes(createCardFeedKey(card.fundID, card.bank)))
        .map((card) => getCardDescription(card, translate));

    const feedNames = Object.keys(cardFeedNamesWithType)
        .filter((workspaceCardFeedKey) => {
            const feedKey = getCardFeedKey(workspaceCardFeeds, workspaceCardFeedKey);
            return !!feedKey && feedFilter.includes(feedKey);
        })
        .map((cardFeedKey) => cardFeedNamesWithType[cardFeedKey].name);

    return [...feedNames, ...cardNames].join(', ');
}

export default useFilterCardValue;
