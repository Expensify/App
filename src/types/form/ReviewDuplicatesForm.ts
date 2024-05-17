import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    REVIEW_DUPLICATES: 'duplicates',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ReviewDuplicatesForm = Form<
    InputID,
    {
        [INPUT_IDS.REVIEW_DUPLICATES]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {ReviewDuplicatesForm};
export default INPUT_IDS;
