import {getFeedSettingsFromCardFeeds} from '@libs/CardFeedUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {CustomCardFeedData} from '@src/types/onyx/CardFeeds';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * The settings of the company card feed that a card expense was imported from.
 * Returns undefined for cash expenses and for cards whose feed isn't loaded.
 */
function useTransactionCardFeedSettings(transaction: OnyxEntry<Pick<Transaction, 'cardID'>>): CustomCardFeedData | undefined {
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const transactionCard = transaction?.cardID ? nonPersonalAndWorkspaceCards?.[transaction.cardID] : undefined;
    const [cardFeedsForTransactionCard] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${getNonEmptyStringOnyxID(transactionCard?.fundID)}`);
    return getFeedSettingsFromCardFeeds(cardFeedsForTransactionCard, transactionCard);
}

export default useTransactionCardFeedSettings;
