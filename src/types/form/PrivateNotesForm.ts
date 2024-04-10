import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PRIVATE_NOTES: 'privateNotes',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PrivateNotesForm = Form<
    InputID,
    {
        [INPUT_IDS.PRIVATE_NOTES]: string;
    }
>;

export type {PrivateNotesForm};
export default INPUT_IDS;
