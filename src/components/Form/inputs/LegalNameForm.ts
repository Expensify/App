import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
} as const;

type LegalNameForm = Form<{
    [INPUT_IDS.LEGAL_FIRST_NAME]: string;
    [INPUT_IDS.LEGAL_LAST_NAME]: string;
}>;

export default LegalNameForm;
export {INPUT_IDS};
