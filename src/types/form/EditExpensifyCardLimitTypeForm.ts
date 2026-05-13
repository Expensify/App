import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    LIMIT_TYPE: 'limitType',
    VALID_FROM: 'validFrom',
    VALID_THRU: 'validThru',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditExpensifyCardLimitTypeForm = Form<
    InputID,
    {[INPUT_IDS.LIMIT_TYPE]: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>; [INPUT_IDS.VALID_FROM]: string; [INPUT_IDS.VALID_THRU]: string}
>;

export type {EditExpensifyCardLimitTypeForm};
export default INPUT_IDS;
