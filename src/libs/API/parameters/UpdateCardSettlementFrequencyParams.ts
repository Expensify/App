import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateCardSettlementFrequencyParams = {
    settlementFrequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
    policyAccountID: number;
};

export default UpdateCardSettlementFrequencyParams;
