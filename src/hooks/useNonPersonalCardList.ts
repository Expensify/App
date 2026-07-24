import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList} from '@src/types/onyx';

import {filterOutPersonalCards} from '@selectors/Card';

import useOnyx from './useOnyx';

function useNonPersonalCardList(): CardList {
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST);

    return filterOutPersonalCards(allCards);
}

export default useNonPersonalCardList;
