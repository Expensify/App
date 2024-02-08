import type Form from './Form';

const INPUT_IDS = {
    PRIVATE_NOTES: 'privateNotes',
} as const;

type PrivateNotesForm = Form<{
    [INPUT_IDS.PRIVATE_NOTES]: string;
}>;

export type {PrivateNotesForm};
export default INPUT_IDS;
