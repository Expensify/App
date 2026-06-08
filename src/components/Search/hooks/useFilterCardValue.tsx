import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useLocalize from '@hooks/useLocalize';
import {getCardDescription} from '@libs/CardUtils';

function useFilterCardValue(value: string[]): string {
    const {translate} = useLocalize();
    const {searchCards} = useAdvancedSearchFilters();

    const cardNames = Object.values(searchCards ?? {})
        .filter((card) => value.includes(card.cardID.toString()))
        .map((card) => getCardDescription(card, translate));

    return cardNames.join(', ');
}

export default useFilterCardValue;
