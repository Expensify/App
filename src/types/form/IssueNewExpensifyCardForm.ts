import type {ValueOf} from 'type-fest';
import type {CardLimitType} from '@src/types/onyx/Card';
import type Form from './Form';

const INPUT_IDS = {
    CARD_TITLE: 'cardTitle',
    LIMIT: 'limit',
    LIMIT_TYPE: 'limitType',
    VALID_FROM: 'validFrom',
    VALID_THRU: 'validThru',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type IssueNewExpensifyCardForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_TITLE]: string;
        [INPUT_IDS.LIMIT]: string;
        [INPUT_IDS.LIMIT_TYPE]: CardLimitType;
        [INPUT_IDS.VALID_FROM]: string;
        [INPUT_IDS.VALID_THRU]: string;
    }
>;

export type {IssueNewExpensifyCardForm};
export default INPUT_IDS;
