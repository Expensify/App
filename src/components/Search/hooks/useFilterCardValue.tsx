import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCardDescription} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {filterCardsHiddenFromSearch} from '@src/selectors/Card';

function useFilterCardValue(value: string[]): string {
    const {translate} = useLocalize();
    const [searchCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: filterCardsHiddenFromSearch});

    const cardNames = Object.values(searchCards ?? {})
        .filter((card) => value.includes(card.cardID.toString()))
        .map((card) => getCardDescription(card, translate));

    return cardNames.join(', ');
}

export default useFilterCardValue;
