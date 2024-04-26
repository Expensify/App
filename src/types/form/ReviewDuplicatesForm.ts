import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    REVIEW_DUPLICATES_MERCHANT: 'reviewDuplicatesMerchant',
    REVIEW_DUPLICATES_CATEGORY: 'reviewDuplicatesCategory',
    REVIEW_DUPLICATES_TAG: 'reviewDuplicatesTag',
    REVIEW_DUPLICATES_DESCRIPTION: 'reviewDuplicatesDescription',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReviewDuplicatesForm = Form<
    InputID,
    {
        [INPUT_IDS.REVIEW_DUPLICATES_MERCHANT]: string;
        [INPUT_IDS.REVIEW_DUPLICATES_CATEGORY]: string;
        [INPUT_IDS.REVIEW_DUPLICATES_TAG]: string;
        [INPUT_IDS.REVIEW_DUPLICATES_DESCRIPTION]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {ReviewDuplicatesForm};
export default INPUT_IDS;
