import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DESCRIPTION: 'description',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchEditMultipleDescriptionForm = Form<
    InputID,
    {
        [INPUT_IDS.DESCRIPTION]: string;
    }
>;

export type {SearchEditMultipleDescriptionForm};
export default INPUT_IDS;
