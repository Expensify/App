import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateCardSettlementFrequencyParams = {
    settlementFrequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
    workspaceAccountID: number;
};

export default UpdateCardSettlementFrequencyParams;
