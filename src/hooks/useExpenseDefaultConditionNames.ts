import type {ExpenseDefaultConditionNames} from '@libs/MerchantTypeRulesUtils';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useExpenseDefaultCardNames from './useExpenseDefaultCardNames';
import useExpenseDefaultSubmitterNames from './useExpenseDefaultSubmitterNames';

/** The names every condition of an expense default rule reads as, for the places that list a whole rule. */
function useExpenseDefaultConditionNames(policy: OnyxEntry<Policy>, shouldLoadCards = true): ExpenseDefaultConditionNames {
    const submitters = useExpenseDefaultSubmitterNames(policy);
    const {cards, areCardsLoaded} = useExpenseDefaultCardNames(shouldLoadCards);

    return {submitters, cards, areCardsLoaded};
}

export default useExpenseDefaultConditionNames;
