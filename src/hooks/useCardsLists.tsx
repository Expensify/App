import {filterInactiveCards} from '@libs/CardUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {WorkspaceCardsList} from '@src/types/onyx';

import type {OnyxCollection, ResultMetadata} from 'react-native-onyx';

import useOnyx from './useOnyx';

const filterInactiveCardsInCollection = (cardsLists: OnyxCollection<WorkspaceCardsList>) => {
    return Object.fromEntries(
        Object.entries(cardsLists ?? {}).map(([key, cardsList]) => {
            return [key, filterInactiveCards(cardsList)];
        }),
    );
};

/* Custom hook that retrieves all cards lists (excluding inactive cards from each list). */
const useCardsLists = (): [OnyxCollection<WorkspaceCardsList>, ResultMetadata] => {
    const [cardsLists, cardsListsMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {
        selector: filterInactiveCardsInCollection,
    });
    return [cardsLists, cardsListsMetadata];
};

export default useCardsLists;
