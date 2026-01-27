import type {OnyxCollection, OnyxEntry, ResultMetadata} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getCompanyCardFeed, getCompanyFeeds, getPlaidInstitutionId, getSelectedFeed} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList} from '@src/types/onyx';
import type {AssignableCardsList, WorkspaceCardsList} from '@src/types/onyx/Card';
import type {CombinedCardFeeds, CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed} from './useCardFeeds';
import useCardsList from './useCardsList';
import useOnyx from './useOnyx';

type CardFeedType = ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>;

type UseCompanyCardsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
};

type UseCompanyCardsResult = Partial<{
    cardFeedType: CardFeedType;
    bankName: CompanyCardFeedWithNumber;
    feedName: CompanyCardFeedWithDomainID;
    cardList: AssignableCardsList;
    assignedCards: CardList;
    cardNames: string[];
    allCardFeeds: CombinedCardFeeds;
    companyCardFeeds: CompanyFeeds;
    selectedFeed: CombinedCardFeed;
}> & {
    isInitiallyLoadingFeeds: boolean;
    isNoFeed: boolean;
    isFeedPending: boolean;
    isFeedAdded: boolean;

    onyxMetadata: {
        cardListMetadata: ResultMetadata<WorkspaceCardsList>;
        allCardFeedsMetadata: ResultMetadata<OnyxCollection<CardFeeds>>;
        lastSelectedFeedMetadata: ResultMetadata<OnyxEntry<CompanyCardFeedWithDomainID>>;
    };
};

function useCompanyCards({policyID, feedName: feedNameProp}: UseCompanyCardsProps): UseCompanyCardsResult {
    // If an empty string is passed, we need to use an invalid key to avoid fetching the whole collection.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const policyIDKey = policyID || CONST.DEFAULT_MISSING_ID;

    const [lastSelectedFeed, lastSelectedFeedMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyIDKey}`, {canBeMissing: true});
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

    const isInitiallyLoadingFeeds = isLoadingOnyxValue(allCardFeedsMetadata);
    const isNoFeed = !selectedFeed && !isInitiallyLoadingFeeds;
    const isFeedPending = !!selectedFeed?.pending;
    const isFeedAdded = !isLoadingOnyxValue(allCardFeedsMetadata) && !isFeedPending && !isNoFeed;

    if (!policyID) {
        return {onyxMetadata, isInitiallyLoadingFeeds, isNoFeed, isFeedPending, isFeedAdded};
    }

    return {
        allCardFeeds,
        feedName,
        companyCardFeeds,
        cardList,
        assignedCards,
        cardNames,
        selectedFeed,
        bankName,
        cardFeedType,
        onyxMetadata,
        isInitiallyLoadingFeeds,
        isNoFeed,
        isFeedPending,
        isFeedAdded,
    };
}

export default useCompanyCards;
export type {UseCompanyCardsResult};
