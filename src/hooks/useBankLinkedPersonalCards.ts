import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList} from '@src/types/onyx';

import {getBankLinkedPersonalCards} from '@selectors/Card';

import useOnyx from './useOnyx';

function useBankLinkedPersonalCards(): CardList {
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST);

    return getBankLinkedPersonalCards(allCards);
}

export default useBankLinkedPersonalCards;
