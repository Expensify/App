import type {OnyxCollection, OnyxEntry, ResultMetadata} from 'react-native-onyx';
import {getCompanyCardFeed, getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList} from '@src/types/onyx';
import type {AssignableCardsList, WorkspaceCardsList} from '@src/types/onyx/Card';
import type {CardFeedsStatusByDomainID, CombinedCardFeeds, CompanyCardFeed, CompanyCardFeedWithDomainID, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed} from './useCardFeeds';
import useCardsList from './useCardsList';
import useOnyx from './useOnyx';

type UseCompanyCardsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
};

type UseCompanyCardsResult = Partial<{
    bankName: CompanyCardFeed;
    feedName: CompanyCardFeedWithDomainID;
    cardList: AssignableCardsList;
    assignedCards: CardList;
    cardNamesToEncryptedCardNumber: Record<string, string>;
    workspaceCardFeedsStatus: CardFeedsStatusByDomainID;
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
    const [allCardFeeds, allCardFeedsMetadata, , workspaceCardFeedsStatus] = useCardFeeds(policyID);

    const feedName = feedNameProp ?? getSelectedFeed(lastSelectedFeed, allCardFeeds);
    const bankName = feedName ? getCompanyCardFeed(feedName) : undefined;

    const [cardsList, cardListMetadata] = useCardsList(feedName);

    const companyCardFeeds = getCompanyFeeds(allCardFeeds);
    const selectedFeed = feedName && companyCardFeeds[feedName];

    const {cardList, ...assignedCards} = cardsList ?? {};
    const cardNamesToEncryptedCardNumber: Record<string, string> = {};

    for (const cardName of selectedFeed?.accountList ?? []) {
        cardNamesToEncryptedCardNumber[cardName] = cardName;
    }
    for (const [cardName, encryptedCardNumber] of Object.entries(cardList ?? {})) {
        cardNamesToEncryptedCardNumber[cardName] = encryptedCardNumber;
    }

    const onyxMetadata = {
        cardListMetadata,
        allCardFeedsMetadata,
        lastSelectedFeedMetadata,
    };

    const isInitiallyLoadingFeeds = isLoadingOnyxValue(allCardFeedsMetadata);
    const isNoFeed = !selectedFeed && !isInitiallyLoadingFeeds;
    const isFeedPending = !!selectedFeed?.pending;
    const isFeedAdded = !isInitiallyLoadingFeeds && !isFeedPending && !isNoFeed;

    if (!policyID) {
        return {onyxMetadata, isInitiallyLoadingFeeds, isNoFeed, isFeedPending, isFeedAdded};
    }

    return {
        allCardFeeds,
        feedName,
        companyCardFeeds,
        cardList,
        assignedCards,
        cardNamesToEncryptedCardNumber,
        workspaceCardFeedsStatus,
        selectedFeed,
        bankName,
        onyxMetadata,
        isInitiallyLoadingFeeds,
        isNoFeed,
        isFeedPending,
        isFeedAdded,
    };
}

export default useCompanyCards;
export type {UseCompanyCardsResult};
