import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    PRIVATE_NOTES: 'privateNotes',
} as const;

type PrivateNotesForm = Form<{
    [INPUT_IDS.PRIVATE_NOTES]: string;
}>;

export default PrivateNotesForm;
export {INPUT_IDS};
