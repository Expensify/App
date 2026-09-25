import type CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {CardLimitType} from '@src/types/onyx/Card';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    CARD_TITLE: 'cardTitle',
    LIMIT: 'limit',
    LIMIT_TYPE: 'limitType',
    VALID_FROM: 'validFrom',
    VALID_THRU: 'validThru',
    SHIPPING_ADDRESS_OPTION: 'shippingAddressOption',
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
    ADDRESS_LINE_1: 'addressLine1',
    ADDRESS_LINE_2: 'addressLine2',
    COUNTRY: 'country',
    STATE: 'state',
    CITY: 'city',
    ZIP_POST_CODE: 'zipPostCode',
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
        [INPUT_IDS.SHIPPING_ADDRESS_OPTION]: ValueOf<typeof CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION>;
        [INPUT_IDS.LEGAL_FIRST_NAME]: string;
        [INPUT_IDS.LEGAL_LAST_NAME]: string;
        [INPUT_IDS.ADDRESS_LINE_1]: string;
        [INPUT_IDS.ADDRESS_LINE_2]: string;
        [INPUT_IDS.COUNTRY]: Country | '';
        [INPUT_IDS.STATE]: string;
        [INPUT_IDS.CITY]: string;
        [INPUT_IDS.ZIP_POST_CODE]: string;
    }
>;

export type {IssueNewExpensifyCardForm};
export default INPUT_IDS;
