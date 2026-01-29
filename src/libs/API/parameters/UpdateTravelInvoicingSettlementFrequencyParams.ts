import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateTravelInvoicingSettlementFrequencyParams = {
    policyID: string;
    workspaceAccountID: number;
    settlementFrequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
};

export default UpdateTravelInvoicingSettlementFrequencyParams;
