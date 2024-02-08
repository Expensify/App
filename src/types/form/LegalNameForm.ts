import type Form from './Form';

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
} as const;

type LegalNameForm = Form<{
    [INPUT_IDS.LEGAL_FIRST_NAME]: string;
    [INPUT_IDS.LEGAL_LAST_NAME]: string;
}>;

export type {LegalNameForm};
export default INPUT_IDS;
