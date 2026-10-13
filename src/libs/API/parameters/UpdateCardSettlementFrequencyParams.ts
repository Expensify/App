import type {CardProgramKey} from '@libs/CardUtils';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateCardSettlementFrequencyParams = {
    settlementFrequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
    policyAccountID: number;
    feedCountry: CardProgramKey;
};

export default UpdateCardSettlementFrequencyParams;
