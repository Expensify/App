import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TRANSACTION_ID: 'transactionID',
    MERCHANT: 'merchant',
    CATEGORY: 'category',
    TAG: 'tag',
    DESCRIPTION: 'description',
    DUPLICATES: 'duplicates',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReviewDuplicatesForm = Form<
    InputID,
    {
        [INPUT_IDS.DUPLICATES]: string;
        [INPUT_IDS.TRANSACTION_ID]: string;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.DESCRIPTION]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {ReviewDuplicatesForm};
export default INPUT_IDS;
