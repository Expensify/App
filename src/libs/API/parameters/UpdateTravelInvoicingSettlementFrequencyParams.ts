import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateTravelInvoicingSettlementFrequencyParams = {
    domainAccountID: number;
    settlementFrequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
};

export default UpdateTravelInvoicingSettlementFrequencyParams;
