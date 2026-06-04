import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST],
    compute: ([cardList, workspaceCardFeeds]) => {
        return mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, cardList, true);
    },
});
