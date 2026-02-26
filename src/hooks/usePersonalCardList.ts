import {filterOutNonPersonalCards} from '@selectors/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList} from '@src/types/onyx';
import useOnyx from './useOnyx';

function usePersonalCardList(): CardList {
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST);

    return filterOutNonPersonalCards(allCards);
}

export default usePersonalCardList;
