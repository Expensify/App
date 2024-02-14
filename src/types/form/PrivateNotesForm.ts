import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    PRIVATE_NOTES: 'privateNotes',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type PrivateNotesForm = Form<
    InputIDs,
    {
        [INPUT_IDS.PRIVATE_NOTES]: string;
    }
>;

export type {PrivateNotesForm};
export default INPUT_IDS;
