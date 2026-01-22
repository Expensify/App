import type {OnyxCollection, OnyxEntry, ResultMetadata} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getCompanyCardFeed, getCompanyFeeds, getPlaidInstitutionId, getSelectedFeed} from '@libs/CardUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList} from '@src/types/onyx';
import type {AssignableCardsList, WorkspaceCardsList} from '@src/types/onyx/Card';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed, CombinedCardFeeds} from './useCardFeeds';
import useCardsList from './useCardsList';
import useOnyx from './useOnyx';

type CardFeedType = ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>;

type UseCompanyCardsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
};

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
        lastSelectedFeedMetadata: ResultMetadata<OnyxEntry<CompanyCardFeedWithDomainID>>;
    };
};

function useCompanyCards({policyID, feedName: feedNameProp}: UseCompanyCardsProps): UsCompanyCardsResult {
    const [lastSelectedFeed, lastSelectedFeedMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [allCardFeeds, allCardFeedsMetadata] = useCardFeeds(policyID);

    const feedName = feedNameProp ?? getSelectedFeed(lastSelectedFeed, allCardFeeds);
    const bankName = feedName ? getCompanyCardFeed(feedName) : undefined;

    const [cardsList, cardListMetadata] = useCardsList(feedName);

    const companyCardFeeds = getCompanyFeeds(allCardFeeds);
    const selectedFeed = feedName && companyCardFeeds[feedName];
    const isPlaidCardFeed = !!getPlaidInstitutionId(feedName);

    // Direct feeds include Plaid feeds and OAuth feeds (like oauth.chase.com) that have accountList
    const isDirectFeed = isPlaidCardFeed || !!selectedFeed?.accountList;
    let cardFeedType: CardFeedType = 'customFeed';
    if (isDirectFeed) {
        cardFeedType = 'directFeed';
    }

    const {cardList, ...assignedCards} = cardsList ?? {};
    const cardNames = cardFeedType === 'directFeed' ? (selectedFeed?.accountList ?? []) : Object.keys(cardList ?? {});

    const onyxMetadata = {
        cardListMetadata,
        allCardFeedsMetadata,
        lastSelectedFeedMetadata,
    };

    if (!policyID) {
        return {onyxMetadata};
    }

    return {allCardFeeds, feedName, companyCardFeeds, cardList, assignedCards, cardNames, selectedFeed, bankName, cardFeedType, onyxMetadata};
}

export default useCompanyCards;
