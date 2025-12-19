import type {OnyxCollection, ResultMetadata} from 'react-native-onyx';
import {getCompanyCardFeed, getCompanyFeeds, getPlaidInstitutionId, getSelectedFeed} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList} from '@src/types/onyx';
import type {AssignableCardsList, WorkspaceCardsList} from '@src/types/onyx/Card';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed, CombinedCardFeeds} from './useCardFeeds';
import useCardsList from './useCardsList';
import useOnyx from './useOnyx';

type CardFeedType = 'plaid' | 'commercial';

type UsCompanyCardsResult = Partial<{
    cardFeedType: CardFeedType;
    bankName: CompanyCardFeed;
    feedName: CompanyCardFeedWithDomainID;
    cardList: AssignableCardsList;
    assignedCards: CardList;
    cardNames: string[];
    allCardFeeds: CombinedCardFeeds;
    companyCardFeeds: CompanyFeeds;
    selectedFeed: CombinedCardFeed;
}> & {
    onyxMetadata: {
        cardListMetadata: ResultMetadata<WorkspaceCardsList>;
        allCardFeedsMetadata: ResultMetadata<OnyxCollection<CardFeeds>>;
    };
};

function useCompanyCards(policyID?: string): UsCompanyCardsResult {
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [allCardFeeds, allCardFeedsMetadata] = useCardFeeds(policyID);

    const feedName = getSelectedFeed(lastSelectedFeed, allCardFeeds);
    const bankName = feedName ? getCompanyCardFeed(feedName) : undefined;

    const [cardsList, cardListMetadata] = useCardsList(feedName);

    const companyCardFeeds = getCompanyFeeds(allCardFeeds);
    const selectedFeed = feedName && companyCardFeeds[feedName];
    const isPlaidCardFeed = !!getPlaidInstitutionId(feedName);

    let cardFeedType: CardFeedType = 'commercial';
    if (isPlaidCardFeed) {
        cardFeedType = 'plaid';
    }

    const {cardList, ...assignedCards} = cardsList ?? {};
    const cardNames = cardFeedType === 'plaid' ? (selectedFeed?.accountList ?? []) : Object.keys(cardList ?? {});

    const onyxMetadata = {
        cardListMetadata,
        allCardFeedsMetadata,
    };

    if (!policyID) {
        return {onyxMetadata};
    }

    return {allCardFeeds, feedName, companyCardFeeds, cardList, assignedCards, cardNames, selectedFeed, bankName, cardFeedType, onyxMetadata};
}

export default useCompanyCards;
