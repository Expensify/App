import {filterPersonalCards, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList} from '@src/types/onyx';

const personalAndWorkspaceCardListConfig = createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST],
    compute: ([cardList, workspaceCardFeeds], {areAllConnectionsSet, currentValue}) => {
        if (!areAllConnectionsSet) {
            return currentValue ?? (CONST.EMPTY_OBJECT as CardList);
        }

        const personalCards = filterPersonalCards(cardList);

        return mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, personalCards);
    },
});

export default personalAndWorkspaceCardListConfig;
